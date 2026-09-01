<template>
  <div class="min-h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans overflow-y-auto custom-scrollbar">

    <!-- Sticky Navigation / Header -->
    <div class="border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-black text-sm text-slate-900 dark:text-white tracking-tight">AccessEasy Patrol</span>
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                Operations Platform
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Flat ₹1,999 / site / month</p>
          </div>
        </div>

        <button
          class="h-9 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold transition-all text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          @click="router.push('/dashboard/settings/subscription')"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>My Subscription</span>
        </button>
      </div>
    </div>

    <!-- Main Content Container -->
    <main class="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10 space-y-12">

      <!-- Hero Header -->
      <div class="text-center space-y-4 max-w-3xl mx-auto pt-2">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Single Unified Security Platform · Zero Feature Gating</span>
        </div>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Scale Your Security Patrols <br />
          <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
            One Site at a Time
          </span>
        </h1>

        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Flat <strong>₹1,999 / site / month</strong>. Only pay for the physical sites you protect. <strong>Guards, checkpoints, live GPS tracking, dispatch & shift rosters are 100% Unlimited</strong>.
        </p>
      </div>

      <!-- Main Interactive Pricing Card -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" ref="pricingCardRef">
        
        <!-- Left: Interactive Capacity & Calculator (7 Cols) -->
        <div class="lg:col-span-7 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-between gap-8 relative overflow-hidden">
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="space-y-6">
            <!-- Card Header -->
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <span class="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Select Licensed Site Capacity
                </span>
                <h2 class="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  How many sites do you manage?
                </h2>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold text-slate-400 block">Monthly Rate</span>
                <span class="text-sm font-mono font-black text-slate-900 dark:text-white">
                  {{ currencySymbol }}{{ formattedUnitPrice }} <span class="text-xs font-normal text-slate-500">/site/mo</span>
                </span>
              </div>
            </div>

            <!-- Stepper + Range Slider Controls -->
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-4">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <span class="text-sm font-black text-slate-900 dark:text-white">Licensed Sites</span>
                  <p class="text-xs text-slate-500">Perimeter sites, branches, complexes or facilities</p>
                </div>

                <!-- Stepper Buttons -->
                <div class="flex items-center bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl p-1 shrink-0 shadow-sm">
                  <button
                    class="w-9 h-9 rounded-lg text-slate-700 dark:text-slate-200 font-black text-base flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                    :disabled="sitesCount <= 1"
                    @click="adjustSites(-1)"
                  >
                    −
                  </button>
                  <div class="flex items-baseline px-4 gap-1">
                    <input
                      type="number"
                      v-model.number="sitesCount"
                      min="1"
                      max="500"
                      class="w-12 bg-transparent text-center font-mono font-black text-lg text-slate-900 dark:text-white outline-none"
                      @blur="sanitizeSitesCount"
                    />
                    <span class="text-xs font-bold text-slate-500">
                      {{ sitesCount === 1 ? 'Site' : 'Sites' }}
                    </span>
                  </div>
                  <button
                    class="w-9 h-9 rounded-lg text-slate-700 dark:text-slate-200 font-black text-base flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                    @click="adjustSites(1)"
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- Interactive Range Slider -->
              <div class="pt-2">
                <input
                  type="range"
                  v-model.number="sitesCount"
                  min="1"
                  max="50"
                  class="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div class="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                  <span>1 Site</span>
                  <span>10 Sites</span>
                  <span>25 Sites</span>
                  <span>50+ Sites</span>
                </div>
              </div>

              <!-- Quick Presets -->
              <div class="flex items-center gap-2 pt-1">
                <span class="text-[11px] font-bold text-slate-400">Quick Select:</span>
                <button
                  v-for="preset in [1, 3, 5, 10, 20]"
                  :key="preset"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all border"
                  :class="sitesCount === preset ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-blue-500'"
                  @click="sitesCount = preset"
                >
                  {{ preset }} {{ preset === 1 ? 'Site' : 'Sites' }}
                </button>
              </div>
            </div>

            <!-- Currency Selector -->
            <div class="flex items-center justify-between text-xs px-1">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Selected Currency</span>
              <div class="flex gap-2">
                <button
                  class="px-3 py-1 rounded-lg font-bold transition-all"
                  :class="currency === 'INR' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'"
                  @click="currency = 'INR'"
                >
                  ₹ INR
                </button>
                <button
                  class="px-3 py-1 rounded-lg font-bold transition-all"
                  :class="currency === 'USD' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'"
                  @click="currency = 'USD'"
                >
                  $ USD
                </button>
              </div>
            </div>

            <!-- Calculation Breakdown Card -->
            <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-white/[0.02] dark:to-blue-950/20 border border-blue-100 dark:border-blue-500/20 space-y-3">
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-500 dark:text-slate-400">Monthly Unit Rate</span>
                <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {{ currencySymbol }}{{ formattedUnitPrice }} × {{ sitesCount }} {{ sitesCount === 1 ? 'Site' : 'Sites' }}
                </span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-500 dark:text-slate-400">Billing Cycle</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">
                  Monthly Subscription
                </span>
              </div>
              <div class="border-t border-slate-200/80 dark:border-white/10 pt-3 flex justify-between items-baseline">
                <div>
                  <span class="text-sm font-black text-slate-900 dark:text-white block">Total Monthly Amount</span>
                  <span class="text-[11px] text-slate-500">
                    Billed monthly for {{ sitesCount }} {{ sitesCount === 1 ? 'Site' : 'Sites' }}
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-3xl font-mono font-black text-blue-600 dark:text-blue-400">
                    {{ currencySymbol }}{{ totalPayable.toLocaleString() }}
                  </span>
                  <span class="text-xs font-semibold text-slate-400 block">/ month</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Checkout CTAs -->
          <div class="space-y-3 pt-2">
            <button
              class="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50"
              :disabled="isProcessingPayment"
              @click="openCheckoutModal"
            >
              <CreditCard class="w-5 h-5" />
              <span>{{ isProcessingPayment ? 'Processing...' : `Proceed to Payment (${currencySymbol}${totalPayable.toLocaleString()} / mo)` }}</span>
              <ArrowRight class="w-4 h-4" />
            </button>

            <!-- 1-Click Free Trial -->
            <button
              v-if="!isFreeTrialActive && !isPlanPaidActive"
              class="w-full h-11 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
              :disabled="isProcessingTrial"
              @click="handleStartFreeTrial"
            >
              <Zap class="w-4 h-4 text-blue-600" />
              <span>{{ isProcessingTrial ? 'Activating...' : 'Start 7-Day Free Trial (1 Site · Full Platform)' }}</span>
            </button>

            <!-- Trust Badges -->
            <div class="flex items-center justify-center gap-6 pt-2 text-[11px] text-slate-400 dark:text-slate-500">
              <span class="flex items-center gap-1.5"><Lock class="w-3.5 h-3.5 text-emerald-500" /> 256-Bit Razorpay Security</span>
              <span class="flex items-center gap-1.5"><Zap class="w-3.5 h-3.5 text-amber-500" /> Instant Activation</span>
              <span class="flex items-center gap-1.5"><CheckCircle2 class="w-3.5 h-3.5 text-blue-500" /> Cancel Anytime</span>
            </div>
          </div>

        </div>

        <!-- Right: What's Included in Every Site (5 Cols) -->
        <div class="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between gap-6 border border-slate-800 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="space-y-6">
            <div class="border-b border-white/10 pb-4">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2">
                ✓ 100% Unlimited Capabilities
              </div>
              <h3 class="text-xl font-black text-white tracking-tight">Included with Every Site</h3>
              <p class="text-xs text-slate-400 mt-1">Zero per-guard fees. Zero add-on surcharges.</p>
            </div>

            <!-- Rich Feature Badges List -->
            <div class="space-y-4">
              <div
                v-for="(feat, idx) in keyPlatformFeatures"
                :key="idx"
                class="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <component :is="feat.icon" class="w-4 h-4" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{{ feat.title }}</span>
                    <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      Unlimited
                    </span>
                  </h4>
                  <p class="text-[11px] text-slate-400 mt-0.5 leading-snug">{{ feat.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Comparison Matrix -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 class="text-lg font-black text-slate-900 dark:text-white">Patrol Feature Matrix</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Everything you need to run high-reliability security operations</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-100 dark:border-white/5 text-[11px] font-extrabold uppercase text-slate-400">
                <th class="py-3 px-4">Feature Capability</th>
                <th class="py-3 px-4">7-Day Free Trial</th>
                <th class="py-3 px-4 text-blue-600 dark:text-blue-400">Full Platform Subscription</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr>
                <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">Licensed Site Capacity</td>
                <td class="py-3.5 px-4 text-slate-500">1 Site Included</td>
                <td class="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">Scaled to Your Operations ({{ sitesCount }} Sites)</td>
              </tr>
              <tr>
                <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">Guards & Supervisor Accounts</td>
                <td class="py-3.5 px-4 text-emerald-600 font-semibold">✓ Unlimited</td>
                <td class="py-3.5 px-4 text-emerald-600 font-bold">✓ Unlimited (Zero Per-Guard Fees)</td>
              </tr>
              <tr>
                <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">QR & NFC Checkpoints</td>
                <td class="py-3.5 px-4 text-emerald-600 font-semibold">✓ Unlimited</td>
                <td class="py-3.5 px-4 text-emerald-600 font-bold">✓ Unlimited Checkpoints & Tags</td>
              </tr>
              <tr>
                <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">Live GPS Tracking & Breadcrumbs</td>
                <td class="py-3.5 px-4 text-emerald-600 font-semibold">✓ Included</td>
                <td class="py-3.5 px-4 text-emerald-600 font-bold">✓ Real-Time Live Map & Telemetry</td>
              </tr>
              <tr>
                <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">Automated Incident Escalation</td>
                <td class="py-3.5 px-4 text-emerald-600 font-semibold">✓ Included</td>
                <td class="py-3.5 px-4 text-emerald-600 font-bold">✓ Multi-Tier Fallback Engine</td>
              </tr>
              <tr>
                <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">24/7 Shift Scheduler & Rostering</td>
                <td class="py-3.5 px-4 text-emerald-600 font-semibold">✓ Included</td>
                <td class="py-3.5 px-4 text-emerald-600 font-bold">✓ Full Shift Rotation Matrix</td>
              </tr>
              <tr>
                <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">Supervisor Compliance Logs</td>
                <td class="py-3.5 px-4 text-slate-500">90-Day Retention</td>
                <td class="py-3.5 px-4 text-emerald-600 font-bold">✓ 1-Year Immutable Audit Trail</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">Frequently Asked Questions</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div class="space-y-1.5">
            <h4 class="font-bold text-slate-900 dark:text-white">How does site billing work?</h4>
            <p class="text-slate-500 leading-relaxed">
              You pay ₹1,999 / month for each licensed physical site or branch. All guards, checkpoints, routes, and software features are completely included without any extra charges.
            </p>
          </div>
          <div class="space-y-1.5">
            <h4 class="font-bold text-slate-900 dark:text-white">Are guards really unlimited?</h4>
            <p class="text-slate-500 leading-relaxed">
              Yes! You can add 10, 50, or 500+ security guards, dispatchers, and supervisors without paying a single rupee more per user.
            </p>
          </div>
          <div class="space-y-1.5">
            <h4 class="font-bold text-slate-900 dark:text-white">Can I add or remove sites anytime?</h4>
            <p class="text-slate-500 leading-relaxed">
              Yes, you can upgrade your licensed site capacity instantly at any time. Your new sites will be provisioned immediately.
            </p>
          </div>
          <div class="space-y-1.5">
            <h4 class="font-bold text-slate-900 dark:text-white">What payment methods are supported?</h4>
            <p class="text-slate-500 leading-relaxed">
              We support UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking via Razorpay, as well as direct UPI QR code transfers.
            </p>
          </div>
        </div>
      </div>

    </main>

    <!-- Checkout Modal (Razorpay + UPI) -->
    <Teleport to="body">
      <div v-if="showPaymentModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" @click.self="showPaymentModal = false">
        <div class="relative w-full max-w-lg bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in duration-200">
          
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <span class="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Secure Checkout</span>
              <h3 class="text-base font-black text-slate-900 dark:text-white mt-0.5">Confirm Patrol Subscription</h3>
            </div>
            <button class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 flex items-center justify-center" @click="showPaymentModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Checkout Tabs -->
          <div class="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
            <button
              :class="['flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center', paymentTab === 'online' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
              @click="paymentTab = 'online'"
            >
              💳 Razorpay (UPI, Cards, NetBanking)
            </button>
            <button
              v-if="currency === 'INR'"
              :class="['flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center', paymentTab === 'upi' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
              @click="paymentTab = 'upi'"
            >
              📱 Direct UPI QR
            </button>
          </div>

          <!-- Order Breakdown -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Plan Tier</span>
              <strong class="text-slate-800 dark:text-slate-200">AccessEasy Patrol Full Platform</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Licensed Sites</span>
              <strong class="text-slate-800 dark:text-slate-200">{{ sitesCount }} {{ sitesCount === 1 ? 'Site' : 'Sites' }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Billing Interval</span>
              <strong class="text-slate-800 dark:text-slate-200">Monthly Subscription</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Unit Rate</span>
              <strong class="text-slate-800 dark:text-slate-200">{{ currencySymbol }}{{ formattedUnitPrice }} / site / month</strong>
            </div>
            <div class="border-t border-slate-200 dark:border-white/10 pt-2 flex justify-between items-baseline">
              <span class="text-sm font-black text-slate-900 dark:text-white">Total Amount Due</span>
              <span class="text-2xl font-mono font-black text-blue-600 dark:text-blue-400">{{ currencySymbol }}{{ totalPayable.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Online Razorpay Flow -->
          <div v-if="paymentTab === 'online'" class="space-y-3">
            <button
              class="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              :disabled="isProcessingPayment"
              @click="initiateRazorpayPayment"
            >
              <div v-if="isProcessingPayment" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ isProcessingPayment ? 'Connecting Payment Gateway...' : `Pay ${currencySymbol}${totalPayable.toLocaleString()} via Razorpay` }}</span>
            </button>
            <p class="text-[10px] text-center text-slate-400">Supports Google Pay, PhonePe, Paytm, Visa, MasterCard & NetBanking</p>
          </div>

          <!-- UPI Direct QR Flow -->
          <div v-else class="text-center space-y-3">
            <div class="inline-block p-3 bg-white rounded-2xl shadow border border-slate-200">
              <img :src="dynamicUpiQrUrl" alt="UPI QR" class="w-40 h-40 object-contain mx-auto" />
            </div>
            <div class="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs">
              <span class="text-slate-500">UPI ID:</span>
              <span class="font-mono font-bold text-blue-600 dark:text-blue-400">{{ UPI_ID }}</span>
              <button class="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold" @click="copyUpiId">
                {{ copiedUpi ? 'Copied! ✓' : 'Copy' }}
              </button>
            </div>
            <a
              :href="whatsappProofLink"
              target="_blank"
              rel="noreferrer"
              class="w-full h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <MessageSquare class="w-4 h-4" />
              <span>Submit Payment Screenshot on WhatsApp</span>
            </a>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- Celebratory Payment Success Modal -->
    <Teleport to="body">
      <div
        v-if="showSuccessModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300"
      >
        <div class="relative w-full max-w-md bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
          
          <!-- Animated Checkmark -->
          <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 class="w-10 h-10 text-emerald-500 animate-bounce" />
          </div>

          <div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Payment Successful!</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your AccessEasy Patrol subscription for <strong>{{ paymentSuccessDetails.sites }} {{ paymentSuccessDetails.sites === 1 ? 'Site' : 'Sites' }}</strong> is now active.
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-2 text-xs">
            <div class="flex items-center justify-between text-slate-500">
              <span>Amount Paid:</span>
              <span class="font-bold text-slate-900 dark:text-white">{{ currencySymbol }}{{ paymentSuccessDetails.amount?.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-500">
              <span>Payment ID:</span>
              <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ paymentSuccessDetails.paymentId }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-500">
              <span>Status:</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase">Active &amp; Verified</span>
            </div>
          </div>

          <div class="space-y-2 pt-2">
            <button
              class="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              @click="router.push('/dashboard')"
            >
              Go to Command Center →
            </button>
            <button
              class="w-full h-10 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
              @click="router.push('/dashboard/settings/subscription')"
            >
              View Subscription Details
            </button>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { authService } from '@/services/authService';
import { usePlanStore } from '@/stores/usePlanStore';
import { paymentService } from '@/services/paymentService';
import { 
  ShieldCheck, CreditCard, ArrowLeft, ArrowRight, Sparkles, 
  Zap, Lock, CheckCircle2, MessageSquare, ExternalLink, X, 
  Users, Route, QrCode, Navigation, AlertCircle, Clock 
} from 'lucide-vue-next';

const router = useRouter();
const store = usePlanStore();
const pricingCardRef = ref(null);

const sitesCount = ref(1);
const currency = ref('INR');
const isProcessingPayment = ref(false);
const isProcessingTrial = ref(false);
const showPaymentModal = ref(false);
const showSuccessModal = ref(false);
const paymentSuccessDetails = ref({
  amount: 1999,
  sites: 1,
  paymentId: ''
});
const paymentTab = ref('online');
const copiedUpi = ref(false);

const UPI_ID = 'iwinxdigital@tmb';
const UPI_NAME = 'IWINX+DIGITAL+TECHNO';

const PRICING = {
  INR: 1999,
  USD: 24,
};

const currencySymbol = computed(() => (currency.value === 'INR' ? '₹' : '$'));

const formattedUnitPrice = computed(() => {
  return PRICING[currency.value].toLocaleString();
});

const totalPayable = computed(() => {
  return (Number(sitesCount.value) || 1) * PRICING[currency.value];
});

const isFreeTrialActive = computed(() => store.isTrial && !store.isExpired);
const isPlanPaidActive = computed(() => !store.isTrial && !store.isExpired && store.plan !== 'expired');

const keyPlatformFeatures = [
  { title: 'Unlimited Guard Accounts', desc: 'Add all security guards & supervisors with zero per-user fees.', icon: Users },
  { title: 'QR & NFC Checkpoint Library', desc: 'Generate tamper-proof checkpoints and NFC hardware tokens.', icon: QrCode },
  { title: 'Live Guard GPS & Breadcrumbs', desc: 'Real-time officer geolocation, speed, and boundary alarms.', icon: Navigation },
  { title: 'Automated Incident Escalation', desc: 'Multi-tier fallback alert engine for SOS and missed rounds.', icon: AlertCircle },
  { title: '24/7 Patrol Shift Rosters', desc: 'Complete guard shift matrix, fatigue checks, and compliance.', icon: Clock },
  { title: 'Unlimited Patrol Routes', desc: 'Design complex multi-checkpoint routes per facility.', icon: Route }
];

const dynamicUpiQrUrl = computed(() => {
  const upiUri = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${totalPayable.value}&cu=INR&tn=AccessEasy+Patrol+Subscription`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;
});

const whatsappProofLink = computed(() => {
  const tenantName = currentUserTenant.getTenantName() || 'Tenant';
  const text = `Hi AccessEasy Team, I have completed the subscription payment of ${currencySymbol.value}${totalPayable.value.toLocaleString()} for ${sitesCount.value} sites for Organization: ${tenantName}. Attached is my payment confirmation screenshot.`;
  return `https://wa.me/919442566276?text=${encodeURIComponent(text)}`;
});

function adjustSites(delta) {
  sitesCount.value = Math.max(1, sitesCount.value + delta);
}

function sanitizeSitesCount() {
  if (!sitesCount.value || sitesCount.value < 1) sitesCount.value = 1;
  if (sitesCount.value > 500) sitesCount.value = 500;
}

function openCheckoutModal() {
  showPaymentModal.value = true;
}

function copyUpiId() {
  navigator.clipboard?.writeText(UPI_ID);
  copiedUpi.value = true;
  setTimeout(() => (copiedUpi.value = false), 2000);
}

async function handleStartFreeTrial() {
  isProcessingTrial.value = true;
  try {
    await paymentService.startFreeTrial({ sitesCount: 1, days: 7 });
    paymentSuccessDetails.value = {
      amount: 0,
      sites: 1,
      paymentId: 'FREE_TRIAL_7_DAYS'
    };
    showSuccessModal.value = true;
    await currentUserTenant.refresh();
    await store.refreshPlan();
  } catch (error) {
    alert(`❌ Failed to start free trial: ${error.message}`);
  } finally {
    isProcessingTrial.value = false;
  }
}

async function initiateRazorpayPayment() {
  isProcessingPayment.value = true;
  try {
    const scriptLoaded = await paymentService.loadRazorpaySDK();
    if (!scriptLoaded) throw new Error('Could not load Razorpay SDK.');

    const orderData = await paymentService.createOrder({
      amount: totalPayable.value,
      currency: currency.value,
      sitesCount: sitesCount.value,
      billingCycle: 'monthly',
      planDetails: {
        plan_key: 'ez_patrol_platform',
        plan_name: 'AccessEasy Patrol Platform',
        sites: sitesCount.value,
      },
    });

    const options = {
      key: orderData.key_id || orderData.key || 'rzp_live_SFtdcXl5bOdexn',
      amount: (orderData.amount || totalPayable.value) * 100,
      currency: orderData.currency || currency.value,
      name: 'AccessEasy Patrol Platform',
      description: `Subscription for ${sitesCount.value} ${sitesCount.value === 1 ? 'Site' : 'Sites'} (Monthly)`,
      order_id: orderData.order_id || orderData.id,
      handler: async function (response) {
        try {
          await paymentService.verifyPayment({
            razorpayOrderId: response.razorpay_order_id || orderData.order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            paymentRecordId: orderData.payment_record_id,
            sitesCount: sitesCount.value,
            billingCycle: 'monthly',
            amount: totalPayable.value,
            currency: currency.value,
          });

          showPaymentModal.value = false;
          paymentSuccessDetails.value = {
            amount: totalPayable.value,
            sites: sitesCount.value,
            paymentId: response.razorpay_payment_id
          };
          showSuccessModal.value = true;

          await currentUserTenant.refresh();
          await store.refreshPlan();
        } catch (verifyError) {
          alert(`❌ Payment verification failed: ${verifyError.message}`);
        } finally {
          isProcessingPayment.value = false;
        }
      },
      prefill: {
        name: currentUserTenant.getTenantName() || 'AccessEasy Patrol Tenant',
        email: authService.getUserEmail() || '',
      },
      theme: { color: '#2563eb' },
      modal: {
        ondismiss: function () {
          isProcessingPayment.value = false;
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    alert(`❌ Checkout error: ${err.message}`);
    isProcessingPayment.value = false;
  }
}

onMounted(async () => {
  if (!store.ready) await store.initPlan();
  if (store.subscription?.sites) sitesCount.value = Number(store.subscription.sites) || 1;
});
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
    <!-- Header / Nav -->
    <header class="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <a href="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Shield class="w-5 h-5 text-white" />
          </div>
          <div>
            <span class="text-xl font-bold tracking-tight text-white">AccessEasy</span>
            <span class="text-xs ml-1.5 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Patrol</span>
          </div>
        </a>

        <div class="flex items-center gap-4">
          <a href="/login" class="text-sm font-semibold text-slate-300 hover:text-white transition">Sign In</a>
          <a
            href="/register"
            class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-24 pb-20 overflow-hidden">
      <!-- Glow Gradients -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div class="absolute top-1/3 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
          <Radio class="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          2026 Guard Tour Architecture Comparison
        </div>

        <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
          AccessEasy Patrol &amp; TrackTik:<br class="hidden sm:inline" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Comparing Guard Tour Approaches</span>
        </h1>

        <p class="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
          TrackTik is an internationally recognized leader in enterprise security workforce management and client billing. 
          <strong class="text-slate-200"> AccessEasy Patrol focuses on frontline agility</strong> — turning standard smartphones into NFC/QR patrol verification tools with native WhatsApp incident dispatch and flat per-site pricing.
        </p>

        <div class="flex flex-wrap justify-center gap-4">
          <a
            href="/register"
            class="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span>Start Free 14-Day Pilot</span>
            <ArrowRight class="w-4 h-4" />
          </a>
          <a
            href="#comparison-matrix"
            class="px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-800 transition"
          >
            View Side-by-Side Breakdown
          </a>
        </div>
      </div>
    </section>

    <!-- Key Metric Highlights -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <div class="text-3xl sm:text-4xl font-black text-cyan-400 mb-1">0</div>
          <div class="text-sm font-bold text-slate-200">Hardware Wand Needed</div>
          <div class="text-xs text-slate-400 mt-1">Uses standard Android &amp; iOS phones</div>
        </div>
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <div class="text-3xl sm:text-4xl font-black text-blue-400 mb-1">WhatsApp</div>
          <div class="text-sm font-bold text-slate-200">Native Incident Escalation</div>
          <div class="text-xs text-slate-400 mt-1">Instant photo &amp; audio alerts to managers</div>
        </div>
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <div class="text-3xl sm:text-4xl font-black text-cyan-400 mb-1">100%</div>
          <div class="text-sm font-bold text-slate-200">Offline Checkpoint Cache</div>
          <div class="text-xs text-slate-400 mt-1">Guaranteed scans in basements &amp; vaults</div>
        </div>
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <div class="text-3xl sm:text-4xl font-black text-blue-400 mb-1">Flat</div>
          <div class="text-sm font-bold text-slate-200">Per-Site Pricing</div>
          <div class="text-xs text-slate-400 mt-1">Unlimited guards and patrol checkpoints</div>
        </div>
      </div>
    </section>

    <!-- Comparison Matrix Section -->
    <section id="comparison-matrix" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
          Capability &amp; Architecture Matrix
        </h2>
        <p class="text-slate-400 max-w-2xl mx-auto">
          An objective look at how both platforms serve physical security and guard tour operations.
        </p>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 shadow-2xl">
        <table class="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr class="bg-slate-900/90 border-b border-slate-800">
              <th class="py-5 px-6 font-bold text-sm text-slate-300 w-2/5">Operational Dimension</th>
              <th class="py-5 px-6 font-bold text-sm text-cyan-400 bg-cyan-950/20 border-x border-cyan-900/40 w-3/10 text-center">
                AccessEasy Patrol (Agile Guard Tour)
              </th>
              <th class="py-5 px-6 font-bold text-sm text-slate-400 w-3/10 text-center">
                TrackTik (Enterprise Security Suite)
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            <tr v-for="(row, idx) in comparisonData" :key="idx" class="hover:bg-slate-800/30 transition-colors">
              <td class="py-5 px-6 align-top">
                <div class="font-bold text-slate-200 text-base mb-1">{{ row.dimension }}</div>
                <div class="text-xs text-slate-400 leading-relaxed">{{ row.detail }}</div>
              </td>
              <td class="py-5 px-6 bg-cyan-950/15 border-x border-cyan-900/30 text-center align-top">
                <div class="flex flex-col items-center">
                  <Check class="w-5 h-5 text-cyan-400 mb-1" />
                  <span class="text-xs font-semibold text-slate-200">{{ row.accesseasy }}</span>
                </div>
              </td>
              <td class="py-5 px-6 text-center align-top">
                <div class="flex flex-col items-center">
                  <span class="w-2 h-2 rounded-full bg-slate-500 mb-2 mt-1.5"></span>
                  <span class="text-xs text-slate-400">{{ row.tracktik }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 4 Architectural Pillars -->
    <section class="bg-slate-900/40 py-24 border-y border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 block">Engineering Highlights</span>
          <h2 class="text-3xl sm:text-4xl font-black text-white mb-4">
            Four Core Focus Areas of AccessEasy Patrol
          </h2>
          <p class="text-slate-400 max-w-2xl mx-auto">
            Built for security agencies, property managers, and facility teams prioritizing simplicity and instant alerts.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition">
            <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
              <Smartphone class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">1. Open Hardware &amp; Smartphone NFC/QR</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Eliminate dedicated guard wands and docking stations. Guards simply use their everyday Android or iPhone device to scan weatherproof NFC discs or tamper-proof QR checkpoints placed throughout the perimeter.
            </p>
          </div>

          <div class="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
              <MessageSquare class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">2. Instant WhatsApp Incident Dispatch</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              When a guard logs a broken window, water leak, or safety breach, photo and voice memos are dispatched instantly to the site supervisor's WhatsApp group. Response times drop from hours to seconds.
            </p>
          </div>

          <div class="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition">
            <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
              <MapPin class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">3. Geofenced Breadcrumb GPS &amp; Offline Cache</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              High-accuracy GPS breadcrumbs record exact patrol paths while consuming under 4% battery during a 12-hour shift. If a guard enters an underground basement or elevator shaft, scans are securely cached locally and auto-synced upon reconnecting.
            </p>
          </div>

          <div class="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
              <DollarSign class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">4. Transparent Per-Site Flat Pricing</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Unlike legacy systems that charge per guard user or per hardware terminal, AccessEasy Patrol offers straightforward per-site monthly tiers with unlimited guards, unlimited checkpoints, and unlimited patrol logs.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-black text-white mb-3">Frequently Asked Questions</h2>
        <p class="text-slate-400">Clear, transparent answers for security operations leaders and facilities managers.</p>
      </div>

      <div class="space-y-4">
        <div
          v-for="(faq, idx) in faqs"
          :key="idx"
          @click="toggleFaq(idx)"
          class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer transition hover:border-slate-700"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-200 text-base">{{ faq.q }}</h3>
            <span class="text-cyan-400 text-xl font-bold ml-4">{{ activeFaq === idx ? '−' : '+' }}</span>
          </div>
          <p v-if="activeFaq === idx" class="mt-4 text-slate-400 text-sm leading-relaxed">
            {{ faq.a }}
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="pb-24">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-cyan-900/50 via-slate-900 to-blue-900/50 border border-cyan-500/30 text-center relative overflow-hidden shadow-2xl">
          <h2 class="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Modernize Your Guard Patrols?
          </h2>
          <p class="text-slate-300 max-w-xl mx-auto mb-8 text-base">
            Set up your first site in 15 minutes. No specialized wands, no contract lock-ins, and free NFC checkpoint discs on trial activation.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <a
              href="/register"
              class="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/25 transition transform hover:-translate-y-0.5"
            >
              Start Free 14-Day Pilot →
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  Shield,
  Radio,
  ArrowRight,
  Check,
  Smartphone,
  MessageSquare,
  MapPin,
  DollarSign
} from 'lucide-vue-next';

const activeFaq = ref(null);

const toggleFaq = (idx) => {
  activeFaq.value = activeFaq.value === idx ? null : idx;
};

const comparisonData = [
  {
    dimension: 'Primary Target & Architecture',
    accesseasy: 'Frontline Smartphone Guard Tour & WhatsApp Alerts',
    tracktik: 'Enterprise Security Workforce Management & Back-Office Suite',
    detail: 'TrackTik provides comprehensive back-office dispatch, contract invoicing, and guard billing for large international operations. AccessEasy Patrol specializes in agile, frictionless tour verification via everyday smartphones.'
  },
  {
    dimension: 'Checkpoint Verification Hardware',
    accesseasy: 'Standard smartphone NFC discs & tamper-proof QR codes',
    tracktik: 'Ruggedized mobile devices & specialized scan hardware',
    detail: 'AccessEasy Patrol operates on any Android or iOS device without purchasing expensive proprietary scanners or wands.'
  },
  {
    dimension: 'Incident Escalation Workflow',
    accesseasy: 'Instant WhatsApp media messages to supervisors & client groups',
    tracktik: 'In-app portal notifications & enterprise email dispatch',
    detail: 'Managers and clients receive instant photographic evidence and audio notes directly in WhatsApp where they are already active.'
  },
  {
    dimension: 'GPS Tracking & Battery Optimization',
    accesseasy: 'Motion-sensing breadcrumbs (<4% battery consumption over 12 hrs)',
    tracktik: 'Continuous GPS tracking optimized for enterprise fleets',
    detail: 'Both platforms provide high-precision geolocation tracking with geofence checkpoint barriers.'
  },
  {
    dimension: 'Offline Mode in Basements / Vaults',
    accesseasy: '100% offline-first local cache (auto-syncs on reconnect)',
    tracktik: 'Offline mobile guard tour data caching',
    detail: 'Both systems reliably capture checkpoint scans in dead zones, underground parking levels, and remote perimeters.'
  },
  {
    dimension: 'Pricing & Account Structure',
    accesseasy: 'Transparent flat per-site plans (unlimited guards)',
    tracktik: 'Enterprise multi-module pricing with user/guard volume tiers',
    detail: 'AccessEasy Patrol allows security agencies to add and swap guards freely without incurring additional per-seat licensing fees.'
  }
];

const faqs = [
  {
    q: 'How does AccessEasy Patrol compare with TrackTik?',
    a: 'TrackTik is a robust enterprise platform designed for large multi-regional security guard corporations requiring deep client billing, complex payroll integrations, and back-office dispatch. AccessEasy Patrol is engineered for property managers, security agencies, and facility teams who want fast, reliable checkpoint verification on standard smartphones, live WhatsApp incident alerts, and flat per-site pricing.'
  },
  {
    q: 'Do guards need special hardware wands or scanners?',
    a: 'No. AccessEasy Patrol works on standard Android and iPhone smartphones. Guards simply tap lightweight, durable NFC tags or scan dynamic QR checkpoints placed around the perimeter.'
  },
  {
    q: 'What happens if a guard patrols an area with zero cellular connectivity?',
    a: 'AccessEasy Patrol operates with an offline-first architecture. Scans, timestamps, photos, and incident notes are securely encrypted and stored on the device, then instantly uploaded to the cloud once network connectivity is restored.'
  },
  {
    q: 'Can client property managers receive automated reports?',
    a: 'Yes. Daily summary reports and incident logs can be scheduled for automated delivery via email or sent directly to management WhatsApp channels.'
  }
];
</script>

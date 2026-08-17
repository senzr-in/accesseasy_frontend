<template>
  <div class="patrol-landing" id="patrol-landing-root">
    <!-- ── NAV ─────────────────────────────────────────── -->
    <nav class="patrol-nav" :class="{ 'patrol-nav--scrolled': scrolled }">
      <div class="patrol-nav__inner">
        <div class="patrol-nav__brand">
          <div class="patrol-nav__icon">
            <Shield class="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span class="patrol-nav__logo-text">AccessEasy</span>
            <span class="patrol-nav__logo-accent">PATROL</span>
          </div>
        </div>

        <div class="patrol-nav__links">
          <a href="#features" class="patrol-nav__link" @click.prevent="scrollTo('features')">Features</a>
          <a href="#how-it-works" class="patrol-nav__link" @click.prevent="scrollTo('how-it-works')">How It Works</a>
          <a href="#stats" class="patrol-nav__link" @click.prevent="scrollTo('stats')">Stats</a>
          <a href="#pricing" class="patrol-nav__link" @click.prevent="scrollTo('pricing')">Pricing</a>
        </div>

        <div class="patrol-nav__ctas">
          <button class="patrol-btn patrol-btn--ghost" @click="goToLogin">Sign In</button>
          <button class="patrol-btn patrol-btn--primary" @click="goToLogin">
            <span>Get Started</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Mobile hamburger -->
        <button class="patrol-nav__hamburger" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Menu">
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6 text-white" />
          <X v-else class="w-6 h-6 text-white" />
        </button>
      </div>

      <!-- Mobile menu -->
      <Transition name="slide-down">
        <div v-if="mobileMenuOpen" class="patrol-nav__mobile">
          <a href="#features" class="patrol-nav__mobile-link" @click="mobileMenuOpen = false; scrollTo('features')">Features</a>
          <a href="#how-it-works" class="patrol-nav__mobile-link" @click="mobileMenuOpen = false; scrollTo('how-it-works')">How It Works</a>
          <a href="#stats" class="patrol-nav__mobile-link" @click="mobileMenuOpen = false; scrollTo('stats')">Stats</a>
          <div class="patrol-nav__mobile-ctas">
            <button class="patrol-btn patrol-btn--ghost w-full" @click="goToLogin">Sign In</button>
            <button class="patrol-btn patrol-btn--primary w-full" @click="goToLogin">Get Started Free</button>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- ── HERO ───────────────────────────────────────── -->
    <section class="patrol-hero" id="patrol-hero">
      <!-- Background -->
      <div class="patrol-hero__bg" :style="{ backgroundImage: `url(${heroBg})` }" />
      <div class="patrol-hero__overlay" />

      <!-- Animated grid -->
      <div class="patrol-hero__grid" />

      <!-- Radar sweep -->
      <div class="patrol-hero__radar">
        <div class="patrol-hero__radar-circle patrol-hero__radar-circle--1" />
        <div class="patrol-hero__radar-circle patrol-hero__radar-circle--2" />
        <div class="patrol-hero__radar-sweep" />
      </div>

      <!-- Floating particles -->
      <div class="patrol-hero__particle patrol-hero__particle--1" />
      <div class="patrol-hero__particle patrol-hero__particle--2" />
      <div class="patrol-hero__particle patrol-hero__particle--3" />

      <div class="patrol-hero__content">
        <!-- Live badge -->
        <div class="patrol-hero__badge patrol-anim-fade-up" style="--delay:0ms">
          <span class="patrol-hero__badge-dot" />
          <span>LIVE Security Operations Platform</span>
          <span class="patrol-hero__badge-sep">•</span>
          <span class="text-cyan-300">v2.0 Now Available</span>
        </div>

        <!-- Headline -->
        <h1 class="patrol-hero__headline patrol-anim-fade-up" style="--delay:100ms">
          One Platform.<br />
          <span class="patrol-hero__headline-accent">Every Patrol.</span><br />
          Real-Time Security.
        </h1>

        <p class="patrol-hero__sub patrol-anim-fade-up" style="--delay:200ms">
          Connect your security command center with guards operating on the ground.
          Manage multi-site patrol tours, NFC/QR checkpoints, live GPS tracking,
          and instant incident reporting — all in one unified system.
        </p>

        <!-- CTA buttons -->
        <div class="patrol-hero__ctas patrol-anim-fade-up" style="--delay:300ms">
          <button class="patrol-btn patrol-btn--hero" @click="goToLogin" id="patrol-hero-cta-primary">
            <div class="patrol-btn__gloss" />
            <ShieldCheck class="w-5 h-5" />
            <span>Start Free Trial</span>
            <ArrowRight class="w-4 h-4" />
          </button>
          <button class="patrol-btn patrol-btn--hero-outline" @click="scrollTo('how-it-works')" id="patrol-hero-cta-secondary">
            <Play class="w-4 h-4" />
            <span>See How It Works</span>
          </button>
        </div>

        <!-- Social proof row -->
        <div class="patrol-hero__social-proof patrol-anim-fade-up" style="--delay:400ms">
          <div class="patrol-hero__avatars">
            <div v-for="i in 5" :key="i" class="patrol-hero__avatar" :style="{ left: `${(i-1)*18}px`, background: avatarColors[i-1] }">
              {{ avatarInitials[i-1] }}
            </div>
          </div>
          <div class="patrol-hero__social-text">
            <div class="patrol-hero__stars">★★★★★</div>
            <span class="text-slate-300 text-xs">Trusted by <strong class="text-white">500+</strong> Security Teams</span>
          </div>
        </div>
      </div>

      <!-- Hero image (infographic) -->
      <div class="patrol-hero__image patrol-anim-fade-up" style="--delay:200ms">
        <div class="patrol-hero__image-glow" />
        <img :src="infographicHero" alt="AccessEasy Patrol Platform Overview" class="patrol-hero__img" />

        <!-- Floating stat pills -->
        <div class="patrol-hero__stat-pill patrol-hero__stat-pill--tl patrol-anim-float-slow">
          <div class="patrol-hero__stat-pill-icon bg-emerald-500/20">
            <Radio class="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div class="patrol-hero__stat-pill-label">LIVE PATROLS</div>
            <div class="patrol-hero__stat-pill-value text-emerald-400">12 Active</div>
          </div>
        </div>

        <div class="patrol-hero__stat-pill patrol-hero__stat-pill--tr patrol-anim-float-delayed">
          <div class="patrol-hero__stat-pill-icon bg-cyan-500/20">
            <MapPin class="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div class="patrol-hero__stat-pill-label">CHECKPOINTS</div>
            <div class="patrol-hero__stat-pill-value text-cyan-400">86 Verified</div>
          </div>
        </div>

        <div class="patrol-hero__stat-pill patrol-hero__stat-pill--bl patrol-anim-float-slow" style="animation-delay:-3s">
          <div class="patrol-hero__stat-pill-icon bg-amber-500/20">
            <AlertTriangle class="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div class="patrol-hero__stat-pill-label">INCIDENTS</div>
            <div class="patrol-hero__stat-pill-value text-amber-400">3 Reported</div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="patrol-hero__scroll" @click="scrollTo('features')">
        <ChevronDown class="w-5 h-5 text-cyan-400 animate-bounce" />
        <span>Scroll to explore</span>
      </div>
    </section>

    <!-- ── LOGO STRIP ─────────────────────────────────── -->
    <section class="patrol-logos">
      <p class="patrol-logos__label">TRUSTED BY ENTERPRISE SECURITY TEAMS</p>
      <div class="patrol-logos__track-wrap">
        <div class="patrol-logos__track">
          <div v-for="(logo, i) in logoItems" :key="i" class="patrol-logos__item">
            <component :is="logo.icon" class="w-5 h-5 text-slate-400 mr-2" />
            <span>{{ logo.name }}</span>
          </div>
          <div v-for="(logo, i) in logoItems" :key="`dup-${i}`" class="patrol-logos__item" aria-hidden="true">
            <component :is="logo.icon" class="w-5 h-5 text-slate-400 mr-2" />
            <span>{{ logo.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FEATURES ───────────────────────────────────── -->
    <section class="patrol-section patrol-features" id="features">
      <div class="patrol-section__inner">
        <div class="patrol-section__header">
          <div class="patrol-section__eyebrow">
            <Zap class="w-4 h-4 text-cyan-400" />
            <span>PLATFORM CAPABILITIES</span>
          </div>
          <h2 class="patrol-section__title">
            Everything Your Security Team Needs
          </h2>
          <p class="patrol-section__sub">
            From ground-level guard mobile apps to executive-level command dashboards —
            AccessEasy Patrol covers every layer of your security operations.
          </p>
        </div>

        <div class="patrol-features__grid">
          <div
            v-for="(feat, idx) in features"
            :key="idx"
            class="patrol-feature-card"
            :class="{ 'patrol-feature-card--featured': feat.featured }"
          >
            <div class="patrol-feature-card__icon-wrap" :style="{ background: feat.iconBg }">
              <component :is="feat.icon" class="w-6 h-6" :style="{ color: feat.iconColor }" />
            </div>
            <div>
              <h3 class="patrol-feature-card__title">{{ feat.title }}</h3>
              <p class="patrol-feature-card__desc">{{ feat.desc }}</p>
            </div>
            <div v-if="feat.featured" class="patrol-feature-card__badge">
              <Star class="w-3 h-3 mr-1" />
              Featured
            </div>
            <ul class="patrol-feature-card__list">
              <li v-for="(bullet, bi) in feat.bullets" :key="bi">
                <CheckCircle2 class="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{{ bullet }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ── HOW IT WORKS ───────────────────────────────── -->
    <section class="patrol-section patrol-how" id="how-it-works">
      <div class="patrol-section__inner">
        <div class="patrol-section__header">
          <div class="patrol-section__eyebrow">
            <ClipboardList class="w-4 h-4 text-cyan-400" />
            <span>WORKFLOW</span>
          </div>
          <h2 class="patrol-section__title">How It Works</h2>
          <p class="patrol-section__sub">
            A streamlined 5-step security workflow connecting admin command centers with guards in the field.
          </p>
        </div>

        <div class="patrol-how__steps">
          <div
            v-for="(step, idx) in steps"
            :key="idx"
            class="patrol-how__step"
          >
            <div v-if="idx < steps.length - 1" class="patrol-how__connector" />
            <div class="patrol-how__step-num">{{ String(idx + 1).padStart(2, '0') }}</div>
            <div class="patrol-how__step-icon-wrap" :style="{ background: step.bg }">
              <component :is="step.icon" class="w-7 h-7" :style="{ color: step.color }" />
            </div>
            <h3 class="patrol-how__step-title">{{ step.title }}</h3>
            <p class="patrol-how__step-desc">{{ step.desc }}</p>
          </div>
        </div>

        <!-- Image showcase -->
        <div class="patrol-how__showcase">
          <div class="patrol-how__showcase-image-wrap">
            <div class="patrol-how__showcase-glow" />
            <img :src="posterBg" alt="AccessEasy Patrol Guard App" class="patrol-how__showcase-image" />
          </div>
          <div class="patrol-how__showcase-content">
            <div class="patrol-section__eyebrow">
              <Smartphone class="w-4 h-4 text-cyan-400" />
              <span>GUARD MOBILE APP</span>
            </div>
            <h3 class="patrol-how__showcase-title">
              Empowering Guards with the Right Tools
            </h3>
            <p class="patrol-how__showcase-text">
              Guards receive patrol assignments directly on their mobile device.
              The app guides them through each checkpoint — scanning NFC tags or QR codes,
              logging GPS coordinates, capturing photo evidence, and reporting incidents in real-time.
            </p>
            <div class="patrol-how__showcase-bullets">
              <div v-for="(b, i) in appBullets" :key="i" class="patrol-how__showcase-bullet">
                <component :is="b.icon" class="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{{ b.text }}</span>
              </div>
            </div>
            <button class="patrol-btn patrol-btn--primary mt-6" @click="goToLogin">
              Try Guard App Demo
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── STATS ──────────────────────────────────────── -->
    <section class="patrol-section patrol-stats" id="stats">
      <div class="patrol-stats__bg-glow patrol-stats__bg-glow--1" />
      <div class="patrol-stats__bg-glow patrol-stats__bg-glow--2" />

      <div class="patrol-section__inner">
        <div class="patrol-section__header">
          <div class="patrol-section__eyebrow">
            <BarChart3 class="w-4 h-4 text-cyan-400" />
            <span>PLATFORM METRICS</span>
          </div>
          <h2 class="patrol-section__title">Security at Scale</h2>
        </div>

        <div class="patrol-stats__grid">
          <div v-for="(stat, i) in stats" :key="i" class="patrol-stat-card">
            <div class="patrol-stat-card__value">{{ formatStat(stat) }}</div>
            <div class="patrol-stat-card__label">{{ stat.label }}</div>
            <div class="patrol-stat-card__sub">{{ stat.sub }}</div>
          </div>
        </div>

        <!-- Testimonial -->
        <div class="patrol-testimonial">
          <div class="patrol-testimonial__stars">★★★★★</div>
          <blockquote class="patrol-testimonial__quote">
            "AccessEasy Patrol transformed how we manage guard tours across our 14 facilities.
            Real-time visibility and NFC checkpoints cut our compliance incidents by 60%."
          </blockquote>
          <div class="patrol-testimonial__author">
            <div class="patrol-testimonial__avatar">RM</div>
            <div>
              <div class="patrol-testimonial__name">Ravi Mehta</div>
              <div class="patrol-testimonial__role">Head of Security Operations · TechPark Facilities</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── PRICING ─────────────────────────────────────── -->
    <section class="patrol-section patrol-pricing" id="pricing">
      <div class="patrol-section__inner">
        <div class="patrol-section__header">
          <div class="patrol-section__eyebrow">
            <Layers class="w-4 h-4 text-cyan-400" />
            <span>PLANS</span>
          </div>
          <h2 class="patrol-section__title">Simple, Transparent Pricing</h2>
          <p class="patrol-section__sub">
            No hidden fees. Scale as your team grows. All plans include the Guard Mobile App.
          </p>
        </div>

        <div class="patrol-pricing__grid">
          <div
            v-for="(plan, i) in plans"
            :key="i"
            class="patrol-plan-card"
            :class="{ 'patrol-plan-card--popular': plan.popular }"
          >
            <div v-if="plan.popular" class="patrol-plan-card__badge">
              <Star class="w-3 h-3 mr-1" />
              Most Popular
            </div>
            <div class="patrol-plan-card__name">{{ plan.name }}</div>
            <div class="patrol-plan-card__price">
              <span class="patrol-plan-card__currency">₹</span>
              <span class="patrol-plan-card__amount">{{ plan.price }}</span>
              <span class="patrol-plan-card__period">/mo per site</span>
            </div>
            <p class="patrol-plan-card__desc">{{ plan.desc }}</p>
            <ul class="patrol-plan-card__features">
              <li v-for="(f, fi) in plan.features" :key="fi">
                <CheckCircle2 class="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{{ f }}</span>
              </li>
            </ul>
            <button
              class="patrol-btn w-full mt-auto"
              :class="plan.popular ? 'patrol-btn--primary' : 'patrol-btn--outline'"
              @click="goToLogin"
            >
              {{ plan.cta }}
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA BANNER ─────────────────────────────────── -->
    <section class="patrol-cta" id="patrol-cta">
      <div class="patrol-cta__glow" />
      <div class="patrol-cta__grid" />
      <div class="patrol-cta__inner">
        <div class="patrol-cta__badge">
          <span class="patrol-cta__badge-dot" />
          <span>Deployment in under 24 hours</span>
        </div>
        <h2 class="patrol-cta__title">
          Ready to Modernize Your<br />
          <span class="patrol-cta__title-accent">Patrol Operations?</span>
        </h2>
        <p class="patrol-cta__sub">
          Join 500+ security teams already using AccessEasy Patrol. Start your free trial today — no credit card required.
        </p>
        <div class="patrol-cta__buttons">
          <button class="patrol-btn patrol-btn--hero" @click="goToLogin" id="patrol-cta-primary">
            <div class="patrol-btn__gloss" />
            <ShieldCheck class="w-5 h-5" />
            <span>Start Free Trial</span>
            <ArrowRight class="w-4 h-4" />
          </button>
          <button class="patrol-btn patrol-btn--hero-outline" @click="goToLogin" id="patrol-cta-demo">
            <span>Schedule a Demo</span>
          </button>
        </div>
        <div class="patrol-cta__assurances">
          <div v-for="(a, i) in assurances" :key="i" class="patrol-cta__assurance">
            <component :is="a.icon" class="w-4 h-4 text-cyan-400" />
            <span>{{ a.text }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ─────────────────────────────────────── -->
    <footer class="patrol-footer">
      <div class="patrol-footer__inner">
        <div class="patrol-footer__brand">
          <div class="patrol-nav__brand mb-3">
            <div class="patrol-nav__icon">
              <Shield class="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span class="patrol-nav__logo-text">AccessEasy</span>
              <span class="patrol-nav__logo-accent">PATROL</span>
            </div>
          </div>
          <p class="patrol-footer__tagline">
            Guard Mobile App · Tour Verification · Real-Time Security
          </p>
          <div class="patrol-footer__social">
            <a href="#" aria-label="LinkedIn" class="patrol-footer__social-link"><Linkedin class="w-4 h-4" /></a>
            <a href="#" aria-label="Twitter" class="patrol-footer__social-link"><Twitter class="w-4 h-4" /></a>
            <a href="#" aria-label="Email" class="patrol-footer__social-link"><Mail class="w-4 h-4" /></a>
          </div>
        </div>

        <div class="patrol-footer__links-col">
          <div class="patrol-footer__col-title">Product</div>
          <a href="#features" class="patrol-footer__link" @click.prevent="scrollTo('features')">Features</a>
          <a href="#how-it-works" class="patrol-footer__link" @click.prevent="scrollTo('how-it-works')">How It Works</a>
          <a href="#pricing" class="patrol-footer__link" @click.prevent="scrollTo('pricing')">Pricing</a>
          <a href="#" class="patrol-footer__link">Changelog</a>
        </div>

        <div class="patrol-footer__links-col">
          <div class="patrol-footer__col-title">Security</div>
          <a href="#" class="patrol-footer__link">Guard App</a>
          <a href="#" class="patrol-footer__link">NFC Checkpoints</a>
          <a href="#" class="patrol-footer__link">QR Patrol Routes</a>
          <a href="#" class="patrol-footer__link">Incident Reports</a>
        </div>

        <div class="patrol-footer__links-col">
          <div class="patrol-footer__col-title">Company</div>
          <a href="#" class="patrol-footer__link">About</a>
          <a href="#" class="patrol-footer__link">Contact</a>
          <a href="#" class="patrol-footer__link">Privacy Policy</a>
          <a href="#" class="patrol-footer__link">Terms of Service</a>
        </div>
      </div>
      <div class="patrol-footer__bottom">
        <span>© {{ new Date().getFullYear() }} AccessEasy Patrol. All rights reserved.</span>
        <span class="patrol-footer__powered">Powered by AccessEasy Security Platform</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Shield, ShieldCheck, ArrowRight, Play, Radio, MapPin,
  AlertTriangle, ChevronDown, Menu, X, Zap, CheckCircle2,
  Globe, Smartphone, ClipboardList, Nfc, ScanFace,
  Building2, BarChart3, Star, Layers, Mail, Linkedin, Twitter,
  Lock, FileCheck, Users, Clock, Wifi, Camera
} from 'lucide-vue-next';

import heroBg from '@/assets/images/patrol_hero_bg.png';
import infographicHero from '@/assets/images/patrol_infographic_hero.png';
import posterBg from '@/assets/images/patrol_guard_poster.png';

const router = useRouter();
const scrolled = ref(false);
const mobileMenuOpen = ref(false);

function goToLogin() {
  router.push({ name: 'Login' });
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function onScroll() {
  scrolled.value = window.scrollY > 40;
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));

// ── Data ──────────────────────────────────────────────────────────────────

const avatarColors = ['#1d4ed8', '#0891b2', '#059669', '#7c3aed', '#be123c'];
const avatarInitials = ['RM', 'SK', 'PV', 'AG', 'TN'];

const logoItems = [
  { name: 'TechPark Facilities', icon: Building2 },
  { name: 'Metro Security Corps', icon: Shield },
  { name: 'SafeGuard Pro', icon: ShieldCheck },
  { name: 'SecureOps India', icon: Lock },
  { name: 'InfraPatrol Ltd', icon: Globe },
  { name: 'GuardNet Systems', icon: Wifi },
  { name: 'VaultShield Security', icon: FileCheck },
  { name: 'EliteGuard Corp', icon: Users },
];

const features = [
  {
    icon: Globe,
    iconBg: 'rgba(14,165,233,0.15)',
    iconColor: '#38bdf8',
    title: 'Multi-Site Patrol Operations',
    desc: 'Manage security tours across multiple physical locations and geographical sites from a single unified command center.',
    bullets: ['Unlimited site configurations', 'Per-site guard assignment', 'Cross-site analytics & reporting'],
    featured: false,
  },
  {
    icon: Smartphone,
    iconBg: 'rgba(16,185,129,0.15)',
    iconColor: '#34d399',
    title: 'Guard Mobile App',
    desc: 'Guards receive patrol assignments on their phone and execute tours with step-by-step checkpoint guidance.',
    bullets: ['Offline-capable tour execution', 'Real-time push notifications', 'Photo & evidence capture'],
    featured: true,
  },
  {
    icon: Nfc,
    iconBg: 'rgba(139,92,246,0.15)',
    iconColor: '#a78bfa',
    title: 'NFC & QR Checkpoints',
    desc: 'Physical checkpoints verified via NFC tap or QR scan — tamper-proof proof-of-presence for every guard.',
    bullets: ['NFC tag instant verification', 'QR code checkpoint scan', 'GPS-locked location logging'],
    featured: false,
  },
  {
    icon: AlertTriangle,
    iconBg: 'rgba(245,158,11,0.15)',
    iconColor: '#fbbf24',
    title: 'Incident Management',
    desc: 'Guards trigger real-time SOS alerts, capture photo evidence, and file detailed incident reports from the field.',
    bullets: ['One-tap SOS emergency alert', 'Photo & video evidence upload', 'Instant admin notification'],
    featured: false,
  },
  {
    icon: BarChart3,
    iconBg: 'rgba(59,130,246,0.15)',
    iconColor: '#60a5fa',
    title: 'Command Center Dashboard',
    desc: 'Full visibility into all active patrols, guard locations, checkpoint compliance, and incidents in real-time.',
    bullets: ['Live patrol status map', 'Guard attendance & shift logs', 'Compliance & audit reports'],
    featured: false,
  },
  {
    icon: ScanFace,
    iconBg: 'rgba(244,63,94,0.15)',
    iconColor: '#fb7185',
    title: 'AI Guard Verification',
    desc: 'Optional biometric face verification ensures the right guard is at the right location — no buddy-punching.',
    bullets: ['Face AI liveness check', 'Guard identity confirmation', 'Attendance fraud prevention'],
    featured: false,
  },
];

const steps = [
  {
    icon: Building2,
    bg: 'rgba(14,165,233,0.2)',
    color: '#38bdf8',
    title: 'Configure Sites & Routes',
    desc: 'Admin sets up patrol routes, checkpoint locations, and schedules for each physical facility.',
  },
  {
    icon: Users,
    bg: 'rgba(16,185,129,0.2)',
    color: '#34d399',
    title: 'Assign Guards',
    desc: 'Assign guards to specific shifts and patrol routes. Guards receive instant mobile app notifications.',
  },
  {
    icon: Smartphone,
    bg: 'rgba(139,92,246,0.2)',
    color: '#a78bfa',
    title: 'Guards Execute Patrols',
    desc: 'Guards follow the guided tour on their phone — tapping NFC tags or scanning QR codes at each checkpoint.',
  },
  {
    icon: AlertTriangle,
    bg: 'rgba(245,158,11,0.2)',
    color: '#fbbf24',
    title: 'Report Incidents',
    desc: 'Any anomaly is logged instantly with photos, GPS location, and timestamps — pushed to command in seconds.',
  },
  {
    icon: BarChart3,
    bg: 'rgba(59,130,246,0.2)',
    color: '#60a5fa',
    title: 'Review & Audit',
    desc: 'Generate compliance reports, audit patrol histories, and export logs for regulatory requirements.',
  },
];

const appBullets = [
  { icon: MapPin, text: 'GPS-tracked route guidance with live map' },
  { icon: Nfc, text: 'NFC & QR checkpoint scan with proof-of-presence' },
  { icon: Camera, text: 'Photo evidence capture on-the-spot' },
  { icon: AlertTriangle, text: 'One-tap SOS incident reporting' },
  { icon: Clock, text: 'Offline-first — works without mobile data' },
];

const stats = [
  { value: 500, suffix: '+', label: 'Security Teams', sub: 'Active organizations on the platform' },
  { value: 12000, suffix: '+', label: 'Daily Checkpoints', sub: 'Verified across all patrol routes' },
  { value: 98, suffix: '%', label: 'Compliance Rate', sub: 'Average patrol completion accuracy' },
  { value: 60, suffix: '%', label: 'Incident Reduction', sub: 'Vs. manual paper-based systems' },
];

function formatStat(stat) {
  return `${stat.value.toLocaleString()}${stat.suffix}`;
}

const plans = [
  {
    name: 'Starter',
    price: '4,999',
    desc: 'Perfect for single-site security teams just getting started.',
    popular: false,
    cta: 'Start Free Trial',
    features: [
      'Up to 10 guards',
      '1 site / facility',
      'QR checkpoint scanning',
      'Basic incident reporting',
      'Web command dashboard',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    price: '12,999',
    desc: 'For growing security operations with multiple sites and advanced needs.',
    popular: true,
    cta: 'Get Started',
    features: [
      'Unlimited guards',
      'Up to 10 sites',
      'NFC + QR checkpoints',
      'Live GPS patrol tracking',
      'Advanced incident management',
      'Analytics & audit reports',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For large-scale deployments with bespoke integrations and SLA guarantees.',
    popular: false,
    cta: 'Contact Sales',
    features: [
      'Unlimited everything',
      'Dedicated account manager',
      'Face AI guard verification',
      'Custom integrations & API',
      'SLA-backed uptime',
      'On-site training & onboarding',
      '24/7 phone support',
    ],
  },
];

const assurances = [
  { icon: Shield, text: 'No credit card required' },
  { icon: Clock, text: '14-day free trial' },
  { icon: Lock, text: '256-bit encryption' },
  { icon: CheckCircle2, text: 'Cancel anytime' },
];
</script>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────────── */
.patrol-landing {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  background-color: #030614;
  color: rgb(241 245 249);
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* ── Animations ────────────────────────────────────────────────────── */
.patrol-anim-fade-up {
  animation: patrolFadeUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--delay, 0ms);
}
@keyframes patrolFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.patrol-anim-float-slow {
  animation: patrolFloatSlow 6s ease-in-out infinite alternate;
}
.patrol-anim-float-delayed {
  animation: patrolFloatSlow 7s ease-in-out infinite alternate;
  animation-delay: -3s;
}
@keyframes patrolFloatSlow {
  from { transform: translateY(0); }
  to   { transform: translateY(-10px); }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Nav ───────────────────────────────────────────────────────────── */
.patrol-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 50;
  transition: all 0.3s;
  padding: 1rem 0;
}
.patrol-nav--scrolled {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(30, 41, 59, 0.6);
  background: rgba(3, 6, 20, 0.85);
  padding: 0.625rem 0;
}

.patrol-nav__inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.patrol-nav__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: default;
}
.patrol-nav__icon {
  height: 2.25rem;
  width: 2.25rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(96, 165, 250, 0.4);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(59,130,246,0.25), rgba(14,165,233,0.15));
}
.patrol-nav__logo-text { font-size: 1.125rem; font-weight: 900; color: white; letter-spacing: -0.025em; }
.patrol-nav__logo-accent { font-size: 1.125rem; font-weight: 900; color: #22d3ee; letter-spacing: -0.025em; margin-left: 0.25rem; }

.patrol-nav__links {
  display: none;
  align-items: center;
  gap: 1.75rem;
}
@media (min-width: 1024px) {
  .patrol-nav__links { display: flex; }
}
.patrol-nav__link {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(203 213 225);
  text-decoration: none;
  transition: color 0.2s;
}
.patrol-nav__link:hover { color: #22d3ee; }

.patrol-nav__ctas {
  display: none;
  align-items: center;
  gap: 0.75rem;
}
@media (min-width: 1024px) { .patrol-nav__ctas { display: flex; } }

.patrol-nav__hamburger {
  display: flex;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
}
.patrol-nav__hamburger:hover { background: rgba(30,41,59,0.6); }
@media (min-width: 1024px) { .patrol-nav__hamburger { display: none; } }

.patrol-nav__mobile {
  padding: 0.5rem 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid rgba(30,41,59,0.6);
  background: rgba(3,6,20,0.95);
}
.patrol-nav__mobile-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(226 232 240);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background 0.2s;
}
.patrol-nav__mobile-link:hover { background: rgba(30,41,59,0.6); }
.patrol-nav__mobile-ctas {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* ── Buttons ───────────────────────────────────────────────────────── */
.patrol-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.875rem;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
  padding: 0.625rem 1.25rem;
}
.patrol-btn--primary {
  background: linear-gradient(135deg, #002884, #0052cc, #0070f3);
  color: white;
  box-shadow: 0 8px 25px rgba(0,82,204,0.45);
}
.patrol-btn--primary:hover {
  box-shadow: 0 10px 30px rgba(0,82,204,0.6);
  transform: scale(1.02);
}
.patrol-btn--ghost {
  background: transparent;
  color: rgb(203 213 225);
  border: none;
}
.patrol-btn--ghost:hover {
  color: white;
  background: rgba(30,41,59,0.6);
}
.patrol-btn--outline {
  background: transparent;
  color: #22d3ee;
  border: 1px solid rgba(6,182,212,0.4);
}
.patrol-btn--outline:hover {
  background: rgba(6,182,212,0.1);
  border-color: #22d3ee;
}
.patrol-btn--hero {
  position: relative;
  overflow: hidden;
  color: white;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.025em;
  background: linear-gradient(135deg, #002884, #0052cc, #0070f3);
  box-shadow: 0 10px 35px rgba(0,82,204,0.5), 0 0 20px rgba(0,102,255,0.3);
}
.patrol-btn--hero:hover {
  box-shadow: 0 14px 40px rgba(0,82,204,0.65);
  transform: scale(1.02);
}
.patrol-btn--hero-outline {
  color: white;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 700;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
}
.patrol-btn--hero-outline:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.35);
}
.patrol-btn__gloss {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%);
  transform: translateX(-100%);
  transition: transform 0.8s ease;
}
.patrol-btn--hero:hover .patrol-btn__gloss { transform: translateX(200%); }

/* ── Hero ──────────────────────────────────────────────────────────── */
.patrol-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 7rem 1.5rem 4rem;
  overflow: hidden;
}
@media (min-width: 1024px) {
  .patrol-hero {
    flex-direction: row;
  }
}

.patrol-hero__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  pointer-events: none;
  z-index: 0;
}
.patrol-hero__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(135deg, rgba(3,6,20,0.85) 0%, rgba(7,19,48,0.7) 50%, rgba(3,6,20,0.9) 100%);
}
.patrol-hero__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.1;
  background-image: radial-gradient(circle at 2px 2px, rgba(6,182,212,0.9) 1px, transparent 0);
  background-size: 32px 32px;
}

.patrol-hero__radar {
  position: absolute;
  top: 25%;
  left: 25%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.15;
}
.patrol-hero__radar-circle {
  position: absolute;
  top: 0; left: 0;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(6,182,212,0.4);
  box-shadow: 0 0 15px rgba(6,182,212,0.15);
}
.patrol-hero__radar-circle--1 { width: 280px; height: 280px; }
.patrol-hero__radar-circle--2 { width: 520px; height: 520px; }
.patrol-hero__radar-sweep {
  position: absolute;
  top: 0; left: 0;
  width: 520px; height: 520px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(6,182,212,0.35) 0deg, transparent 60deg, transparent 360deg);
  animation: radarRotate 10s linear infinite;
}
@keyframes radarRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
}

.patrol-hero__particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%);
  animation: patrolParticle 12s ease-in-out infinite alternate;
}
.patrol-hero__particle--1 { width: 200px; height: 200px; top: 15%; left: 5%; animation-delay: 0s; }
.patrol-hero__particle--2 { width: 150px; height: 150px; bottom: 20%; left: 30%; animation-delay: -4s; }
.patrol-hero__particle--3 { width: 120px; height: 120px; top: 60%; left: 20%; animation-delay: -8s; }
@keyframes patrolParticle {
  from { transform: translate(0,0) scale(1); opacity: 0.3; }
  50%  { transform: translate(30px,-40px) scale(1.2); opacity: 0.6; }
  to   { transform: translate(-20px,25px) scale(0.8); opacity: 0.25; }
}

.patrol-hero__content {
  position: relative;
  z-index: 10;
  max-width: 42rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}
@media (min-width: 1024px) {
  .patrol-hero__content { padding-right: 3rem; }
}

.patrol-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a5f3fc;
  letter-spacing: 0.05em;
  background: rgba(59,130,246,0.2);
  border: 1px solid rgba(59,130,246,0.35);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 15px rgba(59,130,246,0.2);
  width: fit-content;
}
.patrol-hero__badge-dot {
  height: 0.5rem; width: 0.5rem;
  border-radius: 50%;
  background: #22d3ee;
  animation: ping 1s cubic-bezier(0,0,0.2,1) infinite;
}
@keyframes ping {
  75%,100% { transform: scale(2); opacity: 0; }
}
.patrol-hero__badge-sep { color: rgb(100 116 139); }

.patrol-hero__headline {
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: white;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
}
.patrol-hero__headline-accent {
  color: #22d3ee;
  text-shadow: 0 0 30px rgba(6,182,212,0.5);
}

.patrol-hero__sub {
  font-size: 0.9375rem;
  color: rgb(203 213 225);
  line-height: 1.7;
  max-width: 36rem;
}

.patrol-hero__ctas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.patrol-hero__social-proof {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.patrol-hero__avatars {
  position: relative;
  height: 36px;
  width: 90px;
  flex-shrink: 0;
}
.patrol-hero__avatar {
  position: absolute;
  top: 0;
  height: 2.25rem;
  width: 2.25rem;
  border-radius: 50%;
  border: 2px solid #030614;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.625rem;
  font-weight: 900;
}
.patrol-hero__stars { color: #fbbf24; font-size: 0.875rem; letter-spacing: 0.1em; }

.patrol-hero__image {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2.5rem;
  max-width: 36rem;
  width: 100%;
}
@media (min-width: 1024px) { .patrol-hero__image { margin-top: 0; } }

.patrol-hero__image-glow {
  position: absolute;
  inset: 0;
  border-radius: 1.5rem;
  pointer-events: none;
  background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(14,165,233,0.2), transparent);
  filter: blur(40px);
}
.patrol-hero__img {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 32rem;
  border-radius: 1rem;
  box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.15);
}

.patrol-hero__stat-pill {
  position: absolute;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 1rem;
  background: rgba(3,6,20,0.75);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
.patrol-hero__stat-pill--tl { top: 5%; left: -5%; }
.patrol-hero__stat-pill--tr { top: 15%; right: -5%; }
.patrol-hero__stat-pill--bl { bottom: 20%; left: -8%; }
.patrol-hero__stat-pill-icon {
  height: 2.25rem; width: 2.25rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.patrol-hero__stat-pill-label {
  font-size: 0.5625rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: rgb(148 163 184);
  text-transform: uppercase;
}
.patrol-hero__stat-pill-value { font-size: 0.875rem; font-weight: 900; }

.patrol-hero__scroll {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  color: rgb(100 116 139);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}
.patrol-hero__scroll:hover { color: #22d3ee; }

/* ── Logo strip ────────────────────────────────────────────────────── */
.patrol-logos {
  padding: 2rem 0;
  border-top: 1px solid rgba(30,41,59,0.6);
  border-bottom: 1px solid rgba(30,41,59,0.6);
  overflow: hidden;
  background: rgba(7,19,48,0.4);
}
.patrol-logos__label {
  text-align: center;
  font-size: 0.625rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: rgb(71 85 105);
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}
.patrol-logos__track-wrap {
  overflow: hidden;
}
.patrol-logos__track {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  white-space: nowrap;
  animation: marquee 30s linear infinite;
}
.patrol-logos__item {
  display: flex;
  align-items: center;
  color: rgb(71 85 105);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  flex-shrink: 0;
}
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ── Section shared ────────────────────────────────────────────────── */
.patrol-section {
  padding: 5rem 0;
  position: relative;
}
@media (min-width: 640px) { .patrol-section { padding: 7rem 0; } }

.patrol-section__inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.patrol-section__header {
  text-align: center;
  margin-bottom: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.patrol-section__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: #22d3ee;
  text-transform: uppercase;
}
.patrol-section__title {
  font-size: clamp(1.875rem, 4vw, 3rem);
  font-weight: 900;
  color: white;
  letter-spacing: -0.025em;
}
.patrol-section__sub {
  font-size: 0.9375rem;
  color: rgb(148 163 184);
  max-width: 42rem;
  line-height: 1.7;
}

/* ── Features ──────────────────────────────────────────────────────── */
.patrol-features {
  background: linear-gradient(180deg, transparent 0%, rgba(7,19,48,0.3) 50%, transparent 100%);
}
.patrol-features__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
@media (min-width: 640px) { .patrol-features__grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .patrol-features__grid { grid-template-columns: repeat(3, 1fr); } }

.patrol-feature-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(59,130,246,0.2);
  background: rgba(7,19,48,0.6);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  cursor: default;
}
.patrol-feature-card:hover {
  border-color: rgba(6,182,212,0.5);
  background: rgba(7,19,48,0.85);
  transform: translateY(-4px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 25px rgba(6,182,212,0.1);
}
.patrol-feature-card--featured {
  border-color: rgba(6,182,212,0.45);
  box-shadow: 0 0 30px rgba(6,182,212,0.12);
}
.patrol-feature-card__icon-wrap {
  height: 3rem; width: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.1);
}
.patrol-feature-card__title { font-size: 1rem; font-weight: 700; color: white; }
.patrol-feature-card__desc { font-size: 0.75rem; color: rgb(148 163 184); line-height: 1.6; }
.patrol-feature-card__badge {
  position: absolute;
  top: 1rem; right: 1rem;
  display: inline-flex;
  align-items: center;
  font-size: 0.625rem;
  font-weight: 900;
  color: #22d3ee;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(6,182,212,0.15);
  border: 1px solid rgba(6,182,212,0.3);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.patrol-feature-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: auto;
  list-style: none;
  padding: 0;
}
.patrol-feature-card__list li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgb(203 213 225);
}

/* ── How It Works ──────────────────────────────────────────────────── */
.patrol-how { background: rgba(3,6,20,0.8); }

.patrol-how__steps {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 5rem;
}
@media (min-width: 640px) { .patrol-how__steps { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .patrol-how__steps { grid-template-columns: repeat(5, 1fr); } }

.patrol-how__step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}
.patrol-how__connector {
  display: none;
  position: absolute;
  top: 4rem;
  left: 60%;
  right: -40%;
  height: 1px;
  background: linear-gradient(90deg, rgba(6,182,212,0.5), rgba(6,182,212,0.1));
}
@media (min-width: 1024px) { .patrol-how__connector { display: block; } }

.patrol-how__step-num {
  font-size: 0.625rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: rgba(34,211,238,0.6);
}
.patrol-how__step-icon-wrap {
  height: 3.5rem; width: 3.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.patrol-how__step-title { font-size: 0.875rem; font-weight: 700; color: white; }
.patrol-how__step-desc { font-size: 0.75rem; color: rgb(148 163 184); line-height: 1.6; }

.patrol-how__showcase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  padding-top: 4rem;
  border-top: 1px solid rgba(30,41,59,0.6);
}
@media (min-width: 1024px) { .patrol-how__showcase { flex-direction: row; } }

.patrol-how__showcase-image-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.patrol-how__showcase-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 1.5rem;
  background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(14,165,233,0.2), transparent);
  filter: blur(35px);
}
.patrol-how__showcase-image {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 24rem;
  border-radius: 1rem;
  box-shadow: 0 30px 70px rgba(0,0,0,0.6), 0 0 35px rgba(6,182,212,0.12);
}
.patrol-how__showcase-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.patrol-how__showcase-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  color: white;
}
.patrol-how__showcase-text { font-size: 0.875rem; color: rgb(148 163 184); line-height: 1.7; }
.patrol-how__showcase-bullets { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem; }
.patrol-how__showcase-bullet { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: rgb(203 213 225); }

/* ── Stats ─────────────────────────────────────────────────────────── */
.patrol-stats {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(7,19,48,0.8), rgba(3,6,20,0.95));
}
.patrol-stats__bg-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(100px);
}
.patrol-stats__bg-glow--1 {
  width: 500px; height: 500px;
  top: 0; left: 25%;
  transform: translateX(-50%);
  background: rgba(14,165,233,0.1);
}
.patrol-stats__bg-glow--2 {
  width: 400px; height: 400px;
  bottom: 0; right: 25%;
  transform: translateX(50%);
  background: rgba(59,130,246,0.08);
}

.patrol-stats__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 4rem;
}
@media (min-width: 1024px) { .patrol-stats__grid { grid-template-columns: repeat(4, 1fr); } }

.patrol-stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(30,41,59,0.6);
  background: rgba(7,19,48,0.5);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}
.patrol-stat-card:hover {
  border-color: rgba(6,182,212,0.3);
  box-shadow: 0 0 30px rgba(6,182,212,0.1);
}
.patrol-stat-card__value {
  font-size: clamp(2.25rem, 5vw, 3rem);
  font-weight: 900;
  color: #22d3ee;
  margin-bottom: 0.5rem;
}
.patrol-stat-card__label { font-size: 0.875rem; font-weight: 700; color: white; margin-bottom: 0.25rem; }
.patrol-stat-card__sub { font-size: 0.75rem; color: rgb(100 116 139); }

.patrol-testimonial {
  max-width: 42rem;
  margin: 0 auto;
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(30,41,59,0.6);
  background: rgba(7,19,48,0.6);
  backdrop-filter: blur(10px);
}
.patrol-testimonial__stars { color: #fbbf24; font-size: 1.125rem; margin-bottom: 1rem; }
.patrol-testimonial__quote { font-size: 0.9375rem; color: rgb(226 232 240); font-style: italic; line-height: 1.7; margin-bottom: 1.5rem; }
.patrol-testimonial__author { display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
.patrol-testimonial__avatar {
  height: 2.5rem; width: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 900;
  background: linear-gradient(135deg, #1d4ed8, #0891b2);
}
.patrol-testimonial__name { font-size: 0.875rem; font-weight: 700; color: white; text-align: left; }
.patrol-testimonial__role { font-size: 0.75rem; color: rgb(148 163 184); text-align: left; }

/* ── Pricing ────────────────────────────────────────────────────────── */
.patrol-pricing { background: rgba(3,6,20,0.9); }

.patrol-pricing__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}
@media (min-width: 768px) { .patrol-pricing__grid { grid-template-columns: repeat(3, 1fr); } }

.patrol-plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.75rem;
  border-radius: 1rem;
  border: 1px solid rgba(59,130,246,0.2);
  background: rgba(7,19,48,0.7);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}
.patrol-plan-card:hover {
  border-color: rgba(6,182,212,0.4);
  transform: translateY(-4px);
}
.patrol-plan-card--popular {
  border-color: rgba(6,182,212,0.55) !important;
  box-shadow: 0 0 35px rgba(6,182,212,0.15);
}
.patrol-plan-card__badge {
  position: absolute;
  top: -0.75rem; left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  font-size: 0.625rem;
  font-weight: 900;
  color: #22d3ee;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 1rem;
  border-radius: 999px;
  background: #030614;
  border: 1px solid rgba(6,182,212,0.5);
  white-space: nowrap;
}
.patrol-plan-card__name { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.2em; color: #22d3ee; text-transform: uppercase; }
.patrol-plan-card__price { display: flex; align-items: flex-end; gap: 0.25rem; }
.patrol-plan-card__currency { font-size: 1.25rem; font-weight: 900; color: rgb(148 163 184); margin-bottom: 0.25rem; }
.patrol-plan-card__amount { font-size: 2.5rem; font-weight: 900; color: white; }
.patrol-plan-card__period { font-size: 0.75rem; color: rgb(148 163 184); margin-bottom: 0.375rem; }
.patrol-plan-card__desc { font-size: 0.75rem; color: rgb(148 163 184); line-height: 1.6; }
.patrol-plan-card__features {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  flex: 1;
  list-style: none;
  padding: 0;
}
.patrol-plan-card__features li {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  font-size: 0.8125rem;
  color: rgb(203 213 225);
}

/* ── CTA Banner ─────────────────────────────────────────────────────── */
.patrol-cta {
  position: relative;
  padding: 6rem 0;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(0,40,132,0.5) 0%, rgba(3,6,20,0.95) 60%);
}
@media (min-width: 640px) { .patrol-cta { padding: 8rem 0; } }

.patrol-cta__glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 700px; height: 400px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(ellipse, rgba(0,82,204,0.3), transparent 70%);
  filter: blur(60px);
}
.patrol-cta__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.06;
  background-image: radial-gradient(circle at 2px 2px, rgba(6,182,212,1) 1px, transparent 0);
  background-size: 32px 32px;
}
.patrol-cta__inner {
  position: relative;
  z-index: 10;
  max-width: 48rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}
.patrol-cta__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #a5f3fc;
  background: rgba(6,182,212,0.15);
  border: 1px solid rgba(6,182,212,0.3);
}
.patrol-cta__badge-dot {
  height: 0.5rem; width: 0.5rem;
  border-radius: 50%;
  background: #22d3ee;
  animation: ping 1s cubic-bezier(0,0,0.2,1) infinite;
}
.patrol-cta__title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  color: white;
}
.patrol-cta__title-accent {
  color: #22d3ee;
  text-shadow: 0 0 30px rgba(6,182,212,0.5);
}
.patrol-cta__sub { font-size: 0.9375rem; color: rgb(203 213 225); max-width: 36rem; }
.patrol-cta__buttons { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 1rem; }
.patrol-cta__assurances { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 1.25rem; margin-top: 0.5rem; }
.patrol-cta__assurance { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: rgb(100 116 139); font-weight: 500; }

/* ── Footer ─────────────────────────────────────────────────────────── */
.patrol-footer {
  border-top: 1px solid rgba(30,41,59,0.6);
  background: rgba(3,6,20,0.98);
}
.patrol-footer__inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 3.5rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}
@media (min-width: 640px) { .patrol-footer__inner { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .patrol-footer__inner { grid-template-columns: 2fr repeat(3, 1fr); } }

.patrol-footer__brand { display: flex; flex-direction: column; }
.patrol-footer__tagline { font-size: 0.75rem; color: rgb(71 85 105); line-height: 1.7; margin-bottom: 1rem; }
.patrol-footer__social { display: flex; align-items: center; gap: 0.75rem; }
.patrol-footer__social-link {
  height: 2rem; width: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(71 85 105);
  text-decoration: none;
  transition: all 0.2s;
}
.patrol-footer__social-link:hover { color: #22d3ee; background: rgba(30,41,59,1); }

.patrol-footer__links-col { display: flex; flex-direction: column; gap: 0.75rem; }
.patrol-footer__col-title { font-size: 0.6875rem; font-weight: 900; letter-spacing: 0.2em; color: rgb(100 116 139); text-transform: uppercase; margin-bottom: 0.25rem; }
.patrol-footer__link { font-size: 0.8125rem; color: rgb(71 85 105); text-decoration: none; transition: color 0.2s; }
.patrol-footer__link:hover { color: #22d3ee; }

.patrol-footer__bottom {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(30,41,59,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgb(51 65 85);
}
@media (min-width: 640px) { .patrol-footer__bottom { flex-direction: row; } }
.patrol-footer__powered { color: rgb(30 41 59); }
</style>

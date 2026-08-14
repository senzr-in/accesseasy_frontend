<template>
  <div class="space-y-4 mb-6">
    <!-- ── Hero Stat Band (2 High-Priority Cards) ── -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Hero 1: Currently Inside -->
      <div class="hero-card hero-card--emerald group">
        <!-- Decorative ambient blob -->
        <div class="hero-card__blob hero-card__blob--emerald" />
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <span class="live-dot live-dot--emerald">
                <span class="live-dot__ring" />
                <span class="live-dot__core" />
              </span>
              <span class="hero-card__label hero-card__label--emerald">Currently Inside</span>
            </div>
            <span class="hero-badge hero-badge--emerald">Live Occupancy</span>
          </div>
          <div class="flex items-end justify-between gap-4">
            <div>
              <div
                ref="insideCountEl"
                class="hero-card__number"
              >
                126
              </div>
              <p class="hero-card__sub">
                Active on-premise workforce occupants
              </p>
            </div>
            <!-- Animated Sparkline -->
            <div class="w-32 h-12 shrink-0">
              <svg
                class="w-full h-full overflow-visible"
                viewBox="0 0 100 30"
              >
                <defs>
                  <linearGradient
                    id="sparkEmeraldGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stop-color="#10b981"
                      stop-opacity="0.35"
                    />
                    <stop
                      offset="100%"
                      stop-color="#10b981"
                      stop-opacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M0,25 Q20,20 40,15 T70,8 T100,5 L100,30 L0,30 Z"
                  fill="url(#sparkEmeraldGrad)"
                />
                <path
                  class="sparkline-path"
                  d="M0,25 Q20,20 40,15 T70,8 T100,5"
                  fill="none"
                  stroke="#10b981"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  pathLength="1"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero 2: Access Denied -->
      <div class="hero-card hero-card--rose group">
        <div class="hero-card__blob hero-card__blob--rose" />
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <ShieldAlert class="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span class="hero-card__label hero-card__label--rose">Access Denied Today</span>
            </div>
            <span class="hero-badge hero-badge--rose">2.7% Rate</span>
          </div>
          <div class="flex items-end justify-between gap-4">
            <div>
              <div class="hero-card__number hero-card__number--rose">
                23
              </div>
              <p class="hero-card__sub">
                Failed/Rejected authentication events
              </p>
            </div>
            <div class="w-32 h-12 shrink-0">
              <svg
                class="w-full h-full overflow-visible"
                viewBox="0 0 100 30"
              >
                <defs>
                  <linearGradient
                    id="sparkRoseGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stop-color="#f43f5e"
                      stop-opacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stop-color="#f43f5e"
                      stop-opacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M0,10 Q30,25 60,12 T100,22 L100,30 L0,30 Z"
                  fill="url(#sparkRoseGrad)"
                />
                <path
                  class="sparkline-path"
                  d="M0,10 Q30,25 60,12 T100,22"
                  fill="none"
                  stroke="#f43f5e"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  pathLength="1"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Secondary Compact KPI Grid (6 Stats) ── -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <!-- Total Employees -->
      <div class="kpi-card kpi-card--indigo">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Total Employees</span>
          <div class="kpi-card__icon kpi-card__icon--indigo">
            <Users class="w-3.5 h-3.5" />
          </div>
        </div>
        <div class="kpi-card__footer">
          <span class="kpi-card__value">1,248</span>
          <span class="kpi-badge kpi-badge--up">+4.2%</span>
        </div>
      </div>

      <!-- Total Devices -->
      <div class="kpi-card kpi-card--blue">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Total Devices</span>
          <div class="kpi-card__icon kpi-card__icon--blue">
            <HardDrive class="w-3.5 h-3.5" />
          </div>
        </div>
        <div class="kpi-card__footer">
          <span class="kpi-card__value">86</span>
          <span class="kpi-badge kpi-badge--neutral">Readers</span>
        </div>
      </div>

      <!-- Active Devices -->
      <div class="kpi-card kpi-card--emerald">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Active Devices</span>
          <div class="kpi-card__icon kpi-card__icon--emerald">
            <Activity class="w-3.5 h-3.5" />
          </div>
        </div>
        <div class="kpi-card__footer">
          <span class="kpi-card__value">79 <span class="kpi-card__value--sub">/ 86</span></span>
          <span class="kpi-badge kpi-badge--up">91.8%</span>
        </div>
      </div>

      <!-- Inactive Devices -->
      <div class="kpi-card kpi-card--amber">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Inactive Devices</span>
          <div class="kpi-card__icon kpi-card__icon--amber">
            <AlertTriangle class="w-3.5 h-3.5" />
          </div>
        </div>
        <div class="kpi-card__footer">
          <span class="kpi-card__value">7</span>
          <span class="kpi-badge kpi-badge--warn">Offline</span>
        </div>
      </div>

      <!-- Today's Entries -->
      <div class="kpi-card kpi-card--teal">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Today's Entries</span>
          <div class="kpi-card__icon kpi-card__icon--teal">
            <LogIn class="w-3.5 h-3.5" />
          </div>
        </div>
        <div class="kpi-card__footer">
          <span class="kpi-card__value">842</span>
          <span class="kpi-badge kpi-badge--up">+12%</span>
        </div>
      </div>

      <!-- Today's Exits -->
      <div class="kpi-card kpi-card--sky">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Today's Exits</span>
          <div class="kpi-card__icon kpi-card__icon--sky">
            <LogOut class="w-3.5 h-3.5" />
          </div>
        </div>
        <div class="kpi-card__footer">
          <span class="kpi-card__value">716</span>
          <span class="kpi-badge kpi-badge--up">+8%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Users, HardDrive, Activity, AlertTriangle, LogIn, LogOut, ShieldAlert } from 'lucide-vue-next';
</script>

<style scoped>
/* ─── CSS Custom Properties ───────────────────────────── */
:root {
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ─── Hero Cards ──────────────────────────────────────── */
.hero-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid;
  cursor: default;
  transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
.hero-card:hover {
  transform: translateY(-3px);
}

.hero-card--emerald {
  background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(236,253,245,0.85) 100%);
  border-color: rgba(16, 185, 129, 0.25);
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.08), 0 1px 3px rgba(0,0,0,0.04);
}
.hero-card--emerald:hover {
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.16), 0 2px 8px rgba(0,0,0,0.06);
}
:global(.dark) .hero-card--emerald {
  background: linear-gradient(135deg, rgba(21,28,44,0.9) 0%, rgba(6,46,36,0.5) 100%);
  border-color: rgba(16, 185, 129, 0.18);
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.06), inset 0 1px 0 rgba(255,255,255,0.04);
}
:global(.dark) .hero-card--emerald:hover {
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.12), inset 0 1px 0 rgba(255,255,255,0.06);
}

.hero-card--rose {
  background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,241,242,0.85) 100%);
  border-color: rgba(244, 63, 94, 0.22);
  box-shadow: 0 2px 12px rgba(244, 63, 94, 0.07), 0 1px 3px rgba(0,0,0,0.04);
}
.hero-card--rose:hover {
  box-shadow: 0 8px 32px rgba(244, 63, 94, 0.14), 0 2px 8px rgba(0,0,0,0.06);
}
:global(.dark) .hero-card--rose {
  background: linear-gradient(135deg, rgba(21,28,44,0.9) 0%, rgba(43,10,18,0.5) 100%);
  border-color: rgba(244, 63, 94, 0.16);
  box-shadow: 0 2px 12px rgba(244, 63, 94, 0.05), inset 0 1px 0 rgba(255,255,255,0.04);
}
:global(.dark) .hero-card--rose:hover {
  box-shadow: 0 8px 32px rgba(244, 63, 94, 0.10), inset 0 1px 0 rgba(255,255,255,0.06);
}

/* Ambient decorative blob */
.hero-card__blob {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  right: -40px;
  bottom: -50px;
  pointer-events: none;
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
}
.hero-card:hover .hero-card__blob {
  transform: scale(1.12);
}
.hero-card__blob--emerald {
  background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
}
.hero-card__blob--rose {
  background: radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%);
}

.hero-card__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hero-card__label--emerald { color: #065f46; }
:global(.dark) .hero-card__label--emerald { color: #6ee7b7; }
.hero-card__label--rose { color: #9f1239; }
:global(.dark) .hero-card__label--rose { color: #fda4af; }

.hero-card__number {
  font-size: 44px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
:global(.dark) .hero-card__number { color: #f8fafc; }
.hero-card__number--rose { color: #e11d48; }
:global(.dark) .hero-card__number--rose { color: #fb7185; }

.hero-card__sub {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  margin-top: 4px;
}

/* Hero badges */
.hero-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 999px;
}
.hero-badge--emerald {
  background: rgba(16,185,129,0.12);
  color: #059669;
  border: 1px solid rgba(16,185,129,0.2);
}
:global(.dark) .hero-badge--emerald {
  background: rgba(16,185,129,0.15);
  color: #34d399;
  border-color: rgba(16,185,129,0.25);
}
.hero-badge--rose {
  background: rgba(244,63,94,0.1);
  color: #e11d48;
  border: 1px solid rgba(244,63,94,0.18);
}
:global(.dark) .hero-badge--rose {
  background: rgba(244,63,94,0.14);
  color: #fb7185;
  border-color: rgba(244,63,94,0.22);
}

/* Live dot */
.live-dot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
}
.live-dot__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: livePulse 2s ease-in-out infinite;
}
.live-dot__core {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.live-dot--emerald .live-dot__ring { background: rgba(16,185,129,0.35); }
.live-dot--emerald .live-dot__core { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.6); }

@keyframes livePulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.8); opacity: 0; }
}

/* Sparkline animation */
.sparkline-path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: drawLine 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
}
@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

/* ─── KPI Cards ───────────────────────────────────────── */
.kpi-card {
  background: rgba(255,255,255,0.85);
  border: 1px solid rgba(226,232,240,0.8);
  border-radius: 16px;
  padding: 16px;
  cursor: default;
  transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1),
              border-color 300ms;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
:global(.dark) .kpi-card {
  background: rgba(21,28,44,0.85);
  border-color: rgba(255,255,255,0.07);
  box-shadow: 0 1px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04);
}
:global(.dark) .kpi-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
}

.kpi-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.kpi-card__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #94a3b8;
}
:global(.dark) .kpi-card__label { color: #64748b; }

.kpi-card__icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.kpi-card:hover .kpi-card__icon { transform: scale(1.1); }

.kpi-card__icon--indigo { background: rgba(99,102,241,0.1); color: #6366f1; }
.kpi-card__icon--blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
.kpi-card__icon--emerald { background: rgba(16,185,129,0.1); color: #10b981; }
.kpi-card__icon--amber { background: rgba(245,158,11,0.1); color: #f59e0b; }
.kpi-card__icon--teal { background: rgba(20,184,166,0.1); color: #14b8a6; }
.kpi-card__icon--sky { background: rgba(14,165,233,0.1); color: #0ea5e9; }

:global(.dark) .kpi-card__icon--indigo { background: rgba(99,102,241,0.15); color: #818cf8; }
:global(.dark) .kpi-card__icon--blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
:global(.dark) .kpi-card__icon--emerald { background: rgba(16,185,129,0.15); color: #34d399; }
:global(.dark) .kpi-card__icon--amber { background: rgba(245,158,11,0.15); color: #fbbf24; }
:global(.dark) .kpi-card__icon--teal { background: rgba(20,184,166,0.15); color: #2dd4bf; }
:global(.dark) .kpi-card__icon--sky { background: rgba(14,165,233,0.15); color: #38bdf8; }

.kpi-card__footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px;
}
.kpi-card__value {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.025em;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  line-height: 1;
}
:global(.dark) .kpi-card__value { color: #f8fafc; }
.kpi-card__value--sub {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

/* KPI Badges */
.kpi-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
}
.kpi-badge--up { background: rgba(16,185,129,0.1); color: #059669; }
:global(.dark) .kpi-badge--up { background: rgba(16,185,129,0.15); color: #34d399; }
.kpi-badge--warn { background: rgba(245,158,11,0.1); color: #d97706; }
:global(.dark) .kpi-badge--warn { background: rgba(245,158,11,0.15); color: #fbbf24; }
.kpi-badge--neutral { color: #94a3b8; font-weight: 700; }

/* ─── Reduced Motion ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .hero-card, .kpi-card {
    transition: none;
  }
  .hero-card:hover, .kpi-card:hover {
    transform: none;
  }
  .sparkline-path {
    animation: none;
    stroke-dashoffset: 0;
  }
  .live-dot__ring {
    animation: none;
  }
}
</style>

<template>
  <div class="analytics-card">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h2 class="analytics-card__title">
          Today's Access Flow Analytics
          <span class="analytics-card__badge">Real-time Curve</span>
        </h2>
        <p class="analytics-card__sub">
          Hourly workforce entry vs exit trends across all registered doors
        </p>
      </div>

      <!-- Liquid Sliding Tab Control -->
      <div
        ref="tabGroupEl"
        class="tab-pill-group"
      >
        <div
          class="tab-pill-indicator"
          :style="indicatorStyle"
        />
        <button
          v-for="(range, idx) in rangeOptions"
          :key="range"
          :ref="el => { if(el) tabEls[idx] = el }"
          class="tab-pill"
          :class="{ 'tab-pill--active': activeRange === range }"
          @click="setRange(range, idx)"
        >
          {{ range }}
        </button>
      </div>
    </div>

    <!-- Stat Strip -->
    <div class="stat-strip">
      <div class="stat-strip__item">
        <div class="stat-strip__icon stat-strip__icon--teal">
          <LogIn class="w-4 h-4" />
        </div>
        <div>
          <p class="stat-strip__label">
            Peak Entry Time
          </p>
          <p class="stat-strip__value">
            08:30 AM <span class="stat-strip__accent stat-strip__accent--teal">(412)</span>
          </p>
        </div>
      </div>

      <div class="stat-strip__divider" />
      <div class="stat-strip__item">
        <div class="stat-strip__icon stat-strip__icon--sky">
          <LogOut class="w-4 h-4" />
        </div>
        <div>
          <p class="stat-strip__label">
            Peak Exit Time
          </p>
          <p class="stat-strip__value">
            05:30 PM <span class="stat-strip__accent stat-strip__accent--sky">(380)</span>
          </p>
        </div>
      </div>

      <div class="stat-strip__divider" />
      <div class="stat-strip__item">
        <div class="stat-strip__icon stat-strip__icon--indigo">
          <Users class="w-4 h-4" />
        </div>
        <div>
          <p class="stat-strip__label">
            Currently Inside
          </p>
          <p class="stat-strip__value">
            126 Occupants
          </p>
        </div>
      </div>

      <div class="stat-strip__divider" />
      <div class="stat-strip__item">
        <div class="stat-strip__icon stat-strip__icon--rose">
          <ShieldAlert class="w-4 h-4" />
        </div>
        <div>
          <p class="stat-strip__label">
            Access Denied
          </p>
          <p class="stat-strip__value stat-strip__value--rose">
            23 Events <span class="stat-strip__accent stat-strip__accent--rose">(2.7%)</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Chart Area -->
    <div class="chart-area">
      <!-- Legend -->
      <div class="chart-legend">
        <div class="chart-legend__item">
          <span class="chart-legend__dot chart-legend__dot--teal" />
          <span class="chart-legend__label">Entries</span>
        </div>
        <div class="chart-legend__item">
          <span class="chart-legend__dot chart-legend__dot--sky" />
          <span class="chart-legend__label">Exits</span>
        </div>
      </div>

      <svg
        class="chart-svg"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="entryGradient2"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stop-color="#10b981"
              stop-opacity="0.25"
            />
            <stop
              offset="100%"
              stop-color="#10b981"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="exitGradient2"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stop-color="#0ea5e9"
              stop-opacity="0.2"
            />
            <stop
              offset="100%"
              stop-color="#0ea5e9"
              stop-opacity="0"
            />
          </linearGradient>
          <filter id="glow-teal">
            <feGaussianBlur
              stdDeviation="3"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-sky">
            <feGaussianBlur
              stdDeviation="3"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Grid -->
        <line
          x1="0"
          y1="40"
          x2="800"
          y2="40"
          stroke="currentColor"
          class="chart-grid"
          stroke-dasharray="4 4"
        />
        <line
          x1="0"
          y1="80"
          x2="800"
          y2="80"
          stroke="currentColor"
          class="chart-grid"
          stroke-dasharray="4 4"
        />
        <line
          x1="0"
          y1="120"
          x2="800"
          y2="120"
          stroke="currentColor"
          class="chart-grid"
          stroke-dasharray="4 4"
        />
        <line
          x1="0"
          y1="160"
          x2="800"
          y2="160"
          stroke="currentColor"
          class="chart-grid"
        />

        <!-- Peak marker line -->
        <line
          x1="200"
          y1="0"
          x2="200"
          y2="160"
          stroke="#6366f1"
          stroke-width="1.5"
          stroke-dasharray="5 3"
          opacity="0.5"
        />

        <!-- Area fills -->
        <path
          d="M 0,160 Q 100,150 200,40 T 400,110 T 600,150 T 800,140 L 800,160 L 0,160 Z"
          fill="url(#entryGradient2)"
        />
        <path
          d="M 0,160 Q 100,160 200,140 T 400,130 T 600,35 T 800,150 L 800,160 L 0,160 Z"
          fill="url(#exitGradient2)"
        />

        <!-- Lines with draw animation -->
        <path
          class="chart-line"
          d="M 0,160 Q 100,150 200,40 T 400,110 T 600,150 T 800,140"
          fill="none"
          stroke="#10b981"
          stroke-width="2.5"
          stroke-linecap="round"
          filter="url(#glow-teal)"
          pathLength="1"
        />
        <path
          class="chart-line chart-line--delay"
          d="M 0,160 Q 100,160 200,140 T 400,130 T 600,35 T 800,150"
          fill="none"
          stroke="#0ea5e9"
          stroke-width="2.5"
          stroke-linecap="round"
          filter="url(#glow-sky)"
          pathLength="1"
        />

        <!-- Peak dot — Entry -->
        <circle
          cx="200"
          cy="40"
          r="8"
          fill="rgba(16,185,129,0.2)"
          class="peak-ring"
        />
        <circle
          cx="200"
          cy="40"
          r="5"
          fill="#10b981"
          stroke="white"
          stroke-width="2"
        />

        <!-- Peak dot — Exit -->
        <circle
          cx="600"
          cy="35"
          r="8"
          fill="rgba(14,165,233,0.2)"
          class="peak-ring peak-ring--delay"
        />
        <circle
          cx="600"
          cy="35"
          r="5"
          fill="#0ea5e9"
          stroke="white"
          stroke-width="2"
        />
      </svg>

      <!-- X-axis labels -->
      <div class="chart-xaxis">
        <span>06 AM</span><span>08 AM</span><span>10 AM</span>
        <span>12 PM</span><span>02 PM</span><span>04 PM</span>
        <span>06 PM</span><span>08 PM</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { LogIn, LogOut, Users, ShieldAlert } from 'lucide-vue-next';

const activeRange = ref('Today');
const rangeOptions = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'];
const tabEls = ref([]);
const indicatorStyle = ref({ width: '0px', left: '0px' });

const setRange = (range, idx) => {
  activeRange.value = range;
  updateIndicator(idx);
};

const updateIndicator = (idx) => {
  const el = tabEls.value[idx];
  if (!el) return;
  indicatorStyle.value = {
    width: `${el.offsetWidth}px`,
    left: `${el.offsetLeft}px`,
  };
};

onMounted(async () => {
  await nextTick();
  const initIdx = rangeOptions.indexOf(activeRange.value);
  updateIndicator(initIdx >= 0 ? initIdx : 0);
});
</script>

<style scoped>
/* ─── Card Shell ──────────────────────────────────────── */
.analytics-card {
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(226,232,240,0.7);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
}
:global(.dark) .analytics-card {
  background: rgba(21,28,44,0.88);
  border-color: rgba(255,255,255,0.07);
  box-shadow: 0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04);
}

.analytics-card__title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
:global(.dark) .analytics-card__title { color: #f8fafc; }

.analytics-card__badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(99,102,241,0.08);
  color: #6366f1;
  border: 1px solid rgba(99,102,241,0.15);
}
:global(.dark) .analytics-card__badge {
  background: rgba(99,102,241,0.15);
  color: #a5b4fc;
  border-color: rgba(99,102,241,0.25);
}

.analytics-card__sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 3px;
}

/* ─── Liquid Tab Pills ────────────────────────────────── */
.tab-pill-group {
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px;
  background: rgba(241,245,249,0.9);
  border: 1px solid rgba(226,232,240,0.6);
  border-radius: 12px;
  flex-shrink: 0;
  align-self: flex-start;
}
:global(.dark) .tab-pill-group {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.06);
}

.tab-pill-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  border-radius: 8px;
  background: white;
  border: 1px solid rgba(226,232,240,0.5);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: left 300ms cubic-bezier(0.34, 1.2, 0.64, 1),
              width 300ms cubic-bezier(0.34, 1.2, 0.64, 1);
  pointer-events: none;
}
:global(.dark) .tab-pill-indicator {
  background: rgba(30,40,60,0.95);
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.tab-pill {
  position: relative;
  z-index: 1;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition: color 200ms;
  white-space: nowrap;
}
.tab-pill--active { color: #6366f1; }
:global(.dark) .tab-pill { color: #64748b; }
:global(.dark) .tab-pill--active { color: #818cf8; }
.tab-pill:not(.tab-pill--active):hover { color: #475569; }
:global(.dark) .tab-pill:not(.tab-pill--active):hover { color: #cbd5e1; }

/* ─── Stat Strip ──────────────────────────────────────── */
.stat-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background: rgba(248,250,252,0.8);
  border: 1px solid rgba(241,245,249,0.8);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 20px;
  align-items: center;
}
:global(.dark) .stat-strip {
  background: rgba(255,255,255,0.025);
  border-color: rgba(255,255,255,0.05);
}

.stat-strip__divider {
  width: 1px;
  height: 36px;
  background: rgba(226,232,240,0.6);
  margin: 0 auto;
}
:global(.dark) .stat-strip__divider { background: rgba(255,255,255,0.06); }

.stat-strip__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
}
.stat-strip__item:first-child { padding-left: 0; }

.stat-strip__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-strip__icon--teal { background: rgba(20,184,166,0.1); color: #14b8a6; }
.stat-strip__icon--sky { background: rgba(14,165,233,0.1); color: #0ea5e9; }
.stat-strip__icon--indigo { background: rgba(99,102,241,0.1); color: #6366f1; }
.stat-strip__icon--rose { background: rgba(244,63,94,0.1); color: #f43f5e; }
:global(.dark) .stat-strip__icon--teal { background: rgba(20,184,166,0.15); color: #2dd4bf; }
:global(.dark) .stat-strip__icon--sky { background: rgba(14,165,233,0.15); color: #38bdf8; }
:global(.dark) .stat-strip__icon--indigo { background: rgba(99,102,241,0.15); color: #818cf8; }
:global(.dark) .stat-strip__icon--rose { background: rgba(244,63,94,0.15); color: #fb7185; }

.stat-strip__label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 2px;
}
.stat-strip__value {
  font-size: 12px;
  font-weight: 800;
  color: #1e293b;
  font-variant-numeric: tabular-nums;
}
:global(.dark) .stat-strip__value { color: #e2e8f0; }
.stat-strip__value--rose { color: #e11d48; }
:global(.dark) .stat-strip__value--rose { color: #fb7185; }

.stat-strip__accent { font-weight: 900; }
.stat-strip__accent--teal { color: #14b8a6; }
.stat-strip__accent--sky { color: #0ea5e9; }
.stat-strip__accent--rose { color: #f43f5e; }

/* ─── Chart ───────────────────────────────────────────── */
.chart-area {
  flex: 1;
  position: relative;
}
.chart-legend {
  position: absolute;
  top: 0;
  right: 4px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 10;
}
.chart-legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.chart-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.chart-legend__dot--teal { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.5); }
.chart-legend__dot--sky { background: #0ea5e9; box-shadow: 0 0 6px rgba(14,165,233,0.5); }
.chart-legend__label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
}
:global(.dark) .chart-legend__label { color: #94a3b8; }

.chart-svg {
  width: 100%;
  height: 200px;
  overflow: visible;
}
.chart-grid {
  color: rgba(148,163,184,0.15);
}
:global(.dark) .chart-grid { color: rgba(255,255,255,0.04); }

/* Line draw animation */
.chart-line {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: drawChartLine 1.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
}
.chart-line--delay {
  animation-delay: 0.45s;
}
@keyframes drawChartLine {
  to { stroke-dashoffset: 0; }
}

/* Peak dot ring pulse */
.peak-ring {
  animation: peakPulse 2.5s ease-in-out infinite;
}
.peak-ring--delay {
  animation-delay: 1.25s;
}
@keyframes peakPulse {
  0%, 100% { r: 6; opacity: 0.6; }
  50% { r: 12; opacity: 0; }
}

.chart-xaxis {
  display: flex;
  justify-content: space-between;
  padding: 8px 0 0;
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.02em;
}
:global(.dark) .chart-xaxis { color: #475569; }

/* ─── Reduced Motion ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .chart-line { animation: none; stroke-dashoffset: 0; }
  .peak-ring { animation: none; }
  .tab-pill-indicator { transition: none; }
}
</style>

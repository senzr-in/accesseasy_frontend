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
            {{ peakEntryTime }} <span class="stat-strip__accent stat-strip__accent--teal">({{ peakEntryCount }})</span>
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
            {{ peakExitTime }} <span class="stat-strip__accent stat-strip__accent--sky">({{ peakExitCount }})</span>
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
            {{ currentlyInside }} Occupants
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
            {{ deniedEvents }} Events <span class="stat-strip__accent stat-strip__accent--rose">({{ deniedRate }})</span>
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
              stop-opacity="0.25"
            />
            <stop
              offset="100%"
              stop-color="#0ea5e9"
              stop-opacity="0"
            />
          </linearGradient>

          <!-- SVG Drop Shadows -->
          <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood flood-color="#10b981" flood-opacity="0.3" result="color" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-sky" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood flood-color="#0ea5e9" flood-opacity="0.3" result="color" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
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

        <!-- Area fills -->
        <path
          d="M 0,160 Q 100,150 200,80 T 400,120 T 600,150 T 800,155 L 800,160 L 0,160 Z"
          fill="url(#entryGradient2)"
        />
        <path
          d="M 0,160 Q 100,160 200,150 T 400,140 T 600,75 T 800,155 L 800,160 L 0,160 Z"
          fill="url(#exitGradient2)"
        />

        <!-- Lines with draw animation -->
        <path
          class="chart-line"
          d="M 0,160 Q 100,150 200,80 T 400,120 T 600,150 T 800,155"
          fill="none"
          stroke="#10b981"
          stroke-width="2.5"
          stroke-linecap="round"
          filter="url(#glow-teal)"
          pathLength="1"
        />
        <path
          class="chart-line chart-line--delay"
          d="M 0,160 Q 100,160 200,150 T 400,140 T 600,75 T 800,155"
          fill="none"
          stroke="#0ea5e9"
          stroke-width="2.5"
          stroke-linecap="round"
          filter="url(#glow-sky)"
          pathLength="1"
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
import { workforceService } from '@/services/workforceService';
import { accessService } from '@/services/accessService';

const activeRange = ref('Today');
const rangeOptions = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'];
const tabEls = ref([]);
const indicatorStyle = ref({ width: '0px', left: '0px' });

const currentlyInside = ref(0);
const deniedEvents = ref(0);
const peakEntryTime = ref('—');
const peakEntryCount = ref(0);
const peakExitTime = ref('—');
const peakExitCount = ref(0);

const deniedRate = computed(() => {
  const total = currentlyInside.value + deniedEvents.value;
  return total > 0 ? `${((deniedEvents.value / total) * 100).toFixed(1)}%` : '0%';
});

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

  try {
    const [kpi, access] = await Promise.all([
      workforceService.getDashboardKPIs().catch(() => null),
      accessService.getAccessOverview().catch(() => null)
    ]);

    if (kpi) {
      currentlyInside.value = kpi.currentlyOnSite?.value || 0;
      if (kpi.presentToday?.value > 0) {
        peakEntryTime.value = 'Morning';
        peakEntryCount.value = kpi.presentToday.value;
      }
    }

    if (access) {
      deniedEvents.value = access.denied || 0;
    }
  } catch (err) {
    console.warn('TodayAccessAnalytics load error:', err);
  }
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
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.2);
}
:global(.dark) .analytics-card__badge {
  background: rgba(99, 102, 241, 0.18);
  color: #818cf8;
  border-color: rgba(99, 102, 241, 0.3);
}

.analytics-card__sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

/* ─── Tab Control ─────────────────────────────────────── */
.tab-pill-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  background: rgba(241, 245, 249, 0.8);
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
}
:global(.dark) .tab-pill-group {
  background: rgba(255, 255, 255, 0.05);
}

.tab-pill-indicator {
  position: absolute;
  top: 3px;
  bottom: 3px;
  border-radius: 9px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04);
  transition: left 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
              width 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}
:global(.dark) .tab-pill-indicator {
  background: #1e293b;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
}

.tab-pill {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: color 200ms ease;
}
.tab-pill:hover { color: #0f172a; }
.tab-pill--active { color: #0f172a; font-weight: 800; }
:global(.dark) .tab-pill { color: #94a3b8; }
:global(.dark) .tab-pill:hover { color: #f8fafc; }
:global(.dark) .tab-pill--active { color: #f8fafc; }

/* ─── Stat Strip ──────────────────────────────────────── */
.stat-strip {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.7);
  border: 1px solid rgba(241, 245, 249, 0.8);
  margin-bottom: 20px;
}
:global(.dark) .stat-strip {
  background: rgba(255, 255, 255, 0.025);
  border-color: rgba(255, 255, 255, 0.05);
}

@media (max-width: 640px) {
  .stat-strip {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .stat-strip__divider { display: none; }
}

.stat-strip__item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-strip__divider {
  width: 1px;
  height: 28px;
  background: rgba(226, 232, 240, 0.8);
}
:global(.dark) .stat-strip__divider {
  background: rgba(255, 255, 255, 0.07);
}

.stat-strip__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-strip__icon--teal   { background: rgba(20, 184, 166, 0.12); color: #0d9488; }
.stat-strip__icon--sky    { background: rgba(14, 165, 233, 0.12); color: #0284c7; }
.stat-strip__icon--indigo { background: rgba(99, 102, 241, 0.12); color: #4f46e5; }
.stat-strip__icon--rose   { background: rgba(244, 63, 94, 0.12);  color: #e11d48; }

.stat-strip__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  line-height: 1;
  margin-bottom: 3px;
}

.stat-strip__value {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  white-space: nowrap;
}
:global(.dark) .stat-strip__value { color: #f8fafc; }
.stat-strip__value--rose { color: #e11d48; }
:global(.dark) .stat-strip__value--rose { color: #fb7185; }

.stat-strip__accent {
  font-weight: 700;
  font-size: 11px;
}
.stat-strip__accent--teal { color: #0d9488; }
.stat-strip__accent--sky  { color: #0284c7; }
.stat-strip__accent--rose { color: #f43f5e; }

/* ─── Chart Area ──────────────────────────────────────── */
.chart-area {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.chart-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 8px;
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
.chart-legend__dot--teal { background: #10b981; }
.chart-legend__dot--sky  { background: #0ea5e9; }
.chart-legend__label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}
:global(.dark) .chart-legend__label { color: #94a3b8; }

.chart-svg {
  width: 100%;
  height: 130px;
  overflow: visible;
}

.chart-grid {
  color: rgba(226, 232, 240, 0.7);
}
:global(.dark) .chart-grid {
  color: rgba(255, 255, 255, 0.05);
}

.chart-line {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: drawLine 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.chart-line--delay {
  animation-delay: 0.2s;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

.chart-xaxis {
  display: flex;
  justify-content: space-between;
  padding: 6px 0 0;
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  font-family: ui-monospace, monospace;
}
</style>

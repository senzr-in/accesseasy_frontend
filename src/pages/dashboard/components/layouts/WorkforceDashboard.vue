<template>
  <div class="workforce-dashboard h-full text-slate-900 dark:text-slate-50 overflow-y-auto custom-scrollbar">
    <!-- Ambient mesh background -->
    <div class="dashboard-canvas p-4 sm:p-6 pb-8 min-h-full relative">
      <!-- 0. Header -->
      <div
        class="stagger-child"
        style="--stagger: 0"
      >
        <WorkforceHeader />
      </div>

      <!-- 1. Workforce KPI Cards Grid -->
      <div
        class="stagger-child"
        style="--stagger: 1"
      >
        <WorkforceKPIGrid />
      </div>

      <!-- 2. Analytics + Live Feed -->
      <div
        class="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-5 stagger-child"
        style="--stagger: 2"
      >
        <div class="xl:col-span-8">
          <TodayAccessAnalytics />
        </div>
        <div class="xl:col-span-4">
          <LiveAccessPanel />
        </div>
      </div>

      <!-- 3. Inactive Employees -->
      <div
        class="stagger-child"
        style="--stagger: 3"
      >
        <InactiveEmployeesSection />
      </div>
    </div>
  </div>
</template>

<script setup>
import WorkforceHeader from '../workforce/WorkforceHeader.vue';
import WorkforceKPIGrid from '../workforce/WorkforceKPIGrid.vue';
import TodayAccessAnalytics from '../workforce/TodayAccessAnalytics.vue';
import LiveAccessPanel from '../workforce/LiveAccessPanel.vue';
import InactiveEmployeesSection from '../workforce/InactiveEmployeesSection.vue';
</script>

<style scoped>
/* ─── Canvas & Background ─────────────────────────────── */
.workforce-dashboard {
  background-color: #f0f4ff;
  background-image:
    radial-gradient(ellipse at 10% 10%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 15%, rgba(16, 185, 129, 0.06) 0%, transparent 45%),
    radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 55%);
  scroll-behavior: smooth;
}

:global(.dark) .workforce-dashboard {
  background-color: #080c18;
  background-image:
    radial-gradient(ellipse at 10% 10%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 15%, rgba(16, 185, 129, 0.08) 0%, transparent 45%),
    radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.07) 0%, transparent 55%);
}

/* ─── Staggered Mount Animations ─────────────────────── */
.stagger-child {
  animation: slideUpFade 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--stagger, 0) * 120ms);
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ─── Reduced Motion ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .stagger-child {
    animation: none;
  }
}
</style>

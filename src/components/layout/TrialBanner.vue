<template>
  <div
    v-if="isVisible"
    class="trial-banner"
  >
    <div class="trial-banner__inner">
      <div class="trial-banner__left">
        <div class="trial-pulse-badge">
          <span class="pulse-dot"></span>
          7-DAY TRIAL
        </div>
        <div class="trial-message">
          <strong>Free Trial Active:</strong> 1 Site Included with all features unlocked.
          <span class="days-badge">{{ store.trialDaysRemaining }} {{ store.trialDaysRemaining === 1 ? 'day' : 'days' }} left</span>
        </div>
      </div>

      <div class="trial-banner__right">
        <button
          class="btn-upgrade-banner"
          @click="handleUpgrade"
        >
          <span>Upgrade for More Sites (₹1,999/Site/Month)</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <button
          class="btn-dismiss-banner"
          @click="dismissBanner"
          title="Dismiss notification"
          aria-label="Dismiss banner"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlanStore } from '@/stores/usePlanStore';

const router = useRouter();
const store = usePlanStore();
const isDismissed = ref(false);

const isVisible = computed(() => {
  return store.ready && store.isTrial && !isDismissed.value;
});

function handleUpgrade() {
  router.push('/dashboard/settings/plans');
}

function dismissBanner() {
  isDismissed.value = true;
}
</script>

<style scoped>
.trial-banner {
  background: linear-gradient(90deg, #312e81 0%, #1e1b4b 50%, #064e3b 100%);
  border-bottom: 1px solid rgba(129, 140, 248, 0.25);
  color: #ffffff;
  padding: 8px 16px;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 40;
}

.trial-banner__inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.trial-banner__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trial-pulse-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 6px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: #34d399;
  border-radius: 50%;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.trial-message {
  font-size: 12px;
  color: #e0e7ff;
}

.days-badge {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 4px;
  margin-left: 6px;
  font-size: 11px;
}

.trial-banner__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-upgrade-banner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #10b981;
  color: #064e3b;
  font-size: 12px;
  font-weight: 800;
  padding: 5px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.btn-upgrade-banner:hover {
  background: #34d399;
  transform: translateY(-1px);
}

.btn-dismiss-banner {
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-size: 18px;
  cursor: pointer;
  padding: 2px 6px;
  line-height: 1;
  border-radius: 4px;
}
.btn-dismiss-banner:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
</style>

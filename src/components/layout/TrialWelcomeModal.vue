<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="trial-modal-overlay"
      @click.self="closeModal"
    >
      <div class="trial-modal-card">
        <!-- Close Button -->
        <button
          class="trial-modal-close"
          @click="closeModal"
          aria-label="Close modal"
        >
          ×
        </button>

        <!-- Header -->
        <div class="trial-modal-header">
          <div class="trial-modal-badge">
            <span class="badge-icon">⚡</span>
            7-Day Free Trial Activated
          </div>
          <h2 class="trial-modal-title">Welcome to AccessEasy!</h2>
          <p class="trial-modal-subtitle">
            Your organization has full access to all security operations features.
          </p>
        </div>

        <!-- Plan Highlights Box -->
        <div class="trial-info-box">
          <div class="info-row">
            <div class="info-label">Trial Capacity</div>
            <div class="info-value font-bold text-emerald">1 Site Included</div>
          </div>
          <div class="info-row">
            <div class="info-label">Features</div>
            <div class="info-value font-bold text-indigo">All Features Unlocked</div>
          </div>
          <div class="info-row">
            <div class="info-label">Trial Duration</div>
            <div class="info-value font-bold text-slate">{{ store.trialDaysRemaining }} Days Remaining</div>
          </div>
        </div>

        <!-- Features list -->
        <div class="features-pill-list">
          <div class="pill-item">✓ Live GPS Tracking</div>
          <div class="pill-item">✓ Geofence Alarms</div>
          <div class="pill-item">✓ Incident Escalation</div>
          <div class="pill-item">✓ 24/7 Shift Scheduler</div>
          <div class="pill-item">✓ Handheld Fleet</div>
          <div class="pill-item">✓ Audit Trail</div>
        </div>

        <!-- Action Buttons -->
        <div class="trial-modal-actions">
          <button
            class="btn-primary-action"
            @click="closeModal"
          >
            Explore Dashboard
          </button>
          <button
            class="btn-upgrade-action"
            @click="goToUpgrade"
          >
            Add More Sites (₹1,999/Site/Month) →
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlanStore } from '@/stores/usePlanStore';
import { authService } from '@/services/authService';

const router = useRouter();
const store = usePlanStore();
const isOpen = ref(false);

onMounted(async () => {
  await store.initPlan();
  const tenantId = authService.getTenantId() || 'default';
  const hasSeenModal = sessionStorage.getItem(`trial_welcome_seen_${tenantId}`);

  if (store.isTrial && !hasSeenModal) {
    isOpen.value = true;
  }
});

function closeModal() {
  const tenantId = authService.getTenantId() || 'default';
  sessionStorage.setItem(`trial_welcome_seen_${tenantId}`, 'true');
  isOpen.value = false;
}

function goToUpgrade() {
  closeModal();
  router.push('/dashboard/settings/plans');
}
</script>

<style scoped>
.trial-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.trial-modal-card {
  position: relative;
  background: linear-gradient(180deg, #131b2e 0%, #0b0f19 100%);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  padding: 28px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
  color: #ffffff;
  font-family: inherit;
}

.trial-modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.trial-modal-close:hover { background: rgba(255, 255, 255, 0.15); color: #ffffff; }

.trial-modal-header {
  margin-bottom: 20px;
}

.trial-modal-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 10px;
}

.trial-modal-title {
  font-size: 22px;
  font-weight: 900;
  margin: 0 0 6px;
  color: #ffffff;
}

.trial-modal-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.trial-info-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
.info-label { color: #94a3b8; }
.text-emerald { color: #34d399; }
.text-indigo { color: #818cf8; }
.text-slate { color: #f1f5f9; }

.features-pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.pill-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #cbd5e1;
}

.trial-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-primary-action {
  width: 100%;
  padding: 12px;
  background: #4f46e5;
  color: #ffffff;
  font-weight: 800;
  font-size: 13px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary-action:hover { background: #4338ca; }

.btn-upgrade-action {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
  font-weight: 700;
  font-size: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-upgrade-action:hover {
  background: rgba(16, 185, 129, 0.1);
}
</style>

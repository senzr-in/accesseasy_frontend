<template>
  <div class="premium-overlay">
    <!-- Blurred Background Content -->
    <div class="blurred-content">
      <div class="mock-header">
        <div class="mock-title-bar"></div>
        <div class="mock-stats">
          <div class="mock-stat-card"></div>
          <div class="mock-stat-card"></div>
          <div class="mock-stat-card"></div>
        </div>
      </div>

      <div class="mock-tabs">
        <div class="mock-tab active"></div>
        <div class="mock-tab"></div>
        <div class="mock-tab"></div>
      </div>

      <div class="mock-content">
        <div class="mock-form-fields">
          <div class="mock-field" v-for="i in 6" :key="i"></div>
        </div>
      </div>
    </div>

    <!-- Premium Upgrade Card -->
    <div class="premium-card">
      <div class="premium-icon">
        <Crown class="crown-icon" />
      </div>

      <h2 class="premium-title">Premium Feature</h2>
      <p class="premium-description">
        This feature is exclusive to Premium subscribers. Your current plan does
        not include access to advanced work order configuration. Upgrade to
        unlock powerful form customization, advanced field types, and workflow
        automation.
      </p>

      <div class="premium-features">
        <div class="feature-item">
          <CheckCircle class="feature-icon" />
          <span>Advanced Field Configuration</span>
        </div>
        <div class="feature-item">
          <CheckCircle class="feature-icon" />
          <span>Custom Workflow Automation</span>
        </div>
        <div class="feature-item">
          <CheckCircle class="feature-icon" />
          <span>Priority Support</span>
        </div>
        <div class="feature-item">
          <CheckCircle class="feature-icon" />
          <span>Advanced Analytics</span>
        </div>
      </div>

      <div class="premium-actions">
        <button class="upgrade-btn primary" @click="$emit('upgrade')">
          <Zap class="btn-icon" />
          Upgrade to Premium
        </button>
      </div>

      <div class="premium-badge">
        <Star class="badge-icon" />
        <span>Premium Only</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Crown, CheckCircle, Zap, Star } from "lucide-vue-next";

defineEmits(["upgrade"]);
</script>

<style scoped>
.premium-overlay {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  overflow: hidden;
}

.blurred-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  filter: blur(8px);
  opacity: 0.3;
  pointer-events: none;
  padding: 2rem;
}

.mock-header {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.mock-title-bar {
  height: 2rem;
  background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%);
  border-radius: 6px;
  margin-bottom: 1rem;
  width: 60%;
}

.mock-stats {
  display: flex;
  gap: 1rem;
}

.mock-stat-card {
  flex: 1;
  height: 4rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 8px;
}

.mock-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.mock-tab {
  height: 2.5rem;
  width: 8rem;
  background: #e2e8f0;
  border-radius: 6px;
}

.mock-tab.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.mock-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.mock-form-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.mock-field {
  height: 3rem;
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
  border-radius: 6px;
}

.premium-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 20px;
  padding: 3rem;
  width: 90%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  text-align: center;
  border: 1px solid #e2e8f0;
}

.premium-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  margin-bottom: 1.5rem;
}

.crown-icon {
  width: 2rem;
  height: 2rem;
  color: white;
}

.premium-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.premium-description {
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.premium-features {
  display: grid;
  gap: 1rem;
  margin-bottom: 2.5rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.feature-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #10b981;
  flex-shrink: 0;
}

.premium-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.upgrade-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.5);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.premium-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-icon {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 640px) {
  .premium-card {
    padding: 2rem;
    margin: 1rem;
  }

  .premium-title {
    font-size: 1.5rem;
  }

  .premium-actions {
    gap: 0.75rem;
  }
}
</style>

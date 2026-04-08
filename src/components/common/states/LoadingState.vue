<template>
  <div class="loading-state" :class="stateClass">
    <div class="loading-content">
      <!-- Custom Loading Icon -->
      <div v-if="customIcon" class="loading-icon-custom">
        <component :is="customIcon" :size="iconSize" />
      </div>

      <!-- Default Spinner -->
      <div v-else class="loading-spinner" :style="spinnerStyle"></div>

      <!-- Loading Text -->
      <div class="loading-text">
        <h3 v-if="title" class="loading-title">{{ title }}</h3>
        <p v-if="message" class="loading-message">{{ message }}</p>
      </div>

      <!-- Progress Bar -->
      <div v-if="showProgress && progress !== null" class="loading-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text">{{ progress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Loading...",
  },
  message: String,
  customIcon: [Object, Function],
  iconSize: {
    type: Number,
    default: 48,
  },
  spinnerSize: {
    type: Number,
    default: 40,
  },
  spinnerColor: {
    type: String,
    default: "#3b82f6",
  },
  progress: Number,
  showProgress: Boolean,
  fullHeight: {
    type: Boolean,
    default: true,
  },
  stateClass: String,
});

const spinnerStyle = computed(() => ({
  width: `${props.spinnerSize}px`,
  height: `${props.spinnerSize}px`,
  borderTopColor: props.spinnerColor,
}));
</script>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.loading-state.full-height {
  min-height: 400px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 400px;
}

.loading-spinner {
  border: 3px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

.loading-icon-custom {
  color: #3b82f6;
  animation: pulse 2s infinite;
}

.loading-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loading-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.loading-message {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.loading-progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>

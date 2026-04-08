<!-- /src/components/common/notifications/ToastNotification.vue -->
<template>
  <div v-if="show" :class="['toast-notification', type]">
    <div class="toast-icon-wrapper">
      <CheckCircleIcon v-if="type === 'success'" class="toast-icon" />
      <XCircleIcon v-if="type === 'error'" class="toast-icon" />
      <InfoIcon v-if="type === 'info'" class="toast-icon" />
      <AlertTriangleIcon v-if="type === 'warning'" class="toast-icon" />
    </div>
    <div class="toast-content">
      <span class="toast-message">{{ message }}</span>
    </div>
    <button @click="$emit('close')" class="toast-close">
      <XIcon class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import {
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  AlertTriangleIcon,
  XIcon,
} from "lucide-vue-next";

defineProps({
  show: Boolean,
  message: String,
  type: {
    type: String,
    default: "info",
    validator: (value) =>
      ["success", "error", "info", "warning"].includes(value),
  },
});

defineEmits(["close"]);
</script>

<style scoped>
.toast-notification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid;
  background: white;
  min-width: 300px;
  max-width: 500px;
  position: relative;
  animation: slideIn 0.3s ease-out;
}

.toast-notification.success {
  border-color: #10b981;
  background: #f0fdf4;
}

.toast-notification.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.toast-notification.info {
  border-color: #3b82f6;
  background: #eff6ff;
}

.toast-notification.warning {
  border-color: #f59e0b;
  background: #fffbeb;
}

.toast-icon-wrapper {
  flex-shrink: 0;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.success .toast-icon {
  color: #10b981;
}

.error .toast-icon {
  color: #ef4444;
}

.info .toast-icon {
  color: #3b82f6;
}

.warning .toast-icon {
  color: #f59e0b;
}

.toast-content {
  flex: 1;
}

.toast-message {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>

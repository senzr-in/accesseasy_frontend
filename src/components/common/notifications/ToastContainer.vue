<!-- /src/components/common/notifications/ToastContainer.vue -->
<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div" class="toast-list">
      <ToastNotification
        v-for="toast in toasts"
        :key="toast.id"
        :show="true"
        :message="toast.message"
        :type="toast.type"
        @close="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ToastNotification from "./ToastNotification.vue";

const toasts = ref([]);

const addToast = (message, type = "info", duration = 5000) => {
  const id = Date.now() + Math.random();
  const toast = { id, message, type };

  toasts.value.push(toast);

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const clearAll = () => {
  toasts.value = [];
};

// Expose methods for global use
defineExpose({
  addToast,
  removeToast,
  clearAll,
  success: (message, duration) => addToast(message, "success", duration),
  error: (message, duration) => addToast(message, "error", duration),
  info: (message, duration) => addToast(message, "info", duration),
  warning: (message, duration) => addToast(message, "warning", duration),
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 4rem;
  right: 1rem;
  z-index: 2000;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toast-list > * {
  pointer-events: auto;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 640px) {
  .toast-container {
    top: 1rem;
    left: 1rem;
    right: 1rem;
  }
}
</style>

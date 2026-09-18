import { ref } from 'vue';

const toasts = ref([]);

const addToast = (message, type = 'success', duration = 3500) => {
  if (!message) return;
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const toastItem = {
    id,
    message,
    type, // 'success' | 'error' | 'warning' | 'info'
    duration
  };

  toasts.value.push(toastItem);

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

const clearAll = () => {
  toasts.value = [];
};

const success = (msg, duration) => addToast(msg, 'success', duration);
const error = (msg, duration = 4500) => addToast(msg, 'error', duration);
const warning = (msg, duration) => addToast(msg, 'warning', duration);
const info = (msg, duration) => addToast(msg, 'info', duration);

export const useToastStore = () => ({
  toasts,
  addToast,
  removeToast,
  clearAll,
  success,
  error,
  warning,
  info
});

// Singleton helper for easy import anywhere
export const toast = {
  success: (msg, duration) => success(msg, duration),
  error: (msg, duration) => error(msg, duration),
  warning: (msg, duration) => warning(msg, duration),
  info: (msg, duration) => info(msg, duration)
};

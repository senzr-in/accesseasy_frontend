import { getCurrentInstance } from "vue";

export function useToast() {
  const instance = getCurrentInstance();

  // Try to find toast container in the app
  const findToastContainer = () => {
    return window.toastContainer || null;
  };

  const showToast = (message, type = "info", duration = 5000) => {
    const container = findToastContainer();
    if (container) {
      return container.addToast(message, type, duration);
    } else {
      // Fallback to console or alert
      console.log(`Toast ${type}: ${message}`);
    }
  };

  return {
    toast: showToast,
    success: (message, duration) => showToast(message, "success", duration),
    error: (message, duration) => showToast(message, "error", duration),
    info: (message, duration) => showToast(message, "info", duration),
    warning: (message, duration) => showToast(message, "warning", duration),
  };
}

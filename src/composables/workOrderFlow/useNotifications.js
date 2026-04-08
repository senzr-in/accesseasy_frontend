import { ref } from "vue";

export function useNotifications() {
  const showToast = ref(false);
  const toastMessage = ref("");
  const toastType = ref("success");
  let toastTimeout = null;

  const showNotification = (message, type) => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastMessage.value = message;
    toastType.value = type;
    showToast.value = true;
    toastTimeout = setTimeout(() => {
      showToast.value = false;
      toastMessage.value = "";
    }, 5000);
  };

  return {
    showToast,
    toastMessage,
    toastType,
    showNotification,
  };
}

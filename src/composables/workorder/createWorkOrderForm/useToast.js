"use client"

import { ref } from "vue"

export function useToast() {
  const showToast = ref(false)
  const toastMessage = ref("")
  const toastType = ref("success")
  let toastTimeout = null

  const showValidationToast = (message, type = "success") => {
    if (toastTimeout) {
      clearTimeout(toastTimeout)
    }
    toastMessage.value = message
    toastType.value = type
    showToast.value = true
    toastTimeout = setTimeout(() => {
      showToast.value = false
      toastMessage.value = ""
    }, 3000)
  }

  return {
    showToast,
    toastMessage,
    toastType,
    showValidationToast,
  }
}

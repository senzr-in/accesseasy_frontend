<template>
  <div v-if="show" :class="['toast-notification', type]">
    <div class="toast-icon-wrapper">
      <CheckCircleIcon v-if="type === 'success'" class="toast-icon" />
      <XCircleIcon v-if="type === 'error'" class="toast-icon" />
      <InfoIcon v-if="type === 'info'" class="toast-icon" />
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
import { CheckCircleIcon, XCircleIcon, InfoIcon, XIcon } from "lucide-vue-next";

defineProps({
  show: Boolean,
  message: String,
  type: String,
});

defineEmits(["close"]);
</script>

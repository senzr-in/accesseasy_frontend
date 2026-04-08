<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content enhanced-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h3 class="modal-title modal-title-danger">
          <XCircleIcon class="modal-title-icon" />
          {{ title }}
        </h3>
        <button @click="$emit('close')" class="modal-close">
          <XIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="delete-warning">
          <div class="warning-icon">
            <XCircleIcon class="w-12 h-12 text-red-500" />
          </div>
          <div class="warning-content">
            <h4 class="warning-title">{{ confirmMessage }}</h4>
            <p v-if="itemLabel" class="warning-message">
              {{ itemLabel }}: <strong>{{ itemName }}</strong>
            </p>
            <p class="warning-description">{{ description }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          {{ cancelText }}
        </button>
        <button
          @click="$emit('confirm')"
          class="btn btn-danger"
          :disabled="deleting"
        >
          <div v-if="deleting" class="loading-spinner-small"></div>
          <Trash2Icon v-else class="btn-icon" />
          {{ deleting ? deletingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XCircleIcon, XIcon, Trash2Icon } from "lucide-vue-next";

defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: "Delete Item" },
  confirmMessage: {
    type: String,
    default: "Are you sure you want to delete this item?",
  },
  itemLabel: { type: String, default: "" },
  itemName: { type: String, default: "" },
  description: { type: String, default: "This action cannot be undone." },
  cancelText: { type: String, default: "Cancel" },
  confirmText: { type: String, default: "Delete" },
  deletingText: { type: String, default: "Deleting..." },
  deleting: { type: Boolean, default: false },
});

defineEmits(["close", "confirm"]);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style>

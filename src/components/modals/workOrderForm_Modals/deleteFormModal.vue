<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content enhanced-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title modal-title-danger">
          <XCircleIcon class="modal-title-icon" />
          Delete Form
        </h3>
        <button @click="$emit('close')" class="modal-close">
          <XIcon class="w-6 h-6" />
        </button>
      </div>
      <div class="modal-body">
        <div class="delete-warning">
          <div class="warning-icon">
            <XCircleIcon class="w-12 h-12 text-red-500" />
          </div>
          <div class="warning-content">
            <h4 class="warning-title">
              Are you sure you want to delete this form?
            </h4>
            <p class="warning-message">
              Form: <strong>{{ formToDelete?.formName }}</strong>
            </p>
            <p class="warning-description">
              This action cannot be undone. All form configurations and
              associated data will be permanently deleted.
            </p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancel
        </button>
        <button
          @click="$emit('deleteForm')"
          class="btn btn-danger"
          :disabled="deleting"
        >
          <div v-if="deleting" class="loading-spinner-small"></div>
          <Trash2Icon v-else class="btn-icon" />
          {{ deleting ? "Deleting..." : "Delete Form" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XCircleIcon, XIcon, Trash2Icon } from "lucide-vue-next";

defineProps({
  show: Boolean,
  formToDelete: Object,
  deleting: Boolean,
});

defineEmits(["close", "deleteForm"]);
</script>

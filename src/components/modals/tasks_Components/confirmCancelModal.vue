<!-- ConfirmCancelModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Cancel Task(s)</h2>
            </div>
            <div class="modal-body">
              <p>
                Are you sure you want to cancel {{ taskIds.length }} selected
                task(s)? This action cannot be undone.
              </p>
            </div>
            <div class="modal-actions">
              <BaseButton
                variant="secondary"
                text="Close"
                @click="$emit('close')"
                :disabled="loading"
              />
              <BaseButton
                variant="danger"
                text="Yes, Cancel Tasks"
                :loading="loading"
                @click="$emit('confirm')"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const props = defineProps({
  show: Boolean,
  taskIds: Array,
  loading: Boolean,
});

const emit = defineEmits(["close", "confirm"]);

// Prevent body scroll when modal is open
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Very high z-index to ensure it's on top */
  padding: 1rem;
  overflow-y: auto;
}

.modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  width: 100%;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  margin: auto;
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: medium;

  font-weight: 600;
  color: #111827;
  margin: 0;
  text-align: left;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  font-size: medium;

  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  text-align: left;
}

.modal-actions {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-content {
    max-width: 100%;
    margin: 1rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions button {
    width: 100%;
  }
}
</style>

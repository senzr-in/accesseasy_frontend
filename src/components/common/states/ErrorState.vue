<template>
  <div class="error-state" :class="stateClass">
    <div class="error-content">
      <!-- Icon -->
      <div class="error-icon">
        <component v-if="customIcon" :is="customIcon" :size="iconSize" />
        <AlertCircle v-else :size="iconSize" />
      </div>

      <!-- Text Content -->
      <div class="error-text">
        <h3 class="error-title">{{ title }}</h3>
        <p v-if="message" class="error-message">{{ message }}</p>

        <!-- Error Details (Collapsible) -->
        <div v-if="errorDetails && showDetails" class="error-details">
          <button class="details-toggle" @click="detailsOpen = !detailsOpen">
            <ChevronDown :size="16" :class="{ 'rotate-180': detailsOpen }" />
            {{ detailsOpen ? "Hide" : "Show" }} Details
          </button>

          <div v-if="detailsOpen" class="details-content">
            <pre>{{ errorDetails }}</pre>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="$slots.actions || showDefaultActions" class="error-actions">
        <slot name="actions">
          <BaseButton
            v-if="retryAction"
            variant="primary"
            :leftIcon="retryAction.icon || RefreshCw"
            @click="$emit('retry')"
            :loading="retrying"
          >
            {{ retryAction.text || "Try Again" }}
          </BaseButton>

          <BaseButton
            v-if="secondaryAction"
            variant="secondary"
            :leftIcon="secondaryAction.icon"
            @click="$emit('secondaryAction')"
          >
            {{ secondaryAction.text }}
          </BaseButton>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { AlertCircle, ChevronDown, RefreshCw } from "lucide-vue-next";
import BaseButton from "../buttons/BaseButton.vue";

defineProps({
  title: {
    type: String,
    default: "Something went wrong",
  },
  message: String,
  errorDetails: [String, Object],
  customIcon: [Object, Function],
  iconSize: {
    type: Number,
    default: 48,
  },
  retryAction: Object, // { text: 'Retry', icon: RefreshIcon }
  secondaryAction: Object,
  showDefaultActions: {
    type: Boolean,
    default: true,
  },
  showDetails: {
    type: Boolean,
    default: true,
  },
  retrying: Boolean,
  stateClass: String,
});

defineEmits(["retry", "secondaryAction"]);

const detailsOpen = ref(false);
</script>

<style scoped>
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 300px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 500px;
}

.error-icon {
  color: #ef4444;
}

.error-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.error-message {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.error-details {
  margin-top: 1rem;
}

.details-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.details-toggle:hover {
  background: #f1f5f9;
  color: #475569;
}

.details-toggle svg {
  transition: transform 0.2s ease;
}

.details-toggle svg.rotate-180 {
  transform: rotate(180deg);
}

.details-content {
  margin-top: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  text-align: left;
}

.details-content pre {

  font-size: 0.75rem;
  color: #374151;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}
</style>

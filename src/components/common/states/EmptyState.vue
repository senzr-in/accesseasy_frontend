<template>
  <div class="empty-state" :class="stateClass">
    <div class="empty-content">
      <!-- Icon -->
      <div class="empty-icon">
        <slot name="icon">
          <component v-if="customIcon" :is="customIcon" :size="iconSize" />
          <div v-else class="default-icon">{{ defaultIcon }}</div>
        </slot>
      </div>

      <!-- Text Content -->
      <div class="empty-text">
        <h3 class="empty-title">{{ title }}</h3>
        <p v-if="message" class="empty-message">{{ message }}</p>
      </div>

      <!-- Actions -->
      <div v-if="$slots.actions || showDefaultActions" class="empty-actions">
        <slot name="actions">
          <BaseButton
            v-if="primaryAction"
            variant="primary"
            :leftIcon="primaryAction.icon"
            @click="$emit('primaryAction')"
          >
            {{ primaryAction.text }}
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
import BaseButton from "../buttons/BaseButton.vue";
import { X } from "lucide-vue-next";

defineProps({
  title: {
    type: String,
    default: "No data found",
  },
  message: String,
  customIcon: [Object, Function],
  iconSize: {
    type: Number,
    default: 48,
  },
  defaultIcon: {
    type: String,
    default: "📋",
  },
  primaryAction: Object, // { text: 'Create', icon: PlusIcon }
  secondaryAction: Object,
  showDefaultActions: {
    type: Boolean,
    default: true,
  },
  stateClass: String,
});

defineEmits(["primaryAction", "secondaryAction"]);
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 300px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 400px;
}

.empty-icon {
  color: #94a3b8;
}

.default-icon {
  font-size: 3rem;
  opacity: 0.7;
}

.empty-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.empty-message {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}
</style>

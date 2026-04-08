<!-- scr/components/common/filters/filterpanel.vue -->
<template>
  <transition name="slide">
    <div v-if="show" class="filter-panel" :class="panelClass">
      <!-- Header -->
      <div class="filter-header">
        <div class="filter-header-content">
          <button
            v-if="showBackButton"
            class="filter-nav-btn"
            @click="$emit('close')"
            aria-label="Back"
          >
            <ArrowLeft :size="20" />
          </button>

          <h3 class="filter-title">{{ title }}</h3>

          <button class="filter-nav-btn" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="filter-content">
        <slot />
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="filter-actions">
        <BaseButton
          variant="secondary"
          @click="$emit('clear')"
          :disabled="!hasFilters"
        >
          {{ clearText }}
        </BaseButton>

        <BaseButton variant="primary" @click="$emit('apply')">
          {{ applyText }}
        </BaseButton>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ArrowLeft, X } from "lucide-vue-next";
import BaseButton from "../buttons/BaseButton.vue";

defineProps({
  show: Boolean,
  title: {
    type: String,
    default: "Filters",
  },
  showBackButton: {
    type: Boolean,
    default: true,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  hasFilters: Boolean,
  clearText: {
    type: String,
    default: "Clear All",
  },
  applyText: {
    type: String,
    default: "Apply Filters",
  },
  panelClass: String,
});

defineEmits(["close", "clear", "apply"]);
</script>

<style scoped>
.filter-panel {
  width: 400px;
  background: white;
  border-left: 1px solid #e2e8f0;
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  z-index: 200;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 6px rgba(0, 0, 0, 0.1);
}

.filter-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-shrink: 0;
  margin-top: 65px;
}

.filter-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.filter-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(59, 130, 246, 0.1);
  border: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.filter-nav-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #475569;
}

.filter-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.filter-actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.filter-actions .base-button {
  flex: 1;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .filter-panel {
    width: 100%;
    max-width: 400px;
  }
}
</style>

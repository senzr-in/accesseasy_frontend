<script setup>
import { computed } from "vue";

const props = defineProps({
  icon: { type: [String, Object], required: true },
  variant: { type: String, default: "ghost" },
  size: { type: String, default: "sm" },
  tooltip: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["click"]);

const isIconString = computed(() => typeof props.icon === "string");
</script>

<template>
  <button
    class="action-btn"
    :class="[`action-btn--${variant}`, `action-btn--${size}`]"
    :disabled="disabled"
    :title="tooltip"
    @click="emit('click', $event)"
  >
    <!-- If icon is passed as component -->
    <component :is="icon" v-if="!isIconString" class="action-btn__icon" />
    <!-- If icon is a simple string / emoji -->
    <span v-else>{{ icon }}</span>
  </button>
</template>

<style scoped>
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.action-btn--sm {
  width: 54px;
  height: 34px;
}
.action-btn--xs {
  width: 20px;
  height: 20px;
}

.action-btn--ghost {
  background: transparent;
  color: #64748b;
}
.action-btn--ghost:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
}

.action-btn--primary {
  background: #3b82f6;
  color: #fff;
}
.action-btn--primary:hover:not(:disabled) {
  background: #2563eb;
}

.action-btn--danger {
  background: #ef4444;
  color: #fff;
}
.action-btn--danger:hover:not(:disabled) {
  background: #dc2626;
}

.action-btn__icon {
  width: 18px;
  height: 18px;
  font-weight: bold;
  stroke-width: 2.5;
}

.action-btn--xs .action-btn__icon {
  width: 14px;
  height: 14px;
}
</style>

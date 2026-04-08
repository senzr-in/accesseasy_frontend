<!-- src/components/common/buttons/BaseButton.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || isLoading"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="button-spinner"></div>

    <!-- Left Icon -->
    <component
      v-if="leftIcon && !isLoading"
      :is="resolveIcon(leftIcon)"
      :size="iconSize"
      class="button-icon-left"
    />

    <!-- Button Text -->
    <span v-if="$slots.default || text" class="button-text">
      <slot>{{ text }}</slot>
    </span>

    <!-- Right Icon -->
    <component
      v-if="rightIcon && !isLoading"
      :is="resolveIcon(rightIcon)"
      :size="iconSize"
      class="button-icon-right"
    />

    <!-- Badge/Indicator -->
    <span v-if="badge" class="button-badge">{{ badge }}</span>
  </button>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  X,
  User,
  User2,
  Plus,
  Calendar,
  MapPin,
  ClipboardList,
  CheckCircle,
  Clock,
  Building,
  Users,
  UserX,
  Receipt,
} from "lucide-vue-next";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      [
        "primary",
        "secondary",
        "danger",
        "success",
        "warning",
        "info",
        "ghost",
        "outline",
      ].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["xs", "sm", "md", "lg", "xl"].includes(value),
  },
  text: String,
  // ✅ FIXED: Now accepts String | Object | Function
  leftIcon: [String, Object, Function],
  rightIcon: [String, Object, Function],
  iconSize: {
    type: Number,
    default: 16,
  },
  disabled: Boolean,
  loading: Boolean,
  badge: [String, Number],
  block: Boolean,
  rounded: {
    type: String,
    default: "md",
    validator: (value) => ["none", "sm", "md", "lg", "full"].includes(value),
  },
});

const emit = defineEmits(["click"]);

const localLoading = ref(false);

const isLoading = computed(() => props.loading || localLoading.value);

const buttonClasses = computed(() => [
  "base-button",
  `btn-${props.variant}`,
  `btn-${props.size}`,
  `btn-rounded-${props.rounded}`,
  {
    "btn-block": props.block,
    "btn-loading": isLoading.value,
    "btn-disabled": props.disabled,
  },
]);

// ✅ NEW: Resolves string icons to components
function resolveIcon(icon) {
  if (!icon) return null;

  // If already a component, return as-is
  if (typeof icon === "object" || typeof icon === "function") {
    return icon;
  }

  // Map strings to Lucide components
  const iconMap = {
    // Common icons
    X: X,
    close: X,
    clear: X,
    delete: X,

    // User icons
    user: User,
    user2: User2,

    // Dashboard icons
    plus: Plus,
    calendar: Calendar,
    "map-pin": MapPin,
    "clipboard-list": ClipboardList,
    "check-circle": CheckCircle,
    clock: Clock,
    building: Building,
    users: Users,
    "user-x": UserX,
    receipt: Receipt,

    // FontAwesome equivalents
    "fa-users": Users,
    "fa-user-times": UserX,
    "fa-clipboard-list": ClipboardList,
    "fa-check-circle": CheckCircle,
    "fa-clock": Clock,
    "fa-calendar-alt": Calendar,
    "fa-building": Building,
    "fa-map-marked-alt": MapPin,
    "fa-map": MapPin,
    "fa-receipt": Receipt,
  };

  return iconMap[icon] || X; // Default to X
}

function handleClick(event) {
  if (isLoading.value || props.disabled) return;

  localLoading.value = true;
  emit("click", event);

  setTimeout(() => {
    localLoading.value = false;
  }, 1500);
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  position: relative;
  white-space: nowrap;
  user-select: none;
}

.base-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  background: rgb(244, 84, 84);
  color: white;
  /* border-color: #3b82f6; */
}
.btn-primary:hover:not(:disabled) {
  background: rgb(244, 84, 84);

  transform: translateY(-1px);
}

.btn-secondary {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  border-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-success {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
  border-color: #059669;
}

.btn-warning {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
  border-color: #d97706;
}

.btn-info {
  background: #06b6d4;
  color: white;
  border-color: #06b6d4;
}

.btn-info:hover:not(:disabled) {
  background: #0891b2;
  border-color: #0891b2;
}

.btn-ghost {
  background: transparent;
  color: #64748b;
  border-color: transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: #f1f5f9;
  color: #475569;
}

.btn-outline {
  background: transparent;
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-outline:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
}

/* Sizes */
.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;

  gap: 0.25rem;
}
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;

  gap: 0.375rem;
}
.btn-md {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;

  gap: 0.5rem;
}
.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;

  gap: 0.5rem;
}
.btn-xl {
  padding: 1rem 2rem;

  font-size: 1.125rem;
  gap: 0.75rem;
}

.btn-rounded-none {
  border-radius: 0;
}
.btn-rounded-sm {
  border-radius: 0.25rem;
}
.btn-rounded-md {
  border-radius: 0.375rem;
}
.btn-rounded-lg {
  border-radius: 0.5rem;
}
.btn-rounded-full {
  border-radius: 9999px;
}

.btn-block {
  width: 100%;
}

.btn-disabled,
.btn-loading {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.button-icon-left,
.button-icon-right {
  flex-shrink: 0;
}

.button-text {
  flex: 1;
}

.button-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: medium;

  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

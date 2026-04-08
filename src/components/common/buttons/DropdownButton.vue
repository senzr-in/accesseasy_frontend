<template>
  <div class="dropdown-container" ref="dropdownRef">
    <BaseButton
      :variant="variant"
      :size="size"
      :disabled="disabled"
      :leftIcon="leftIcon"
      :rightIcon="ChevronDown"
      @click="toggleDropdown"
    >
      {{ text }}
    </BaseButton>

    <div
      v-if="isOpen"
      class="dropdown-menu"
      :class="[`dropdown-${placement}`, menuClass]"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="dropdown-item"
        :class="{ 'dropdown-item-disabled': item.disabled }"
        @click="handleItemClick(item)"
      >
        <component
          v-if="item.icon"
          :is="item.icon"
          :size="16"
          class="dropdown-item-icon"
        />
        <span class="dropdown-item-text">{{ item.label }}</span>
        <span v-if="item.badge" class="dropdown-item-badge">{{
          item.badge
        }}</span>
      </div>

      <!-- Custom content slot -->
      <slot name="dropdown-content" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { ChevronDown } from "lucide-vue-next";
import BaseButton from "./BaseButton.vue";

const props = defineProps({
  text: String,
  variant: {
    type: String,
    default: "secondary",
  },
  size: {
    type: String,
    default: "md",
  },
  disabled: Boolean,
  leftIcon: [Object, Function],

  // Dropdown specific
  items: {
    type: Array,
    default: () => [],
  },
  placement: {
    type: String,
    default: "bottom-right",
    validator: (value) =>
      ["bottom-left", "bottom-right", "top-left", "top-right"].includes(value),
  },
  menuClass: String,
});

const emit = defineEmits(["itemClick", "toggle"]);

const isOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  emit("toggle", isOpen.value);
};

const handleItemClick = (item) => {
  if (item.disabled) return;

  emit("itemClick", item);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  z-index: 10000;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: visible;
}

.dropdown-container * {
  overflow: visible;
}

.dropdown-bottom-left {
  top: 100%;
  left: 0;
}

.dropdown-bottom-right {
  top: 100%;
  right: 0;
}

.dropdown-top-left {
  bottom: 100%;
  left: 0;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.dropdown-top-right {
  bottom: 100%;
  right: 0;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover:not(.dropdown-item-disabled) {
  background-color: #f8fafc;
}

.dropdown-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-item-icon {
  flex-shrink: 0;
  color: #64748b;
}

.dropdown-item-text {
  flex: 1;
  font-size: 0.875rem;

  color: #1e293b;
}

.dropdown-item-badge {
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.75rem;

  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}
</style>

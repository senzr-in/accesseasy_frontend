<!-- Changed from full-screen modal to right-side sidebar drawer -->
<template>
  <Transition name="slide-fade">
    <div v-if="open" class="cwo-overlay">
      <!-- Sidebar drawer that slides in from right -->
      <div class="cwo-sidebar">
        <div class="cwo-header">
          <div class="header-content">
            <h3 class="title">Create Field Job</h3>
            <button
              class="close-btn"
              @click="onClose"
              aria-label="Close sidebar"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Form content inside sidebar with proper scrolling -->
        <div class="cwo-body">
          <CreateWorkOrder :embedded="true" @created="onCreated" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import CreateWorkOrder from "./createWorkOrder.vue";
import { useFormApi as formApi } from "@/composables/workorder/createWorkOrderForm/useFormApi";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "created"]);

const { fetchDropdownData } = formApi();

const open = computed(() => props.modelValue);

const onClose = () => {
  console.log("[v0] Close button clicked, emitting update:modelValue = false");
  emit("update:modelValue", false);
};

const onCreated = () => {
  console.log("[v0] Task created successfully, closing sidebar");
  emit("created");
  onClose();
};

watch(
  () => props.modelValue,
  (newVal) => {
    console.log("[v0] modelValue changed to:", newVal);
    if (newVal) {
      console.log("[v0] Fetching dropdown data...");
      Promise.resolve(fetchDropdownData()).catch((err) => {
        console.error("[v0] Error fetching dropdown data:", err);
      });
    }
  },
);
</script>

<style scoped>
/* Overlay for semi-transparent background */
.cwo-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 900;
  display: flex;
  justify-content: flex-end;
}

/* Sidebar drawer styling - slides in from right */
.cwo-sidebar {
  width: 1100px;
  max-width: 90vw;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.cwo-header {
  background: #ffffff;
  padding: 10px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  margin-top: 50px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-weight: 600;
  font-size: 1.25rem;
  margin: 0;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
  border-radius: 4px;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #1f2937;
  background: #f3f4f6;
}

.close-btn svg {
  width: 28px;
  height: 28px;
  stroke-width: 2.5;
}

/* Body with visible scrollbar for form content */
.cwo-body {
  flex: 1;
  /* overflow-y: auto; */
  /* padding: 24px; */
  background: #fafbfc;
}

/* Custom scrollbar styling for better visibility */
.cwo-body::-webkit-scrollbar {
  width: 8px;
}

.cwo-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.cwo-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.cwo-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox scrollbar */
.cwo-body {
  scrollbar-color: #cbd5e1 #f1f5f9;
  scrollbar-width: thin;
}

/* Slide animation from right to left */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
  .cwo-sidebar {
    width: 100%;
    max-width: 100%;
  }

  .cwo-body {
    padding: 16px;
  }

  .title {
    font-size: 1.1rem;
  }
}
</style>

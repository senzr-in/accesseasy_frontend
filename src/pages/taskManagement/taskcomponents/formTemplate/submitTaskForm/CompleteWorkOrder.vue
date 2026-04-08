<!-- senzrfieldopsfrontend/src/pages/taskManagement/taskcomponents/formTemplate/submitTaskForm/CompleteWorkOrder.vue -->
<template>
  <Transition name="slide-fade">
    <div v-if="modelValue" class="cwo-overlay">
      <!-- Sidebar drawer that slides in from right -->
      <div class="cwo-sidebar">
        <div class="cwo-header">
          <div class="header-content">
            <h3 class="title">Job Details</h3>
            <button
              class="close-btn"
              @click="$emit('update:modelValue', false)"
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
          <section class="drawer-body">
            <InternalTaskCompletionSidebar
              v-if="isInternalTask"
              :modelValue="modelValue"
              :task="task"
              @update:modelValue="$emit('update:modelValue', $event)"
              @complete="$emit('complete', $event)"
              @saveDraft="$emit('saveDraft', $event)"
            />

            <WorkOrderTaskCompletionSidebar
              v-else
              :modelValue="modelValue"
              :taskId="task?.id"
              :assignFormId="task?.assignFormId"
              @update:modelValue="$emit('update:modelValue', $event)"
              @complete="$emit('complete', $event)"
              @saveDraft="$emit('saveDraft', $event)"
            />
          </section>

          <footer class="drawer-footer">
            <small class="muted">
              Task details are view-only. The task can be completed by mobile
              app only.
            </small>
          </footer>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from "vue";
import InternalTaskCompletionSidebar from "./CompleteTask/completeInternalTask.vue";
import WorkOrderTaskCompletionSidebar from "./CompleteTask/completeWorkOrder.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  task: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:modelValue", "complete", "saveDraft"]);

const isInternalTask = computed(() => {
  const assignFormId = props.task?.assignFormId;
  return !assignFormId || assignFormId === "" || assignFormId === null;
});
</script>

<style scoped>
/* Overlay for semi-transparent background */
.cwo-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 904; /* Ensure it stays above the table but below other UI elements if needed */
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
  margin-top: 50px; /* Matches the top offset of CreateWorkOrderSidebar */
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
  background: #fafbff;
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

/* Drawer body styling */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Footer styling */
.drawer-footer {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 12px 24px; /* Match padding with cwo-body */
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.muted {
  color: #6b7280;
  font-size: 0.875rem;
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

  .drawer-footer {
    padding: 12px 16px;
  }
}
</style>

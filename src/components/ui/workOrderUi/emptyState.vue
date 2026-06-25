<template>
  <div class="empty-state">
    <div class="empty-state-content">
      <div class="empty-state-icon">
        <FileTextIcon class="w-full h-full" />
      </div>
      <h3 class="empty-state-title">
        Ready to Build Your Form?
      </h3>
      <p class="empty-state-description">
        Select an existing form from the sidebar to start configuring, or create
        a new work order form from scratch.
      </p>
      <div class="empty-state-actions">
        <button
          class="btn btn-primary"
          @click="$emit('createNewForm')"
        >
          <PlusIcon class="btn-icon" />
          Create New Form
        </button>
        <button
          class="btn btn-secondary"
          @click="$emit('showHelp')"
        >
          <HelpCircleIcon class="btn-icon" />
          Get Help
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FileTextIcon, PlusIcon, HelpCircleIcon } from "lucide-vue-next";

defineEmits(["createNewForm", "showHelp"]);
</script>

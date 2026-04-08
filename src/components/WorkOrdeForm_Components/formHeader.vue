<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <div class="header-icon">
          <Settings class="w-6 h-6" />
        </div>
        <div>
          <h3 class="header-title">Work Order Form Builder</h3>
          <p class="header-subtitle">
            Create and configure work order forms easily
          </p>
        </div>
      </div>
      <div class="header-right">
        <div class="header-info-cards">
          <span class="tenant-info">
            <Users class="info-icon" />
            Tenant: {{ currentTenant }}
          </span>
          <span class="user-info">
            <Shield class="info-icon" />
            Role: {{ userRole }}
          </span>
        </div>
        <!-- Help Button -->
        <button
          @click="$emit('showHelp')"
          class="btn btn-help"
          title="Get Help"
        >
          <HelpCircleIcon class="btn-icon" />
          Help
        </button>
        <button
          @click="$emit('saveConfiguration')"
          :disabled="!selectedForm || saving"
          class="btn btn-primary"
          :class="{ 'btn-loading': saving }"
        >
          <Save class="btn-icon" v-if="!saving" />
          <div v-if="saving" class="loading-spinner-small"></div>
          {{ saving ? "Saving..." : "Save Configuration" }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Settings, Users, Shield, HelpCircleIcon, Save } from "lucide-vue-next";

defineProps({
  currentTenant: String,
  userRole: String,
  selectedForm: Object,
  saving: Boolean,
});

defineEmits(["showHelp", "saveConfiguration"]);
</script>

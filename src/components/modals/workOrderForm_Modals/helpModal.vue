<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content enhanced-modal modal-large" @click.stop>
      <div class="modal-header">
        <div class="modal-title-section">
          <h3 class="modal-title">
            <HelpCircleIcon class="modal-title-icon" />
            Form Builder Help
          </h3>
          <p class="modal-subtitle">
            Learn how to create and configure work order forms
          </p>
        </div>
        <button @click="$emit('close')" class="modal-close">
          <XIcon class="w-6 h-6" />
        </button>
      </div>
      <div class="modal-body">
        <div class="help-content">
          <div class="help-section">
            <h4 class="help-section-title">
              <Zap class="help-icon" />
              Getting Started
            </h4>
            <div class="help-steps">
              <div class="help-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <div class="step-title">Create a New Form</div>
                  <div class="step-description">
                    Click "Create New Form" and give it a descriptive name
                  </div>
                </div>
              </div>
              <div class="help-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <div class="step-title">Add Fields</div>
                  <div class="step-description">
                    Use "Add Field" to create input fields for your work orders
                  </div>
                </div>
              </div>
              <div class="help-step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <div class="step-title">Configure Settings</div>
                  <div class="step-description">
                    Set validation rules and role-based permissions
                  </div>
                </div>
              </div>
              <div class="help-step">
                <div class="step-number">4</div>
                <div class="step-content">
                  <div class="step-title">Save & Test</div>
                  <div class="step-description">
                    Save your configuration and test the form
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="help-section">
            <h4 class="help-section-title">
              <TypeIcon class="help-icon" />
              Field Types
            </h4>
            <div class="field-types-help">
              <div
                v-for="fieldType in fieldTypeOptions"
                :key="fieldType.value"
                class="field-type-help"
              >
                <component
                  :is="getFieldTypeIcon(fieldType.value)"
                  class="field-help-icon"
                />
                <div>
                  <div class="field-help-name">{{ fieldType.label }}</div>
                  <div class="field-help-desc">{{ fieldType.description }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="help-section">
            <h4 class="help-section-title">
              <Users class="help-icon" />
              Role-Based Configuration
            </h4>
            <p class="help-description">
              Configure which roles can see and edit specific fields. Use
              "Required for Roles" to make fields visible only to certain roles,
              and "Mandatory for Roles" to make them required.
            </p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-primary">Got it!</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  HelpCircleIcon,
  XIcon,
  Zap,
  TypeIcon,
  FileTextIcon,
  ListIcon,
  CalendarIcon,
  Users,
} from "lucide-vue-next";

import { fieldTypeOptions } from "@/utils/config/constants";
import { getFieldTypeIcon } from "@/utils/config/fieldHelpers";

defineProps({
  show: Boolean,
});

defineEmits(["close"]);
</script>

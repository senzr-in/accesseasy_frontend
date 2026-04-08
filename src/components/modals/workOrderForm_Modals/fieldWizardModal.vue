<!-- /senzrGo/senzrfieldopsfrontend/src/components/modals/workOrderForm_Modals/fieldWizardModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content enhanced-modal modal-large" @click.stop>
      <div class="modal-header">
        <div class="modal-title-section">
          <h3 class="modal-title">
            <Zap class="modal-title-icon" />
            Add New Field
          </h3>
          <p class="modal-subtitle">
            Configure your field settings. Don't worry, you can always change
            these later.
          </p>
        </div>
        <button @click="$emit('close')" class="modal-close">
          <XIcon class="w-6 h-6" />
        </button>
      </div>
      <div class="modal-body">
        <!-- Form Selection -->
        <div class="form-group">
          <label class="form-label">
            <FileTextIcon class="label-icon" />
            Select Form
          </label>
          <select v-model="selectedFormId" class="form-select">
            <option
              v-for="form in selectedForm.custom_FormTemplate?.forms || []"
              :key="form.form_id"
              :value="form.form_id"
            >
              {{ form.form_name }}
            </option>
          </select>
          <div class="field-help">Choose the form to add this field to</div>
        </div>

        <div class="wizard-steps">
          <div class="wizard-step" :class="{ active: wizardStep === 1 }">
            <div class="step-number">1</div>
            <div class="step-label">Basic Info</div>
          </div>
          <div class="wizard-step" :class="{ active: wizardStep === 2 }">
            <div class="step-number">2</div>
            <div class="step-label">Field Type</div>
          </div>
          <div class="wizard-step" :class="{ active: wizardStep === 3 }">
            <div class="step-number">3</div>
            <div class="step-label">Settings</div>
          </div>
        </div>

        <!-- Step 1: Basic Information -->
        <div v-if="wizardStep === 1" class="wizard-content">
          <h4 class="wizard-section-title">Basic Field Information</h4>
          <div class="form-group">
            <label class="form-label">
              <TagIcon class="label-icon" />
              Field Label *
            </label>
            <input
              v-model="wizardField.label"
              type="text"
              class="form-input"
              placeholder="e.g., Equipment Type"
              @input="generateFieldKey"
            />
            <div class="field-help">
              This is what users will see as the field name
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">
              <MessageSquareIcon class="label-icon" />
              Placeholder Text
            </label>
            <input
              v-model="wizardField.placeholder"
              type="text"
              class="form-input"
              placeholder="e.g., Select equipment type"
            />
            <div class="field-help">Hint text shown inside the field</div>
          </div>
          <div class="form-group">
            <label class="form-label">
              <KeyIcon class="label-icon" />
              Field Key
            </label>
            <input
              v-model="wizardField.key"
              type="text"
              class="form-input form-input-disabled"
              disabled
            />
            <div class="field-help">Auto-generated unique identifier</div>
          </div>
        </div>

        <!-- Step 2: Field Type Selection -->
        <div v-if="wizardStep === 2" class="wizard-content">
          <h4 class="wizard-section-title">Choose Field Type</h4>
          <div class="field-type-grid">
            <div
              v-for="fieldType in fieldTypeOptions"
              :key="fieldType.value"
              @click="selectFieldType(fieldType)"
              class="field-type-option"
              :class="{ selected: isFieldTypeSelected(fieldType) }"
            >
              <div class="field-type-icon">
                <component :is="fieldType.icon" class="w-6 h-6" />
              </div>
              <div class="field-type-info">
                <div class="field-type-name">{{ fieldType.label }}</div>
                <div class="field-type-description">
                  {{ fieldType.description }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Field Settings -->
        <div v-if="wizardStep === 3" class="wizard-content">
          <h4 class="wizard-section-title">Field Settings</h4>
          <div class="form-group">
            <label class="form-label">
              <ClockIcon class="label-icon" />
              When to Show This Field
            </label>
            <select v-model="wizardField.field_type" class="form-select">
              <option value="creation">During Creation</option>
              <option value="completion">During Completion</option>
              <option value="creation/completion">
                Both Creation & Completion
              </option>
            </select>
          </div>
          <div class="toggle-item">
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="wizardField.required"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label">Make this field required</span>
          </div>
          <!-- Quick Tips -->
          <div class="wizard-tips">
            <div class="tips-header">
              <Lightbulb class="tips-icon" />
              <span class="tips-title">Quick Tips</span>
            </div>
            <div class="tips-list">
              <div class="tip-item">
                <CheckCircleIcon class="tip-icon" />
                <span>Start with basic settings and refine them later</span>
              </div>
              <div class="tip-item">
                <CheckCircleIcon class="tip-icon" />
                <span
                  >You can add validation rules and role-based access after
                  creation</span
                >
              </div>
              <div class="tip-item">
                <CheckCircleIcon class="tip-icon" />
                <span>Required fields help ensure data quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button
          v-if="wizardStep > 1"
          @click="wizardStep--"
          class="btn btn-secondary"
        >
          <ChevronLeftIcon class="btn-icon" />
          Previous
        </button>
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancel
        </button>
        <button
          v-if="wizardStep < 3"
          @click="wizardStep++"
          class="btn btn-primary"
          :disabled="!canProceedToNextStep()"
        >
          Next
          <ChevronRightIcon class="btn-icon" />
        </button>
        <button
          v-if="wizardStep === 3"
          @click="handleSaveField"
          class="btn btn-primary"
          :disabled="!wizardField.label?.trim() || !selectedFormId"
        >
          <PlusIcon class="btn-icon" />
          Add Field
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import {
  Zap,
  XIcon,
  TagIcon,
  MessageSquareIcon,
  KeyIcon,
  ClockIcon,
  Lightbulb,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  FileTextIcon,
} from "lucide-vue-next";

import { fieldTypeOptions } from "@/utils/config/constants";

const props = defineProps({
  show: Boolean,
  selectedForm: Object,
});

const emit = defineEmits(["close", "saveField", "showNotification"]);

const wizardStep = ref(1);
const wizardField = ref({});
const selectedFormId = ref(null);

const generateFieldKey = () => {
  if (wizardField.value.label) {
    wizardField.value.key =
      wizardField.value.label
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "") +
      "_" +
      Date.now();
  }
};

const selectFieldType = (fieldType) => {
  wizardField.value.type = fieldType.value;
};

const isFieldTypeSelected = (fieldType) => {
  if (
    typeof fieldType.value === "object" &&
    typeof wizardField.value.type === "object"
  ) {
    return fieldType.value.date === wizardField.value.type.date;
  }
  return wizardField.value.type === fieldType.value;
};

const canProceedToNextStep = () => {
  if (wizardStep.value === 1) {
    return wizardField.value.label?.trim() && selectedFormId.value;
  }
  if (wizardStep.value === 2) {
    return wizardField.value.type;
  }
  return true;
};

const handleSaveField = () => {
  if (!props.selectedForm || !wizardField.value.label || !selectedFormId.value)
    return;

  const newField = {
    key: wizardField.value.key || `field_${Date.now()}`,
    label: wizardField.value.label,
    placeholder:
      wizardField.value.placeholder ||
      `Enter ${wizardField.value.label?.toLowerCase()}`,
    field_type: wizardField.value.field_type || "creation",
    type: wizardField.value.type || "text",
    roleBasedRequired: {},
    roleBasedMandatory: {},
    validations: { required: wizardField.value.required || false },
    options:
      wizardField.value.type === "dropdown"
        ? ["Option 1", "Option 2"]
        : undefined,
  };

  // Emit both field data and selected form ID
  emit("saveField", newField, selectedFormId.value);
  emit("showNotification", "Field added successfully!", "success");
  emit("close");
};

// Reset wizard when modal closes
watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      wizardStep.value = 1;
      wizardField.value = {};
      selectedFormId.value = null;
    } else {
      wizardField.value = {
        key: `field_${Date.now()}`,
        label: "",
        placeholder: "",
        field_type: "creation",
        type: "text",
        required: false,
      };
      // Default to first form if available
      if (props.selectedForm.custom_FormTemplate?.forms?.length > 0) {
        selectedFormId.value =
          props.selectedForm.custom_FormTemplate.forms[0].form_id;
      }
    }
  },
);
</script>

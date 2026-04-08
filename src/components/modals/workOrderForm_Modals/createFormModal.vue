<!-- /senzrGo/senzrfieldopsfrontend/src/components/modals/workOrderForm_Modals/createFormModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content enhanced-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-title-section">
          <h3 class="modal-title">
            <PlusIcon class="modal-title-icon" />
            Create New Form
          </h3>
          <p class="modal-subtitle">
            Give your form a descriptive name that clearly identifies its
            purpose
          </p>
        </div>
        <button @click="$emit('close')" class="modal-close">
          <XIcon class="w-6 h-6" />
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">
            <TagIcon class="label-icon" />
            Form Name
          </label>
          <input
            v-model="formData.form_name"
            type="text"
            class="form-input"
            placeholder="e.g., Equipment Maintenance Request"
          />
        </div>
        <div class="form-group">
          <label class="form-label">
            <Building class="label-icon" />
            Organization
          </label>
          <select v-model="formData.orgId" class="form-select">
            <option :value="null" disabled>Select an organization</option>
            <option
              v-for="org in organizationsOptions"
              :key="org.id"
              :value="org.id"
            >
              {{ org.orgName }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">
            <MapPinIcon class="label-icon" />
            Requires Location
          </label>
          <label class="toggle-switch">
            <input
              type="checkbox"
              v-model="formData.requires_location"
              class="toggle-input"
            />
            <span class="toggle-slider"></span>
          </label>
          <div class="field-help">Enable if this form requires a location</div>
        </div>
        <!-- Template Selection -->
        <div class="form-group">
          <label class="form-label">
            <FileTextIcon class="label-icon" />
            Copy from Template (Optional)
          </label>
          <select
            v-model="formData.templateId"
            class="form-select"
            :disabled="loadingTemplates"
          >
            <option :value="null">
              {{
                loadingTemplates
                  ? "Loading templates..."
                  : "Start with default template"
              }}
            </option>
            <option
              v-for="template in availableTemplates"
              :key="template.id"
              :value="template.id"
            >
              {{ template.formName }}
            </option>
          </select>
          <div
            v-if="formData.templateId"
            class="template-info template-info-selected"
          >
            <CheckCircleIcon class="inline-icon" />
            This will copy all fields and configurations from the selected
            template.
          </div>
          <div v-else class="template-info">
            <CheckCircleIcon class="inline-icon" />
            Will create form with default configuration.
          </div>
        </div>
        <!-- Tips Section -->
        <div class="creation-tips">
          <div class="tips-header">
            <Lightbulb class="tips-icon" />
            <span class="tips-title">Quick Tips</span>
          </div>
          <div class="tips-list">
            <div class="tip-item">
              <CheckCircleIcon class="tip-icon" />
              <span
                >Use clear, descriptive names like "Equipment Maintenance" or
                "Facility Repair Request"</span
              >
            </div>
            <div class="tip-item">
              <CheckCircleIcon class="tip-icon" />
              <span>You can always edit the form name and settings later</span>
            </div>
            <div class="tip-item">
              <CheckCircleIcon class="tip-icon" />
              <span
                >Templates help you get started faster with pre-configured
                fields</span
              >
            </div>
          </div>
        </div>
        <div class="toggle-item mt-4">
          <label class="toggle-switch">
            <input
              type="checkbox"
              v-model="formData.enabled"
              class="toggle-input"
            />
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">Enable Form</span>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancel
        </button>
        <button
          @click="handleCreateForm"
          class="btn btn-primary"
          :disabled="!formData.form_name.trim() || creating || loadingTemplates"
        >
          <div v-if="creating" class="loading-spinner-small"></div>
          <PlusIcon v-else class="btn-icon" />
          {{ creating ? "Creating..." : "Create Form" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import {
  PlusIcon,
  XIcon,
  TagIcon,
  Building,
  FileTextIcon,
  CheckCircleIcon,
  Lightbulb,
  MapPinIcon,
} from "lucide-vue-next";

const props = defineProps({
  show: Boolean,
  creating: Boolean,
  loadingTemplates: Boolean,
  organizationsOptions: Array,
  availableTemplates: Array,
});

const emit = defineEmits(["close", "createForm"]);

const formData = ref({
  form_name: "",
  orgId: null,
  templateId: null,
  enabled: true,
  requires_location: false,
  location_field_key: { lat: "", lng: "" },
});

const handleCreateForm = () => {
  emit("createForm", formData.value);
};

// Reset form data when modal closes
watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      formData.value = {
        form_name: "",
        orgId: null,
        templateId: null,
        enabled: true,
        requires_location: false,
        location_field_key: { lat: "", lng: "" },
      };
    }
  },
);
</script>

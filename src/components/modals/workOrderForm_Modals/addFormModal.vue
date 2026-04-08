<!-- /senzrGo/senzrfieldopsfrontend/src/components/modals/workOrderForm_Modals/addFormModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content enhanced-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-title-section">
          <h3 class="modal-title">
            <PlusIcon class="modal-title-icon" />
            Add New Form to {{ selectedForm.formName }}
          </h3>
          <p class="modal-subtitle">
            Add a new form to the existing work order configuration
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
            Form Name *
          </label>
          <input
            v-model="formData.form_name"
            type="text"
            class="form-input"
            placeholder="e.g., Additional Task Form"
          />
          <div class="field-help">Provide a unique name for this form</div>
        </div>
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
                loadingTemplates ? "Loading templates..." : "Create empty form"
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
            This will copy fields from the selected template, excluding any
            restricted fields already present in other forms.
          </div>
          <div v-else class="template-info">
            <CheckCircleIcon class="inline-icon" />
            Will create an empty form with no fields.
          </div>
        </div>
        <div class="creation-tips">
          <div class="tips-header">
            <Lightbulb class="tips-icon" />
            <span class="tips-title">Quick Tips</span>
          </div>
          <div class="tips-list">
            <div class="tip-item">
              <CheckCircleIcon class="tip-icon" />
              <span>Use a descriptive name to identify the form's purpose</span>
            </div>
            <div class="tip-item">
              <CheckCircleIcon class="tip-icon" />
              <span
                >Existing fields like orgId or UsersId will not be
                duplicated</span
              >
            </div>
            <div class="tip-item">
              <CheckCircleIcon class="tip-icon" />
              <span>You can add or edit fields after creating the form</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancel
        </button>
        <button
          @click="handleAddForm"
          class="btn btn-primary"
          :disabled="!formData.form_name.trim() || adding || loadingTemplates"
        >
          <div v-if="adding" class="loading-spinner-small"></div>
          <PlusIcon v-else class="btn-icon" />
          {{ adding ? "Adding..." : "Add Form" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import {
  PlusIcon,
  XIcon,
  TagIcon,
  FileTextIcon,
  CheckCircleIcon,
  Lightbulb,
} from "lucide-vue-next";

const props = defineProps({
  show: Boolean,
  selectedForm: Object,
  availableTemplates: Array,
  loadingTemplates: Boolean,
});

const emit = defineEmits(["close", "addForm", "showNotification"]);

const formData = ref({
  form_name: "",
  templateId: null,
});

const adding = ref(false);

const handleAddForm = async () => {
  if (!formData.value.form_name.trim()) {
    emit("showNotification", "Form Name is required.", "error");
    return;
  }

  adding.value = true;
  try {
    emit("addForm", formData.value);
  } catch (error) {
    console.error("Error adding form:", error);
    emit("showNotification", "Error adding form. Please try again.", "error");
  } finally {
    adding.value = false;
  }
};

// Reset form data when modal closes
watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      formData.value = {
        form_name: "",
        templateId: null,
      };
    }
  },
);
</script>

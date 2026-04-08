<!-- /senzrGo/senzrfieldopsfrontend/src/components/WorkOrdeForm_Components/fieldConfiguration.vue -->
<template>
  <div class="fields-tab">
    <!-- Getting Started Guide -->
    <div
      v-if="!selectedForm.custom_FormTemplate?.forms?.length"
      class="getting-started-guide"
    >
      <div class="guide-content">
        <div class="guide-icon">
          <Lightbulb class="w-8 h-8" />
        </div>
        <div class="guide-text">
          <h3 class="guide-title">Getting Started with Form Fields</h3>
          <p class="guide-description">
            Add forms and fields to collect information in your work orders.
            Start with basic forms and fields like title, description, and
            priority.
          </p>
          <div class="guide-tips">
            <div class="tip-item">
              <CheckCircleIcon class="tip-icon" />
              <span>Start with essential fields first</span>
            </div>
            <div class="tip-item">
              <CheckCircleIcon class="tip-icon" />
              <span>Use clear, descriptive field labels</span>
            </div>
            <div class="tip-item">
              <CheckCircleIcon class="tip-icon" />
              <span>Set validation rules to ensure data quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forms Header with Add Form Button -->
    <div class="fields-header">
      <div class="fields-header-content">
        <h3 class="fields-title">Forms and Fields</h3>
        <p class="fields-description">
          Add and configure forms and their fields for your work order
        </p>
      </div>
      <div class="fields-actions">
        <button @click="$emit('showAddFormModal')" class="btn btn-success">
          <PlusIcon class="btn-icon" />
          Add New Form
        </button>
        <button @click="$emit('showFieldWizard')" class="btn btn-success">
          <PlusIcon class="btn-icon" />
          Add Field
        </button>
      </div>
    </div>

    <!-- Enhanced Empty Forms State -->
    <div
      v-if="!selectedForm.custom_FormTemplate?.forms?.length"
      class="empty-fields-state"
    >
      <div class="empty-fields-content">
        <div class="empty-fields-icon-wrapper">
          <ListPlusIcon class="empty-fields-icon" />
        </div>
        <h3 class="empty-fields-title">No Forms Yet</h3>
        <p class="empty-fields-description">
          Start building your work order by adding forms. Each form can have
          fields like text inputs, dropdowns, date pickers, and more.
        </p>
        <button @click="$emit('showAddFormModal')" class="btn btn-primary">
          <PlusIcon class="btn-icon" />
          Add Your First Form
        </button>
      </div>
    </div>

    <!-- Form Sections -->
    <div
      v-for="form in selectedForm.custom_FormTemplate?.forms || []"
      :key="form.form_id"
      class="form-section"
    >
      <div class="form-header">
        <h3 class="form-title">{{ form.form_name }}</h3>
        <div class="form-details">
          <span class="form-badge"
            >Location Required:
            {{ form.requires_location ? "Yes" : "No" }}</span
          >
        </div>
      </div>

      <!-- Empty Fields State for Form -->
      <div v-if="!form.fields?.length" class="empty-fields-state">
        <div class="empty-fields-content">
          <h3 class="empty-fields-title">No Fields in {{ form.form_name }}</h3>
          <p class="empty-fields-description">
            Add fields to this form to collect specific information.
          </p>
          <button @click="$emit('showFieldWizard')" class="btn btn-primary">
            <PlusIcon class="btn-icon" />
            Add Field to {{ form.form_name }}
          </button>
        </div>
      </div>

      <!-- Enhanced Field Cards -->
      <div
        v-for="(field, index) in form.fields || []"
        :key="field.key"
        class="field-config enhanced-field-card"
      >
        <div class="field-header">
          <div class="field-header-left">
            <div class="field-type-icon">
              <component :is="getFieldTypeIcon(field.type)" class="w-5 h-5" />
            </div>
            <div class="field-info">
              <h3 class="field-title">{{ field.label }}</h3>
              <div class="field-badges">
                <span class="field-type-badge">{{
                  getFieldTypeDisplay(field.type)
                }}</span>
                <span class="field-phase-badge">{{ field.field_type }}</span>
                <span
                  v-if="field.validations?.required"
                  class="field-required-badge"
                  >Required</span
                >
              </div>
            </div>
          </div>
          <div class="field-actions">
            <button
              @click="duplicateField(form, index)"
              class="action-btn action-btn-secondary"
              title="Duplicate Field"
            >
              <CopyIcon class="w-4 h-4" />
            </button>
            <button
              @click="removeField(form, index)"
              class="action-btn action-btn-danger"
              title="Remove Field"
            >
              <Trash2Icon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Enhanced Field Configuration -->
        <div class="field-basic-config">
          <div class="form-group">
            <label class="form-label">
              <TagIcon class="label-icon" />
              Label
            </label>
            <input
              v-model="field.label"
              type="text"
              class="form-input"
              placeholder="Enter field label"
            />
          </div>
          <div class="form-group">
            <label class="form-label">
              <MessageSquareIcon class="label-icon" />
              Placeholder
            </label>
            <input
              v-model="field.placeholder"
              type="text"
              class="form-input"
              placeholder="Enter placeholder text"
            />
          </div>
          <div class="form-group">
            <label class="form-label">
              <TypeIcon class="label-icon" />
              Field Type
            </label>
            <select
              v-model="field.type"
              @change="updateFieldType(field)"
              class="form-select"
            >
              <option value="text">📝 Text</option>
              <option value="number">🔢 Number</option>
              <option value="bigtext">📄 Big Text</option>
              <option value="dropdown">📋 Dropdown</option>
              <option value="boolean">✅ Boolean</option>
              <option :value="{ date: true }">📅 Date</option>
              <option value="image">🖼️ Image</option>
              <option value="gps">📍 Client Location</option>
              <option value="gps-currentLocation">
                📍 Employee Current Location
              </option>
              <option value="clientSelector">👥 Client Selector</option>
              <option value="UsersId">👥 Employee Selector</option>
              <option value="happy-code">😊 Happy Code</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">
              <ClockIcon class="label-icon" />
              Field Phase
            </label>
            <select v-model="field.field_type" class="form-select" disabled>
              <option value="creation">Creation</option>
              <option value="completion">Completion</option>
              <option value="creation/completion">Creation/Completion</option>
            </select>
          </div>
        </div>

        <!-- Enhanced Role-Based Configuration -->
        <div class="role-config enhanced-section">
          <h4 class="section-title">
            <Users class="section-icon" />
            Role-Based Configuration
          </h4>
          <div class="role-config-grid">
            <!-- Role Required -->
            <div class="role-section">
              <label class="section-label">Required for Roles</label>
              <div class="toggle-group">
                <div
                  v-for="role in roleOptions"
                  :key="role.id"
                  class="toggle-item"
                >
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      :checked="field.roleBasedRequired?.[role.name] || false"
                      @change="
                        updateRoleBasedProperty(
                          field,
                          'roleBasedRequired',
                          role.name,
                          $event.target.checked,
                        )
                      "
                      class="toggle-input"
                    />
                    <span class="toggle-slider toggle-slider-small"></span>
                  </label>
                  <span class="toggle-label">{{ role.name }}</span>
                </div>
              </div>
            </div>
            <!-- Role Mandatory -->
            <div class="role-section">
              <label class="section-label">Mandatory for Roles</label>
              <div class="toggle-group">
                <div
                  v-for="role in roleOptions"
                  :key="role.id"
                  class="toggle-item"
                >
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      :checked="field.roleBasedMandatory?.[role.name] || false"
                      @change="
                        updateRoleBasedProperty(
                          field,
                          'roleBasedMandatory',
                          role.name,
                          $event.target.checked,
                        )
                      "
                      class="toggle-input"
                    />
                    <span class="toggle-slider toggle-slider-small"></span>
                  </label>
                  <span class="toggle-label">{{ role.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Validation Configuration -->
        <div class="validation-config enhanced-section">
          <h4 class="section-title">
            <ShieldCheckIcon class="section-icon" />
            Validation Rules
          </h4>
          <div class="validation-grid">
            <div class="toggle-item validation-required">
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="field.validations.required"
                  class="toggle-input"
                />
                <span class="toggle-slider toggle-slider-small"></span>
              </label>
              <span class="toggle-label">Required Field</span>
            </div>
            <!-- Validation details shown only when required is true -->
            <template v-if="field.validations.required">
              <!-- Validation Message -->
              <div class="form-group validation-message">
                <label class="form-label">
                  <AlertCircleIcon class="label-icon" />
                  Validation Message
                </label>
                <input
                  v-model="field.validations.message"
                  type="text"
                  class="form-input"
                  placeholder="This field is required"
                />
              </div>
              <!-- Text/BigText Validations -->
              <div
                v-if="field.type === 'text' || field.type === 'bigtext'"
                class="form-group"
              >
                <label class="form-label">Min Length</label>
                <input
                  v-model.number="field.validations.minLength"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </div>
              <div
                v-if="field.type === 'text' || field.type === 'bigtext'"
                class="form-group"
              >
                <label class="form-label">Max Length</label>
                <input
                  v-model.number="field.validations.maxLength"
                  type="number"
                  class="form-input"
                  min="1"
                />
              </div>
              <!-- Number Validations -->
              <div v-if="field.type === 'number'" class="form-group">
                <label class="form-label">Min Value</label>
                <input
                  v-model.number="field.validations.min"
                  type="number"
                  class="form-input"
                />
              </div>
              <div v-if="field.type === 'number'" class="form-group">
                <label class="form-label">Max Value</label>
                <input
                  v-model.number="field.validations.max"
                  type="number"
                  class="form-input"
                />
              </div>
              <!-- Image Validations -->
              <template v-if="field.type === 'image'">
                <div class="form-group">
                  <label class="form-label">Max Size (MB)</label>
                  <input
                    v-model.number="field.validations.maxSizeMB"
                    type="number"
                    class="form-input"
                    min="1"
                    max="50"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Allowed File Types</label>
                  <div class="toggle-group">
                    <div class="toggle-item">
                      <label class="toggle-switch">
                        <input
                          type="checkbox"
                          :checked="
                            field.validations.fileTypeAllowed?.includes('jpg')
                          "
                          @change="
                            toggleFileType(field, 'jpg', $event.target.checked)
                          "
                          class="toggle-input"
                        />
                        <span class="toggle-slider toggle-slider-small"></span>
                      </label>
                      <span class="toggle-label">JPG</span>
                    </div>
                    <div class="toggle-item">
                      <label class="toggle-switch">
                        <input
                          type="checkbox"
                          :checked="
                            field.validations.fileTypeAllowed?.includes('jpeg')
                          "
                          @change="
                            toggleFileType(field, 'jpeg', $event.target.checked)
                          "
                          class="toggle-input"
                        />
                        <span class="toggle-slider toggle-slider-small"></span>
                      </label>
                      <span class="toggle-label">JPEG</span>
                    </div>
                    <div class="toggle-item">
                      <label class="toggle-switch">
                        <input
                          type="checkbox"
                          :checked="
                            field.validations.fileTypeAllowed?.includes('png')
                          "
                          @change="
                            toggleFileType(field, 'png', $event.target.checked)
                          "
                          class="toggle-input"
                        />
                        <span class="toggle-slider toggle-slider-small"></span>
                      </label>
                      <span class="toggle-label">PNG</span>
                    </div>
                  </div>
                </div>
              </template>
            </template>
            <!-- OTP / Happy Code Length Config -->
            <template
              v-if="field.type === 'otp' || field.type === 'happy-code'"
            >
              <div class="form-group">
                <label class="form-label">
                  <TypeIcon class="label-icon" />
                  Code Length
                </label>
                <input
                  type="number"
                  v-model.number="field.validations.length"
                  min="4"
                  max="10"
                  class="form-input"
                  placeholder="Enter code length (e.g., 4 for 4-digit code)"
                />
                <div class="field-help">
                  Define how many digits the OTP/Happy Code should have.
                </div>
              </div>
            </template>
            <!-- GPS Current Location Within Range Toggle -->
            <template v-if="field.type === 'gps-currentLocation'">
              <div class="toggle-item">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="field.validations.within_range"
                    class="toggle-input"
                  />
                  <span class="toggle-slider toggle-slider-small"></span>
                </label>
                <span class="toggle-label">Within Range</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Enhanced Dropdown Options -->
        <div
          v-if="field.type === 'dropdown'"
          class="dropdown-config enhanced-section"
        >
          <h4 class="section-title">
            <ListIcon class="section-icon" />
            Dropdown Options
          </h4>
          <div class="options-list">
            <div
              v-for="(option, optionIndex) in field.options || []"
              :key="optionIndex"
              class="option-item"
            >
              <input
                v-model="field.options[optionIndex]"
                type="text"
                class="form-input"
                placeholder="Option value"
              />
              <button
                @click="removeOption(field, optionIndex)"
                class="action-btn action-btn-danger"
              >
                <XIcon class="w-4 h-4" />
              </button>
            </div>
            <button @click="addOption(field)" class="btn btn-primary btn-sm">
              <PlusIcon class="btn-icon" />
              Add Option
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Lightbulb,
  CheckCircleIcon,
  PlusIcon,
  ListPlusIcon,
  CopyIcon,
  Trash2Icon,
  TagIcon,
  MessageSquareIcon,
  TypeIcon,
  ClockIcon,
  Users,
  ShieldCheckIcon,
  AlertCircleIcon,
  ListIcon,
  XIcon,
} from "lucide-vue-next";

import {
  getFieldTypeIcon,
  getFieldTypeDisplay,
} from "@/utils/config/fieldHelpers";
import {
  initializeValidations,
  toggleFileType,
} from "@/utils/config/validationHelpers";

const props = defineProps({
  selectedForm: Object,
  roleOptions: Array,
});

const emit = defineEmits([
  "showFieldWizard",
  "showAddFormModal",
  "showNotification",
]);

const updateFieldType = (field) => {
  if (field.type === "date") {
    field.type = { date: true };
  }
  initializeValidations(field);
};

const updateRoleBasedProperty = (field, property, roleName, value) => {
  if (!field[property]) {
    field[property] = {};
  }
  field[property][roleName] = value;
};

const removeField = (form, index) => {
  form.fields.splice(index, 1);
  emit("showNotification", "Field removed successfully!", "success");
};

const duplicateField = (form, index) => {
  const field = form.fields[index];
  const duplicatedField = {
    ...JSON.parse(JSON.stringify(field)),
    key: `${field.key}_copy_${Date.now()}`,
    label: `${field.label} (Copy)`,
  };
  form.fields.splice(index + 1, 0, duplicatedField);
  emit("showNotification", "Field duplicated successfully!", "success");
};

const addOption = (field) => {
  if (!field.options) {
    field.options = [];
  }
  field.options.push("");
};

const removeOption = (field, index) => {
  field.options.splice(index, 1);
};
</script>

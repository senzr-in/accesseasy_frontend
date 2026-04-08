<template>
  <div class="form-config-container">
    <!-- Left Sidebar for Template Selection -->
    <aside class="template-sidebar">
      <h2 class="sidebar-title">Form Templates</h2>
      <div v-if="isLoadingTemplates" class="loading-state">
        <div class="spinner"></div>
        <span>Loading templates...</span>
      </div>
      <div v-else-if="templateError" class="error-state">
        <p>{{ templateError }}</p>
      </div>
      <ul v-else class="template-list">
        <li
          v-for="template in formTemplates"
          :key="template.id"
          :class="{
            'template-item': true,
            active: selectedTemplateId === template.id,
          }"
          @click="selectTemplate(template)"
        >
          {{ template.formName || `Template ${template.id}` }}
        </li>
      </ul>
    </aside>

    <!-- Main Content Area for Configuration -->
    <main class="config-main">
      <div v-if="!selectedTemplateId" class="empty-state">
        <p>Select a form template to configure.</p>
      </div>
      <div v-else class="config-panel">
        <div class="config-header">
          <h2 class="config-panel-title">
            {{
              selectedTemplate?.formName || `Template ${selectedTemplate?.id}`
            }}
            Configuration
          </h2>
          <div class="header-actions">
            <button v-if="!editMode" @click="startEditing" class="btn-primary">
              <EditIcon class="w-4 h-4" /> Edit
            </button>
            <template v-else>
              <button @click="cancelEditing" class="btn-secondary">
                <XIcon class="w-4 h-4" /> Cancel
              </button>
              <button @click="saveChanges" class="btn-primary">
                <SaveIcon class="w-4 h-4" /> Save Changes
              </button>
            </template>
          </div>
        </div>

        <div class="config-content">
          <!-- General Info -->
          <section class="config-section">
            <h3 class="section-title">General Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Form Name:</label>
                <input
                  type="text"
                  v-model="editableTemplate.formName"
                  :disabled="!editMode"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Tenant:</label>
                <input
                  type="text"
                  :value="selectedTemplate?.tenant?.tenantName || 'N/A'"
                  disabled
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Assigned Organization:</label>
                <input
                  type="text"
                  :value="
                    selectedTemplate?.assignedOrgnization?.orgName || 'N/A'
                  "
                  disabled
                  class="form-input"
                />
              </div>
            </div>
          </section>

          <!-- Fields Configuration -->
          <section class="config-section">
            <h3 class="section-title">Fields Configuration</h3>
            <div class="field-list">
              <div
                v-if="
                  !editableTemplate.fields ||
                  editableTemplate.fields.length === 0
                "
                class="text-center text-gray-500 py-4"
              >
                No fields configured.
              </div>
              <div
                v-for="(field, index) in editableTemplate.fields"
                :key="field.key || index"
                class="field-card"
              >
                <div class="field-header">
                  <h4 class="field-title">
                    {{ field.label || field.key || `Field ${index + 1}` }}
                  </h4>
                  <div class="field-actions">
                    <button
                      v-if="editMode"
                      @click="removeField(index)"
                      class="btn-icon text-red-500"
                    >
                      <Trash2Icon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="field-body">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                      <label class="form-label">Key:</label>
                      <input
                        type="text"
                        v-model="field.key"
                        :disabled="!editMode"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Label:</label>
                      <input
                        type="text"
                        v-model="field.label"
                        :disabled="!editMode"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Field Type:</label>
                      <select
                        v-model="field.field_type"
                        :disabled="!editMode"
                        class="form-input"
                      >
                        <option value="creation">Creation</option>
                        <option value="completion">Completion</option>
                        <option value="creation/completion">
                          Creation/Completion
                        </option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Input Type:</label>
                      <select
                        v-model="field.type"
                        :disabled="!editMode"
                        class="form-input"
                        v-if="typeof field.type === 'string'"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="clientSelector">Client Selector</option>
                        <option value="gps-currentLocation">
                          GPS Current Location
                        </option>
                        <option value="gps">GPS</option>
                        <option value="bigtext">Big Text</option>
                        <option value="image">Image</option>
                        <option value="otp">OTP</option>
                        <option value="happy-code">Happy Code</option>
                        <option value="boolean">Boolean</option>
                      </select>
                      <input
                        v-else
                        type="text"
                        :value="JSON.stringify(field.type)"
                        @input="
                          (event) =>
                            (field.type = parseFieldType(event.target.value))
                        "
                        :disabled="!editMode"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group col-span-full">
                      <label class="form-label">Placeholder:</label>
                      <input
                        type="text"
                        v-model="field.placeholder"
                        :disabled="!editMode"
                        class="form-input"
                      />
                    </div>
                  </div>

                  <div class="config-subsection">
                    <h5 class="subsection-title">Role-Based Visibility</h5>
                    <div class="grid grid-cols-2 gap-2">
                      <label
                        v-for="role in roleOptions"
                        :key="role.id"
                        class="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          :id="`vis-${field.key}-${role.id}`"
                          v-model="field.rolesVisibility[role.name]"
                          :disabled="!editMode"
                          class="form-checkbox"
                        />
                        {{ role.name }}
                      </label>
                    </div>
                  </div>

                  <div class="config-subsection">
                    <h5 class="subsection-title">Role-Based Required</h5>
                    <div class="grid grid-cols-2 gap-2">
                      <label
                        v-for="role in roleOptions"
                        :key="role.id"
                        class="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          :id="`req-${field.key}-${role.id}`"
                          v-model="field.roleBasedRequired[role.name]"
                          :disabled="!editMode"
                          class="form-checkbox"
                        />
                        {{ role.name }}
                      </label>
                    </div>
                  </div>

                  <div class="config-subsection">
                    <h5 class="subsection-title">Role-Based Mandatory</h5>
                    <div class="grid grid-cols-2 gap-2">
                      <label
                        v-for="role in roleOptions"
                        :key="role.id"
                        class="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          :id="`man-${field.key}-${role.id}`"
                          v-model="field.roleBasedMandatory[role.name]"
                          :disabled="!editMode"
                          class="form-checkbox"
                        />
                        {{ role.name }}
                      </label>
                    </div>
                  </div>

                  <div class="config-subsection">
                    <h5 class="subsection-title">Input Modes</h5>
                    <div class="grid grid-cols-2 gap-2">
                      <label
                        class="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          v-model="field.input_modes.dropdown"
                          :disabled="!editMode"
                          class="form-checkbox"
                        />
                        Dropdown
                      </label>
                      <label
                        class="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          v-model="field.input_modes.qr"
                          :disabled="!editMode"
                          class="form-checkbox"
                        />
                        QR
                      </label>
                      <label
                        class="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          v-model="field.input_modes.number"
                          :disabled="!editMode"
                          class="form-checkbox"
                        />
                        Number
                      </label>
                      <label
                        class="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          v-model="field.input_modes.text"
                          :disabled="!editMode"
                          class="form-checkbox"
                        />
                        Text
                      </label>
                      <label
                        class="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          v-model="field.input_modes['happy-code']"
                          :disabled="!editMode"
                          class="form-checkbox"
                        />
                        Happy Code
                      </label>
                    </div>
                  </div>

                  <div
                    class="config-subsection"
                    v-if="field.options !== undefined"
                  >
                    <h5 class="subsection-title">Options (comma-separated)</h5>
                    <textarea
                      v-model="field.optionsString"
                      @input="updateFieldOptions(field)"
                      :disabled="!editMode"
                      class="form-textarea"
                      rows="3"
                    ></textarea>
                  </div>

                  <div class="config-subsection">
                    <h5 class="subsection-title">Validations</h5>
                    <div
                      v-if="
                        !field.validations ||
                        Object.keys(field.validations).length === 0
                      "
                      class="text-gray-500 text-sm mb-2"
                    >
                      No validations added.
                    </div>
                    <div
                      v-for="(val, key) in field.validations"
                      :key="key"
                      class="flex items-center gap-2 mb-2"
                    >
                      <span class="font-medium text-sm text-gray-700"
                        >{{ key }}:</span
                      >
                      <input
                        v-if="typeof val === 'boolean'"
                        type="checkbox"
                        v-model="field.validations[key]"
                        :disabled="!editMode"
                        class="form-checkbox"
                      />
                      <input
                        v-else-if="typeof val === 'number'"
                        type="number"
                        v-model.number="field.validations[key]"
                        :disabled="!editMode"
                        class="form-input-sm"
                      />
                      <input
                        v-else-if="typeof val === 'string' && key !== 'message'"
                        type="text"
                        v-model="field.validations[key]"
                        :disabled="!editMode"
                        class="form-input-sm"
                      />
                      <input
                        v-else-if="key === 'message'"
                        type="text"
                        v-model="field.validations[key]"
                        :disabled="!editMode"
                        class="form-input-sm flex-grow"
                      />
                      <div v-else-if="Array.isArray(val)">
                        <input
                          type="text"
                          :value="val.join(', ')"
                          @input="
                            (event) =>
                              (field.validations[key] = event.target.value
                                .split(',')
                                .map((s) => s.trim()))
                          "
                          :disabled="!editMode"
                          class="form-input-sm"
                        />
                      </div>
                      <button
                        v-if="editMode"
                        @click="delete field.validations[key]"
                        class="btn-icon text-red-500"
                      >
                        <XIcon class="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      v-if="editMode"
                      @click="addFieldValidation(field)"
                      class="btn-secondary-sm mt-2"
                    >
                      <PlusIcon class="w-3 h-3" /> Add Validation
                    </button>
                  </div>
                </div>
              </div>
              <button
                v-if="editMode"
                @click="addNewField"
                class="btn-secondary mt-4 w-full"
              >
                <PlusIcon class="w-4 h-4" /> Add New Field
              </button>
            </div>
          </section>

          <!-- Status Transitions Configuration -->
          <section class="config-section">
            <h3 class="section-title">Status Transitions</h3>
            <div class="status-transition-list">
              <div
                v-if="
                  !editableTemplate.status_transitions ||
                  Object.keys(editableTemplate.status_transitions).length === 0
                "
                class="text-center text-gray-500 py-4"
              >
                No status transitions configured.
              </div>
              <div
                v-for="(
                  transition, statusKey
                ) in editableTemplate.status_transitions"
                :key="statusKey"
                class="status-card"
              >
                <div class="status-header">
                  <h4 class="status-title">{{ statusKey }}</h4>
                  <button
                    v-if="editMode"
                    @click="removeStatusTransition(statusKey)"
                    class="btn-icon text-red-500"
                  >
                    <Trash2Icon class="w-4 h-4" />
                  </button>
                </div>
                <div class="status-body">
                  <div class="config-subsection">
                    <h5 class="subsection-title">Can be set by roles:</h5>
                    <div class="flex flex-wrap gap-2">
                      <label
                        v-for="role in roleOptions"
                        :key="role.id"
                        class="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          :checked="
                            transition.can_set_by_roles &&
                            transition.can_set_by_roles.includes(role.name)
                          "
                          @change="
                            toggleRoleInTransition(
                              transition,
                              role.name,
                              $event.target.checked,
                            )
                          "
                          :disabled="!editMode"
                          class="form-checkbox"
                        />
                        {{ role.name }}
                      </label>
                    </div>
                  </div>

                  <div class="config-subsection mt-4">
                    <h5 class="subsection-title">
                      Required fields for each role:
                    </h5>
                    <div
                      v-for="role in roleOptions"
                      :key="role.id"
                      class="mb-2"
                    >
                      <h6 class="font-medium text-sm text-gray-700">
                        {{ role.name }}:
                      </h6>
                      <div class="flex flex-wrap gap-2">
                        <label
                          v-for="field in editableTemplate.fields"
                          :key="field.key"
                          class="flex items-center gap-2 text-xs text-gray-600"
                        >
                          <input
                            type="checkbox"
                            :checked="
                              transition.required_fields &&
                              transition.required_fields[role.name] &&
                              transition.required_fields[role.name].includes(
                                field.key,
                              )
                            "
                            @change="
                              toggleFieldInRequired(
                                transition,
                                role.name,
                                field.key,
                                $event.target.checked,
                              )
                            "
                            :disabled="!editMode"
                            class="form-checkbox"
                          />
                          {{ field.label || field.key }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                v-if="editMode"
                @click="addNewStatusTransition"
                class="btn-secondary mt-4 w-full"
              >
                <PlusIcon class="w-4 h-4" /> Add New Status Transition
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import {
  EditIcon,
  XIcon,
  SaveIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-vue-next";
import { authService } from "@/services/authService"; // Assuming this path is correct
import { currentUserTenant } from "@/utils/currentUserTenant"; // Assuming this path is correct

// Simple deep copy function (since lodash is not available by default)
function deepCopy(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCopy(item));
  }
  const copy = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:1337/api"; // Fallback for VITE_API_URL

const selectedTemplateId = ref(null);
const formTemplates = ref([]);
const roleOptions = ref([]);
const editMode = ref(false);
const editableTemplate = reactive({}); // This will hold the template being edited
const isLoadingTemplates = ref(true);
const templateError = ref(null);

const token = ref(authService.getToken());
const userRole = computed(() => currentUserTenant.getRole());
const tenantId = computed(() => currentUserTenant.getTenantId());

const selectedTemplate = computed(() => {
  return formTemplates.value.find((t) => t.id === selectedTemplateId.value);
});

const fetchFormTemplates = async () => {
  isLoadingTemplates.value = true;
  templateError.value = null;
  try {
    const response = await fetch(`${API_BASE_URL}/items/form_template`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    formTemplates.value = data.data.map((item) => ({
      id: item.id,
      formName: item.formName,
      custom_FormTemplate: item.custom_FormTemplate,
      tenant: item.tenant,
      assignedOrgnization: item.assignedOrgnization,
    }));
  } catch (err) {
    console.error("Error fetching form templates:", err);
    templateError.value =
      "Failed to load form templates. Please check your network and API URL.";
  } finally {
    isLoadingTemplates.value = false;
  }
};

const fetchRoles = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/roles?filter[_and][0][name][_neq]=Administrator&filter[_and][1][name][_neq]=esslAdmin&&filter[_and][2][name][_neq]=Dealer`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    roleOptions.value = data.data.map((role) => ({
      id: role.id,
      name: role.name || "Unnamed Role",
    }));
  } catch (err) {
    console.error("Error fetching roles:", err);
    // If roles fail to load, the UI might not function correctly for role-based settings.
    // Consider a default set of roles or a warning.
  }
};

const selectTemplate = (template) => {
  selectedTemplateId.value = template.id;
  editMode.value = false; // Always start in view mode when selecting a new template
  if (template.custom_FormTemplate) {
    const copiedTemplate = deepCopy(template.custom_FormTemplate);
    // Initialize optionsString for fields that have options
    copiedTemplate.fields.forEach((field) => {
      if (Array.isArray(field.options)) {
        field.optionsString = field.options.join(", ");
      } else {
        field.optionsString = "";
      }
    });
    Object.assign(editableTemplate, copiedTemplate);
  } else {
    // Initialize with empty structures if custom_FormTemplate is null
    Object.assign(editableTemplate, { fields: [], status_transitions: {} });
  }
};

const startEditing = () => {
  editMode.value = true;
  // Ensure editableTemplate is a fresh deep copy if not already
  const currentTemplate = formTemplates.value.find(
    (t) => t.id === selectedTemplateId.value,
  );
  if (currentTemplate && currentTemplate.custom_FormTemplate) {
    const copiedTemplate = deepCopy(currentTemplate.custom_FormTemplate);
    copiedTemplate.fields.forEach((field) => {
      if (Array.isArray(field.options)) {
        field.optionsString = field.options.join(", ");
      } else {
        field.optionsString = "";
      }
    });
    Object.assign(editableTemplate, copiedTemplate);
  } else {
    Object.assign(editableTemplate, { fields: [], status_transitions: {} });
  }
};

const cancelEditing = () => {
  editMode.value = false;
  // Revert changes by clearing editableTemplate
  for (const key in editableTemplate) {
    delete editableTemplate[key];
  }
  // Re-select the template to load its original state
  if (selectedTemplate.value) {
    selectTemplate(selectedTemplate.value);
  }
};

const saveChanges = async () => {
  // Prepare data for saving: convert optionsString back to array, clean up temp properties
  const dataToSave = deepCopy(editableTemplate);
  if (dataToSave.fields) {
    dataToSave.fields.forEach((field) => {
      if (field.optionsString !== undefined) {
        field.options = field.optionsString
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
        delete field.optionsString; // Clean up temporary property
      }
    });
  }

  console.log("Attempting to save changes:", dataToSave);
  // Here you would send dataToSave to your backend API (e.g., a PUT request)
  // Example: await axios.put(`${API_BASE_URL}/items/form_template/${selectedTemplateId.value}`, { data: dataToSave });

  // Simulate API call success
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Update the original formTemplates with the saved data
  const index = formTemplates.value.findIndex(
    (t) => t.id === selectedTemplateId.value,
  );
  if (index !== -1) {
    formTemplates.value[index].custom_FormTemplate = deepCopy(dataToSave);
    formTemplates.value[index].formName = dataToSave.formName; // Update formName if changed
  }
  editMode.value = false;
  alert("Changes saved successfully!");
};

const addNewField = () => {
  if (!editableTemplate.fields) {
    editableTemplate.fields = [];
  }
  const newField = {
    key: `newField${editableTemplate.fields.length + 1}`,
    label: `New Field ${editableTemplate.fields.length + 1}`,
    field_type: "creation",
    type: "text",
    placeholder: "",
    roleBasedRequired: {},
    roleBasedMandatory: {},
    rolesVisibility: {},
    input_modes: {},
    validations: {},
    options: [],
    optionsString: "",
  };
  // Initialize role-based properties for the new field
  roleOptions.value.forEach((role) => {
    newField.roleBasedRequired[role.name] = false;
    newField.roleBasedMandatory[role.name] = false;
    newField.rolesVisibility[role.name] = true; // Default visible
  });
  editableTemplate.fields.push(newField);
};

const removeField = (index) => {
  if (confirm("Are you sure you want to remove this field?")) {
    editableTemplate.fields.splice(index, 1);
  }
};

const updateFieldOptions = (field) => {
  // This function is primarily for UI binding, actual conversion happens in saveChanges
  // field.options will be updated from field.optionsString during save
};

const parseFieldType = (value) => {
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch (e) {
    return value; // If not valid JSON, treat as string
  }
};

const addFieldValidation = (field) => {
  const validationType = prompt(
    "Enter validation type (e.g., 'required', 'minLength', 'format'):",
  );
  if (validationType && !field.validations[validationType]) {
    let defaultValue;
    if (
      [
        "required",
        "allowPastDates",
        "allowFutureDates",
        "isMinDate",
        "isMaxDate",
      ].includes(validationType)
    ) {
      defaultValue = false;
    } else if (
      ["minLength", "maxLength", "min", "max", "length"].includes(
        validationType,
      )
    ) {
      defaultValue = 0;
    } else if (validationType === "fileTypeAllowed") {
      defaultValue = [];
    } else {
      defaultValue = "";
    }
    if (!field.validations) {
      field.validations = {};
    }
    field.validations[validationType] = defaultValue;
  } else if (validationType) {
    alert("Validation type already exists for this field!");
  }
};

const addNewStatusTransition = () => {
  const newStatusKey = prompt("Enter new status key (e.g., 'new_status'):");
  if (newStatusKey && !editableTemplate.status_transitions[newStatusKey]) {
    editableTemplate.status_transitions[newStatusKey] = {
      can_set_by_roles: [],
      required_fields: {},
    };
    // Initialize required_fields for all roles
    roleOptions.value.forEach((role) => {
      editableTemplate.status_transitions[newStatusKey].required_fields[
        role.name
      ] = [];
    });
  } else if (newStatusKey) {
    alert("Status key already exists!");
  }
};

const removeStatusTransition = (statusKey) => {
  if (
    confirm(
      `Are you sure you want to remove the status transition for '${statusKey}'?`,
    )
  ) {
    delete editableTemplate.status_transitions[statusKey];
  }
};

const toggleRoleInTransition = (transition, roleName, isChecked) => {
  if (!transition.can_set_by_roles) {
    transition.can_set_by_roles = [];
  }
  if (isChecked) {
    if (!transition.can_set_by_roles.includes(roleName)) {
      transition.can_set_by_roles.push(roleName);
    }
  } else {
    transition.can_set_by_roles = transition.can_set_by_roles.filter(
      (r) => r !== roleName,
    );
  }
};

const toggleFieldInRequired = (transition, roleName, fieldKey, isChecked) => {
  if (!transition.required_fields) {
    transition.required_fields = {};
  }
  if (!transition.required_fields[roleName]) {
    transition.required_fields[roleName] = [];
  }

  if (isChecked) {
    if (!transition.required_fields[roleName].includes(fieldKey)) {
      transition.required_fields[roleName].push(fieldKey);
    }
  } else {
    transition.required_fields[roleName] = transition.required_fields[
      roleName
    ].filter((f) => f !== fieldKey);
  }
};

onMounted(() => {
  fetchFormTemplates();
  fetchRoles();
});
</script>

<style scoped>
/* Base Styles */
.form-config-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc; /* Light background */
  color: #1e293b;
}

/* Sidebar for Template Selection */
.template-sidebar {
  width: 280px; /* Fixed width */
  flex-shrink: 0;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 100%
  ); /* Vercel-inspired gradient */
  color: white;
  padding: 1.5rem;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #fff;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.template-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.template-item {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid transparent;
}

.template-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
  border-color: rgba(255, 255, 255, 0.3);
}

.template-item.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Main Content Area */
.config-main {
  flex-grow: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background-color: #ffffff; /* White background for main content */
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: #64748b;
  font-size: 1.125rem;
  font-weight: 500;
  background-color: #f1f5f9;
  border-radius: 12px;
}

.config-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.config-panel-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.config-content {
  padding: 1.5rem;
}

.config-section {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed #e2e8f0;
}

.config-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3b82f6;
  display: inline-block;
}

.config-subsection {
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
}

.subsection-title {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.75rem;
}

/* Form Elements */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  background-color: #fff;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background-color: #e2e8f0;
  color: #64748b;
  cursor: not-allowed;
}

.form-input-sm {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #1e293b;
  background-color: #fff;
  transition: all 0.2s ease;
}

.form-input-sm:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-checkbox {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}

.form-checkbox:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.form-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.form-checkbox:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -50%) rotate(45deg);
}

.form-checkbox:disabled {
  background-color: #e2e8f0;
  border-color: #94a3b8;
  cursor: not-allowed;
}

/* Buttons */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  border-color: #94a3b8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary-sm {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary-sm:hover:not(:disabled) {
  background: #e2e8f0;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Field and Status Cards */
.field-list,
.status-transition-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-card,
.status-card {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.field-header,
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.field-title,
.status-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.field-body,
.status-body {
  padding: 1.5rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .form-config-container {
    flex-direction: column;
  }
  .template-sidebar {
    width: 100%;
    height: auto;
    max-height: 250px; /* Limit height on small screens */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: relative; /* Remove sticky on mobile if it causes issues */
  }
  .config-main {
    padding: 1rem;
  }
  .config-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .config-panel-title {
    font-size: 1.5rem;
  }
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  .btn-primary,
  .btn-secondary {
    flex-grow: 1;
    justify-content: center;
  }
  .section-title {
    width: 100%;
    text-align: center;
  }
  .grid.grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>

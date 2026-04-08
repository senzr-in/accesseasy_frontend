<!-- /senzrGo/senzrfieldopsfrontend/src/components/WorkOrdeForm_Components/form/FormStep.vue -->
<template>
  <v-div class="form-step-card" elevation="8">
    <v-div class="form-step-content">
      <!-- Added debug info to help troubleshoot -->
      <div v-if="currentStepFields.length === 0" class="empty-state">
        <v-alert type="info" variant="tonal">
          <v-icon class="mr-2">mdi-information</v-icon>
          No fields available for this step. Please check the form
          configuration.
        </v-alert>
      </div>

      <v-form ref="formRef" @submit.prevent="handleFormSubmit">
        <v-row class="field-grid">
          <v-col
            v-for="field in currentStepFields"
            :key="field.key"
            cols="12"
            md="4"
            class="field-column"
          >
            <FieldRenderer
              :field="field"
              :form-data="formData"
              :clients="clients"
              :users="users"
              :departments="departments"
              :shared-properties="sharedProperties"
              :user-role="userRole"
              :contact-details="contactDetails"
              @field-action="$emit('field-action', field, $event)"
              @generate-code="$emit('generate-code', field)"
              @validation-change="handleValidationChange"
              @update-contact-details="$emit('update-contact-details', $event)"
            />
          </v-col>
          <!-- Priority -->
          <v-col cols="12" class="field-column" v-if="showPriorityReschedule">
            <v-label class="field-label">
              <v-icon size="18" color="primary" class="mr-2">mdi-flag</v-icon>
              Task priority
            </v-label>
            <v-select
              :model-value="priority"
              @update:model-value="$emit('update-priority', $event)"
              :items="priorityItems"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              clearable
            >
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps">
                  <template #prepend>
                    <v-icon :color="item.raw.color" class="mr-2">
                      {{ item.raw.icon }}
                    </v-icon>
                  </template>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <v-chip
                  :color="item.raw.color"
                  variant="tonal"
                  size="small"
                  class="ma-1"
                >
                  <v-icon :color="item.raw.color" class="mr-1">
                    {{ item.raw.icon }}
                  </v-icon>
                  {{ item.raw.label }}
                </v-chip>
              </template>
            </v-select>
          </v-col>

          <!-- Reschedule toggle -->
          <v-col cols="12" class="field-column" v-if="showPriorityReschedule">
            <v-switch
              :model-value="rescheduleEnabled"
              @update:model-value="$emit('update-reschedule-enabled', $event)"
              :disabled="!canEnableReschedule"
              color="primary"
              :label="`Reschedule across multiple days`"
              hide-details="auto"
            />
            <small v-if="!canEnableReschedule" class="text-muted">
              Enable only when From and Due date are on the same day.
            </small>
            <small v-else class="text-success">
              From: {{ normalizedFromDate }} | Due: {{ normalizedDueDate }}
            </small>
          </v-col>

          <!-- Reschedule controls -->
          <template v-if="rescheduleEnabled && showPriorityReschedule">
            <v-col cols="12" class="field-column">
              <v-label class="field-label">
                <v-icon size="18" color="primary" class="mr-2"
                  >mdi-calendar</v-icon
                >
                Start date (fixed)
              </v-label>
              <v-text-field
                :value="normalizedFromDate"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                disabled
              />
            </v-col>

            <v-col cols="12" class="field-column">
              <v-label class="field-label">
                <v-icon size="18" color="primary" class="mr-2"
                  >mdi-calendar-range</v-icon
                >
                End date
              </v-label>
              <v-text-field
                :model-value="scheduleEndDate"
                @update:model-value="$emit('update-schedule-end-date', $event)"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :min="normalizedFromDate || undefined"
              />
            </v-col>

            <v-col cols="12" class="field-column">
              <v-label class="field-label">
                <v-icon size="18" color="primary" class="mr-2"
                  >mdi-calendar-week</v-icon
                >
                Repeat on days
              </v-label>
              <div class="weekday-grid">
                <v-checkbox
                  v-for="d in weekdays"
                  :key="d.value"
                  :model-value="selectedDays"
                  @update:model-value="$emit('update-selected-days', $event)"
                  :label="d.label"
                  :value="d.value"
                  hide-details="auto"
                  density="compact"
                  color="primary"
                />
              </div>
              <small class="text-muted">
                Tasks will be created for the selected weekdays between Start
                and End date.
              </small>
            </v-col>
          </template>
        </v-row>
      </v-form>
    </v-div>
  </v-div>
</template>

<script setup>
import { ref, watch, computed, provide } from "vue";
import { isFieldMandatory } from "@/utils/createWOF/validationRules";
import FieldRenderer from "./FieldRenderer.vue";
import { getFieldTypeString } from "@/utils/createWOF/fieldUtils";

const props = defineProps({
  formDetails: Object,
  currentStep: Number,
  totalSteps: Number,
  currentStepFields: Array,
  formData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  formValid: Boolean,
  clients: Array,
  users: Array,
  departments: Array,
  sharedProperties: Object,
  userRole: String,
  priority: { type: String, default: null },
  rescheduleEnabled: { type: Boolean, default: false },
  scheduleEndDate: { type: String, default: null },
  selectedDays: { type: Array, default: () => [] },
  fromDate: { type: String, default: null },
  dueDate: { type: String, default: null },
  showPriorityReschedule: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  hideNavigation: { type: Boolean, default: false },
  contactDetails: { type: Object, default: null },
});

const emit = defineEmits([
  "next-step",
  "prev-step",
  "field-action",
  "generate-code",
  "update:formValid",
  "update-priority",
  "update-reschedule-enabled",
  "update-schedule-end-date",
  "update-selected-days",
  "update-from-date",
  "update-due-date",
  "submit-form",
  "update-contact-details",
]);

const formRef = ref(null);

const touchedFields = ref({});
const fieldValidationState = ref({});

provide("touchedFields", touchedFields);

watch(
  () => props.currentStepFields,
  (newFields) => {
    console.log("[v0] FormStep - currentStepFields changed:", newFields);
    console.log("[v0] FormStep - formData keys:", Object.keys(props.formData));
    console.log("[v0] FormStep - formData:", props.formData);
  },
  { immediate: true, deep: true },
);

const handleValidationChange = (validationInfo) => {
  fieldValidationState.value[validationInfo.fieldKey] = validationInfo;

  // Emit form validity
  const isFormValid = checkFormValidity();
  emit("update:formValid", isFormValid);
};

const checkFormValidity = () => {
  const mandatoryFields = props.currentStepFields.filter((field) =>
    isFieldMandatory(field, props.userRole),
  );

  // Check if all mandatory fields have been filled and are valid
  for (const field of mandatoryFields) {
    const state = fieldValidationState.value[field.key];

    // If field hasn't been validated yet or is invalid
    if (!state || !state.isValid || !state.hasValue) {
      return false;
    }
  }

  return true;
};

const canSubmit = computed(() => {
  // Check all mandatory fields across all steps
  const allFields = props.currentStepFields;
  const mandatoryFields = allFields.filter((field) =>
    isFieldMandatory(field, props.userRole),
  );

  for (const field of mandatoryFields) {
    const state = fieldValidationState.value[field.key];
    const value = props.formData[field.key];

    // Field must have a value and be valid
    if (!value || (state && !state.isValid)) {
      console.log(`[v0] Field ${field.key} is not valid:`, { value, state });
      return false;
    }
  }

  console.log(
    `[v0] All mandatory fields are valid, enabling Create Task button`,
  );
  return true;
});

const canProceed = computed(() => {
  return checkFormValidity();
});

const handleFormSubmit = (event) => {
  console.log("[v0] FormStep handleFormSubmit called");
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  props.currentStepFields.forEach((field) => {
    touchedFields.value[field.key] = true;
  });

  if (!canSubmit.value) {
    console.log("[v0] Cannot submit - mandatory fields missing or invalid");
    return;
  }

  console.log("[v0] About to emit submit-form event");
  emit("submit-form");
  console.log("[v0] Emitted submit-form event");
};

const handlePrevious = () => {
  console.log("[v0] Previous button clicked, current step:", props.currentStep);
  emit("prev-step");
};

const handleNext = () => {
  console.log("[v0] Next button clicked, current step:", props.currentStep);
  emit("next-step");
};

const getFieldColSize = (type) => {
  return 4;
};

const priorityItems = [
  { label: "Low", value: "low", icon: "mdi-flag-outline", color: "green" },
  { label: "Medium", value: "medium", icon: "mdi-flag", color: "orange" },
  { label: "High", value: "high", icon: "mdi-flag-checkered", color: "red" },
];

const weekdays = [
  { label: "M", value: "Mon", js: 1 },
  { label: "T", value: "Tue", js: 2 },
  { label: "W", value: "Wed", js: 3 },
  { label: "T", value: "Thu", js: 4 },
  { label: "F", value: "Fri", js: 5 },
  { label: "S", value: "Sat", js: 6 },
  { label: "S", value: "Sun", js: 0 },
];

const normalizeDateString = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") {
    if (v.includes("T")) return v.split("T")[0];
    const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return null;
};

const normalizedFromDate = computed(() => {
  const dateFields = [
    "from",
    "fromDate",
    "from_date",
    "startDate",
    "start_date",
  ];

  if (props.fromDate) {
    return normalizeDateString(props.fromDate);
  }

  for (const field of dateFields) {
    if (props.formData[field]) {
      return normalizeDateString(props.formData[field]);
    }
  }

  return null;
});

const normalizedDueDate = computed(() => {
  const dueDateFields = [
    "dueTime",
    "due_time",
    "dueDate",
    "due_date",
    "endDate",
    "end_date",
    "toDate",
    "to_date",
  ];

  if (props.dueDate) {
    return normalizeDateString(props.dueDate);
  }

  for (const field of dueDateFields) {
    if (props.formData[field]) {
      return normalizeDateString(props.formData[field]);
    }
  }

  return null;
});

const canEnableReschedule = computed(() => {
  const fromDate = normalizedFromDate.value;
  const dueDate = normalizedDueDate.value;

  console.log("[v0] FormStep - Reschedule check:", {
    fromDate,
    dueDate,
    canEnable: !!fromDate && !!dueDate && fromDate === dueDate,
  });

  return !!fromDate && !!dueDate && fromDate === dueDate;
});
</script>

<style scoped>
.field-grid {
  margin-bottom: 32px;
}

.field-column {
  transition: all 0.3s ease;
}

.form-actions {
  padding: 0;
  margin-top: 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 32px;
}

.action-btn {
  border-radius: 12px !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  min-width: 140px;
}

.primary-btn {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3) !important;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4) !important;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Enhanced Previous button styling for better visibility */
.prev-btn {
  border: 2px solid #757575 !important;
  color: #424242 !important;
  font-weight: 600 !important;
  background: #ffffff !important;
}

.prev-btn:hover:not(:disabled) {
  background: #f5f5f5 !important;
  border-color: #424242 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.prev-btn .v-icon {
  color: #424242 !important;
}

.field-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 12px;
  font-size: medium;

}

.weekday-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.text-muted {
  color: #6b7280;
}

.text-success {
  color: #10b981;
}

.empty-state {
  padding: 24px;
  text-align: center;
}

.contact-details-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-field {
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
    gap: 16px;
  }

  .action-btn {
    width: 100%;
  }
}
</style>

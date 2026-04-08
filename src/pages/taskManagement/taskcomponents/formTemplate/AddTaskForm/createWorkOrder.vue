<!-- /senzrGo/senzrfieldopsfrontend/src/components/WorkOrdeForm_Components/createWorkOrder.vue -->
<template>
  <div class="cwo-wrapper">
    <!-- Combined header with template selector and Create Task button -->
    <div class="form-header">
      <div class="header-row">
        <v-select
          v-model="selectedTemplateId"
          :items="formOptions"
          :loading="loadingForms"
          :disabled="loadingForms"
          item-title="formName"
          item-value="id"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-format-list-bulleted"
          hide-details
          clearable
          placeholder="Select work order template"
          @update:model-value="onSelectTemplate"
          class="template-selector"
        />
        <v-btn
          class="createtask"
          size="large"
          :disabled="!canSubmit"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          Create Task
        </v-btn>
      </div>
    </div>

    <!-- Main content area -->
    <section class="form-body" ref="bodyEl">
      <!-- Global toast -->
      <ToastNotification
        :show="showToast"
        :message="toastMessage"
        :type="toastType"
      />

      <!-- Loading / Error -->
      <LoadingState
        v-if="selectedTemplateId && loading"
        title="Loading form..."
        message="Please wait while we fetch the form details."
        :full-height="false"
      />
      <ErrorState v-else-if="selectedTemplateId && error" :error="error" />

      <!-- Form Content -->
      <div v-else-if="formDetails" class="form-content">
        <v-row class="sections-grid">
          <!-- Client Details Box -->
          <div
            v-if="clientFields.length > 0"
            class="section-box client-details-box"
          >
            <div class="section-title client-details-title">
              Client's Details
            </div>
            <div class="section-content">
              <FormStep
                :form-details="formDetails"
                :current-step="1"
                :total-steps="1"
                :current-step-fields="clientFields"
                :form-data="workOrderFormData"
                :form-valid="formValid"
                :clients="clients"
                :users="users"
                :departments="departments"
                :shared-properties="sharedProperties"
                :user-role="userRole"
                :priority="priority"
                :reschedule-enabled="rescheduleEnabled"
                :schedule-end-date="scheduleEndDate"
                :selected-days="selectedDays"
                :from-date="fromDate"
                :due-date="dueDate"
                :show-priority-reschedule="false"
                :loading="loading"
                :hide-navigation="true"
                :contact-details="contactDetails"
                @open-qr-scanner="openQrScanner"
                @open-location-selector="openLocationSelector"
                @generate-code="generateCode"
                @field-action="handleFieldAction"
                @update-priority="updatePriority"
                @update-reschedule-enabled="updateRescheduleEnabled"
                @update-schedule-end-date="updateScheduleEndDate"
                @update-selected-days="updateSelectedDays"
                @update-from-date="updateFromDate"
                @update-due-date="updateDueDate"
                @update-contact-details="updateClientContactDetails"
              />
            </div>
          </div>

          <!-- Assign Workorder Box -->
          <div class="section-box assign-workorder-box">
            <div class="section-title assign-workorder-title">
              Assign Workorder
            </div>
            <div class="section-content">
              <FormStep
                :form-details="formDetails"
                :current-step="1"
                :total-steps="1"
                :current-step-fields="assignWorkorderFields"
                :form-data="workOrderFormData"
                :form-valid="formValid"
                :clients="clients"
                :users="users"
                :departments="departments"
                :shared-properties="sharedProperties"
                :user-role="userRole"
                :priority="priority"
                :reschedule-enabled="rescheduleEnabled"
                :schedule-end-date="scheduleEndDate"
                :selected-days="selectedDays"
                :from-date="fromDate"
                :due-date="dueDate"
                :show-priority-reschedule="true"
                :loading="loading"
                :hide-navigation="true"
                @open-qr-scanner="openQrScanner"
                @open-location-selector="openLocationSelector"
                @generate-code="generateCode"
                @field-action="handleFieldAction"
                @update-priority="updatePriority"
                @update-reschedule-enabled="updateRescheduleEnabled"
                @update-schedule-end-date="updateScheduleEndDate"
                @update-selected-days="updateSelectedDays"
                @update-from-date="updateFromDate"
                @update-due-date="updateDueDate"
              />
            </div>
          </div>

          <!-- Jobsheets Box -->
          <div
            v-if="visibleJobSheets.length > 0"
            class="section-box jobsheet-box"
          >
            <div class="section-title jobsheet-title">
              Jobsheets
              <v-btn
                :color="allJobSheetsEnabled ? 'error' : 'success'"
                variant="tonal"
                size="small"
                class="expand-all-btn"
                @click="toggleAllJobSheets"
              >
                {{ allJobSheetsEnabled ? "Disable All" : "Enable All" }}
              </v-btn>
            </div>
            <div class="section-content">
              <div class="jobsheets-list">
                <v-expansion-panels v-model="expandedJobSheets" multiple>
                  <v-expansion-panel
                    v-for="jobSheet in visibleJobSheets"
                    :key="jobSheet.job_id"
                    class="jobsheet-item"
                  >
                    <v-expansion-panel-title>
                      <div class="jobsheet-title-row">
                        <span class="jobsheet-name">{{
                          jobSheet.job_name
                        }}</span>
                        <v-switch
                          v-model="enabledJobSheets[jobSheet.job_id]"
                          color="success"
                          inset
                          hide-details
                          class="jobsheet-toggle"
                          @click.stop
                          @update:model-value="
                            onToggleJobSheet(jobSheet.job_id, $event)
                          "
                        />
                      </div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text
                      v-if="enabledJobSheets[jobSheet.job_id]"
                    >
                      <div
                        v-if="
                          jobSheet && getCreationFields(jobSheet).length === 0
                        "
                        class="no-fields-message"
                      >
                        <!-- <v-alert type="info" variant="tonal" density="compact">
                          <v-icon class="mr-2">mdi-information-outline</v-icon>
                          No fields available for creation in this job sheet.
                        </v-alert> -->
                      </div>
                      <FormStep
                        v-else
                        :form-details="formDetails"
                        :current-step="1"
                        :total-steps="1"
                        :current-step-fields="getCreationFields(jobSheet)"
                        :form-data="workOrderFormData[jobSheet.job_id] || {}"
                        :form-valid="formValid"
                        :clients="clients"
                        :users="users"
                        :departments="departments"
                        :shared-properties="sharedProperties"
                        :user-role="userRole"
                        :priority="priority"
                        :reschedule-enabled="rescheduleEnabled"
                        :schedule-end-date="scheduleEndDate"
                        :selected-days="selectedDays"
                        :from-date="fromDate"
                        :due-date="dueDate"
                        :show-priority-reschedule="false"
                        :loading="loading"
                        :hide-navigation="true"
                        @open-qr-scanner="openQrScanner"
                        @open-location-selector="openLocationSelector"
                        @generate-code="generateCode"
                        @field-action="handleFieldAction"
                      />
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </div>
          </div>
        </v-row>

        <div class="pb-safe" />
      </div>

      <!-- Empty hint -->
      <v-alert v-else type="info" variant="tonal">
        Select a form to start creating a work order.
      </v-alert>
    </section>

    <!-- Dialogs / Overlays -->
    <EmailDialog
      :show="showEmailDialog"
      :client-email="clientEmail"
      :email-rules="emailRules"
      @update-and-submit="updateClientEmailAndSubmit"
      @skip="skipEmailProcess"
      @update:show="showEmailDialog = $event"
      @update:client-email="clientEmail = $event"
    />

    <QrScanner
      :show="showQrScannerDialog"
      :qr-image-file="qrImageFile"
      :decoded-content="decodedQrContent"
      :scan-error="qrScanError"
      @close="closeQrScanner"
      @apply="applyQrContent"
      @update:qr-image-file="qrImageFile = $event"
      @update:decoded-content="decodedQrContent = $event"
      @update:scan-error="qrScanError = $event"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { useFormApi as formApi } from "@/composables/workorder/createWorkOrderForm/useFormApi";
import { useLocationApi as locationApi } from "@/composables/workorder/createWorkOrderForm/useLocationApi";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import { maybeSendCodes } from "@/composables/workorder/createWorkOrderForm/useOtpHappyCode";
import FormStep from "@/components/WorkOrdeForm_Components/form/FormStep.vue";
import { useToast as toastApi } from "@/composables/workorder/createWorkOrderForm/useToast";
import ToastNotification from "@/components/common/notifications/ToastNotification.vue";
import EmailDialog from "@/components/WorkOrdeForm_Components/form/EmailDialog.vue";
import LoadingState from "@/components/common/states/LoadingState.vue";
import ErrorState from "@/components/WorkOrdeForm_Components/form/ErrorState.vue";
import QrScanner from "@/components/WorkOrdeForm_Components/form/QrScanner.vue";
import { getFieldTypeString } from "@/utils/createWOF/fieldUtils";

const props = defineProps({
  open: { type: Boolean, default: false },
  embedded: { type: Boolean, default: false },
});
const emit = defineEmits(["update:open", "created"]);

const {
  formDetails,
  clients,
  users,
  departments,
  loading,
  error,
  fetchFormDetails,
  fetchDropdownData,
  submitForm,
  uploadImage,
  getFirstPresent,
} = formApi();

const sharedProperties = computed(() => {
  return formDetails.value?.custom_FormTemplate?.shared_properties || {};
});

const {
  locationTypes,
  selectedLocType,
  displayLocationDetails,
  reverseGeocodedAddress,
  locationError,
  showLocationSelectorDialog,
  openLocationSelector,
  closeLocationSelector,
  applyLocation,
  currentGpsFieldKey,
} = locationApi();

const { showToast, toastMessage, toastType, showValidationToast } = toastApi();

const userRole = computed(() => currentUserTenant.getRole());
const tenantId = computed(() => currentUserTenant.getTenantId());
const token = ref(authService.getToken());

const formOptions = ref([]);
const loadingForms = ref(false);
const selectedTemplateId = ref(null);

const workOrderFormData = reactive({});
const formValid = ref(false);
const isSubmitting = ref(false);

const showQrScannerDialog = ref(false);
const qrImageFile = ref([]);
const decodedQrContent = ref("");
const qrScanError = ref("");
const currentQrFieldKey = ref("");

const showEmailDialog = ref(false);
const clientEmail = ref("");
let resolveEmailPrompt = null;

const priority = ref(null);
const rescheduleEnabled = ref(false);
const scheduleEndDate = ref(null);
const selectedDays = ref([]);
const fromDate = ref(null);
const dueDate = ref(null);
const contactDetails = ref(null);

// Track enabled job sheets
const enabledJobSheets = reactive({});
const expandedJobSheets = ref([]);

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

const coreFields = computed(
  () => formDetails.value?.custom_FormTemplate?.corefields || [],
);

const clientFields = computed(() => {
  return coreFields.value.filter(
    (field) =>
      (field.key === "orgId" ||
        field.key === "clientLocation" ||
        field.key === "gps" ||
        getFieldTypeString(field.type) === "orgId" ||
        getFieldTypeString(field.type) === "clientLocation" ||
        getFieldTypeString(field.type) === "gps") &&
      isFieldVisible(field),
  );
});

const assignWorkorderFields = computed(() => {
  return coreFields.value.filter(
    (field) =>
      field.key === "from" ||
      field.key === "dueTime" ||
      field.key === "team" ||
      getFieldTypeString(field.type) === "date" ||
      getFieldTypeString(field.type) === "dropdown",
  );
});

const nonClientCoreFields = computed(() => {
  return coreFieldsWithTeam.value.filter(
    (field) =>
      !["orgId", "clientLocation", "gps", "from", "dueTime", "team"].includes(
        field.key,
      ) &&
      !["orgId", "clientLocation", "gps"].includes(
        getFieldTypeString(field.type),
      ),
  );
});

const jobSheets = computed(
  () => formDetails.value?.custom_FormTemplate?.jobSheet || [],
);
const visibleJobSheets = computed(() => {
  return jobSheets.value;
});

const showContactDetails = computed(() => {
  return !!workOrderFormData.gps && contactDetails.value;
});

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

const normalizedFromDate = computed(() => normalizeDateString(fromDate.value));
const normalizedDueDate = computed(() => normalizeDateString(dueDate.value));

const canEnableReschedule = computed(() => {
  const f = normalizedFromDate.value;
  const d = normalizedDueDate.value;
  return !!f && !!d && f === d;
});

const datesInRangeByWeekdays = (startStr, endStr, dayValues) => {
  if (!startStr || !endStr || !dayValues.length) {
    console.error("❌ Invalid inputs:", { startStr, endStr, dayValues });
    return [];
  }

  const cleanStart = normalizeDateString(startStr);
  const cleanEnd = normalizeDateString(endStr);

  const start = new Date(`${cleanStart}T00:00:00Z`);
  const end = new Date(`${cleanEnd}T00:00:00Z`);

  if (isNaN(start) || isNaN(end) || start > end) {
    console.error("❌ Invalid date range:", { cleanStart, cleanEnd });
    return [];
  }

  const weekdayMap = [
    { value: "Sun", js: 0 },
    { value: "Mon", js: 1 },
    { value: "Tue", js: 2 },
    { value: "Wed", js: 3 },
    { value: "Thu", js: 4 },
    { value: "Fri", js: 5 },
    { value: "Sat", js: 6 },
  ];

  const allowedDays = new Set(
    dayValues
      .map((v) => weekdayMap.find((w) => w.value === v)?.js)
      .filter((x) => x !== undefined),
  );

  const resultDates = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const dayOfWeek = d.getUTCDay();
    const dateStr = d.toISOString().slice(0, 10);
    const isIncluded = allowedDays.has(dayOfWeek);

    if (isIncluded) {
      resultDates.push(dateStr);
    }
  }

  return resultDates;
};

const getDateFromFormData = (formData, fieldNames) => {
  for (const field of fieldNames) {
    if (formData[field]) {
      return formData[field];
    }
  }
  return null;
};

const fromDateTime = computed(() =>
  getDateFromFormData(workOrderFormData, [
    "from",
    "fromDate",
    "from_date",
    "startDate",
    "start_date",
  ]),
);
const dueDateTime = computed(() =>
  getDateFromFormData(workOrderFormData, [
    "dueTime",
    "due_time",
    "dueDate",
    "due_date",
    "endDate",
    "end_date",
    "toDate",
    "to_date",
  ]),
);

watch([fromDateTime, dueDateTime], ([newFrom, newDue]) => {
  fromDate.value = newFrom;
  dueDate.value = newDue;
});

watch([normalizedFromDate, normalizedDueDate], () => {
  if (!canEnableReschedule.value) {
    rescheduleEnabled.value = false;
    scheduleEndDate.value = null;
    selectedDays.value = [];
  } else {
    scheduleEndDate.value = normalizedFromDate.value;
  }
});

const isFieldVisible = (field) => {
  const roleBasedRequired = field.roleBasedRequired;
  if (roleBasedRequired && typeof roleBasedRequired === "object") {
    const req = roleBasedRequired[userRole.value];
    if (req !== true) return false;
  }
  const vis = field.rolesVisibility;
  if (!vis) return true;
  if (Array.isArray(vis)) return vis.includes(userRole.value);
  if (typeof vis === "object") return !!vis[userRole.value];
  return true;
};

// Define getCreationFields function to fix ReferenceError
const getCreationFields = (jobSheet) => {
  if (!jobSheet || !jobSheet.fields) return [];

  return jobSheet.fields.filter(
    (field) =>
      (field.field_type === "creation" ||
        field.field_type === "creation/completion") &&
      isFieldVisible(field),
  );
};

const onSelectTemplate = async (id) => {
  if (!id) {
    resetFormRuntime();
    return;
  }
  await fetchFormDetails(id);
  await fetchDropdownData();
  initFormData();
};

const loadForms = async () => {
  if (!token.value || !tenantId.value) return;

  loadingForms.value = true;
  try {
    const params = new URLSearchParams([
      ["limit", "-1"],
      ["fields[]", "id"],
      ["fields[]", "formName"],
      ["fields[]", "enableForm"],
      ["filter[_and][0][tenant][tenantId][_eq]", tenantId.value],
      ["filter[_and][1][enableForm][_eq]", "true"],
      ["sort", "formName"],
    ]).toString();

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant_template?${params}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );

    if (!res.ok) throw new Error("Failed to load forms");
    const data = await res.json();

    formOptions.value = (data?.data || []).map((x) => ({
      id: x.id,
      formName: x.formName,
    }));

    if (formOptions.value.length > 0 && !selectedTemplateId.value) {
      selectedTemplateId.value = formOptions.value[0].id;
      await onSelectTemplate(selectedTemplateId.value);
    }
  } catch (e) {
    showValidationToast(e.message || "Failed to load forms", "error");
  } finally {
    loadingForms.value = false;
  }
};

const initFormData = () => {
  Object.keys(workOrderFormData).forEach((k) => delete workOrderFormData[k]);
  Object.keys(enabledJobSheets).forEach((k) => delete enabledJobSheets[k]);

  const coreFieldsData =
    formDetails.value?.custom_FormTemplate?.corefields || [];
  coreFieldsData
    .filter(
      (f) =>
        f.field_type === "creation" || f.field_type === "creation/completion",
    )
    .forEach((f) => {
      const type =
        typeof f.type === "object" && f.type.date === true ? "date" : f.type;
      workOrderFormData[f.key] =
        type === "boolean"
          ? false
          : type === "date" || type === "number"
            ? null
            : "";
    });

  const jobSheetsData = formDetails.value?.custom_FormTemplate?.jobSheet || [];
  jobSheetsData.forEach((jobSheet) => {
    workOrderFormData[jobSheet.job_id] = reactive({});
    enabledJobSheets[jobSheet.job_id] = false;
    jobSheet.fields
      .filter(
        (f) =>
          f.field_type === "creation" || f.field_type === "creation/completion",
      )
      .forEach((f) => {
        const type =
          typeof f.type === "object" && f.type.date === true ? "date" : f.type;
        workOrderFormData[jobSheet.job_id][f.key] =
          type === "boolean"
            ? false
            : type === "date" || type === "number"
              ? null
              : "";
      });
  });

  workOrderFormData.priority = null;
  workOrderFormData.fromDate = null;
  workOrderFormData.dueDate = null;
  workOrderFormData.rescheduleEnabled = false;
  workOrderFormData.scheduleEndDate = null;
  workOrderFormData.selectedDays = [];
};

// Computed property to check if all job sheets are enabled
const allJobSheetsEnabled = computed(() => {
  return visibleJobSheets.value.every(
    (jobSheet) => enabledJobSheets[jobSheet.job_id],
  );
});

const onToggleJobSheet = (jobId, value) => {
  console.log(`[v0] Toggle job sheet ${jobId} to ${value}`);
  enabledJobSheets[jobId] = value;

  // Initialize form data for this job sheet if enabling
  if (value && !workOrderFormData[jobId]) {
    const jobSheet = jobSheets.value.find((js) => js.job_id === jobId);
    if (jobSheet && jobSheet.fields) {
      workOrderFormData[jobId] = reactive({});
      jobSheet.fields
        .filter(
          (f) =>
            f.field_type === "creation" ||
            f.field_type === "creation/completion",
        )
        .forEach((f) => {
          const type =
            typeof f.type === "object" && f.type.date === true
              ? "date"
              : f.type;
          workOrderFormData[jobId][f.key] =
            type === "boolean"
              ? false
              : type === "date" || type === "number"
                ? null
                : "";
        });
    }
  }

  // If disabling the job sheet, ensure it's collapsed
  if (!value) {
    const index = expandedJobSheets.value.indexOf(jobId);
    if (index !== -1) {
      expandedJobSheets.value.splice(index, 1); // Collapse the panel
    }
  }

  console.log("[v0] Enabled job sheets:", enabledJobSheets);
  console.log("[v0] Expanded job sheets:", expandedJobSheets.value);
};

const toggleAllJobSheets = () => {
  if (allJobSheetsEnabled.value) {
    // Disable all job sheets and collapse panels
    visibleJobSheets.value.forEach((jobSheet) => {
      enabledJobSheets[jobSheet.job_id] = false;
      const index = expandedJobSheets.value.indexOf(jobSheet.job_id);
      if (index !== -1) {
        expandedJobSheets.value.splice(index, 1);
      }
    });
  } else {
    // Enable all job sheets and expand panels
    expandedJobSheets.value = visibleJobSheets.value.map(
      (jobSheet) => jobSheet.job_id,
    );

    visibleJobSheets.value.forEach((jobSheet) => {
      enabledJobSheets[jobSheet.job_id] = true;
      // Initialize form data for enabled job sheets
      if (!workOrderFormData[jobSheet.job_id]) {
        const jobSheetData = jobSheets.value.find(
          (js) => js.job_id === jobSheet.job_id,
        );
        if (jobSheetData && jobSheetData.fields) {
          workOrderFormData[jobSheet.job_id] = reactive({});
          jobSheetData.fields
            .filter(
              (f) =>
                f.field_type === "creation" ||
                f.field_type === "creation/completion",
            )
            .forEach((f) => {
              const type =
                typeof f.type === "object" && f.type.date === true
                  ? "date"
                  : f.type;
              workOrderFormData[jobSheet.job_id][f.key] =
                type === "boolean"
                  ? false
                  : type === "date" || type === "number"
                    ? null
                    : "";
            });
        }
      }
    });
  }

  console.log("[v0] Toggled all job sheets, enabled state:", enabledJobSheets);
  console.log("[v0] Expanded job sheets array:", expandedJobSheets.value);
};

const isJobSheetCompleted = (jobSheetId) => {
  if (!enabledJobSheets[jobSheetId]) return true;

  const jobSheet = jobSheets.value.find((js) => js.job_id === jobSheetId);
  if (!jobSheet) return false;

  const creationFields = getCreationFields(jobSheet);

  if (creationFields.length === 0) {
    return true;
  }

  const jobSheetData = workOrderFormData[jobSheetId];
  if (!jobSheetData) return false;

  const requiredFields = creationFields.filter((f) => {
    const rbMandatory = f.roleBasedMandatory;
    if (rbMandatory && typeof rbMandatory === "object") {
      if (rbMandatory[userRole.value] !== undefined) {
        return rbMandatory[userRole.value] === true;
      }
    }

    const rbRequired = f.roleBasedRequired;
    if (rbRequired && typeof rbRequired === "object") {
      if (rbRequired[userRole.value] !== undefined) {
        return rbRequired[userRole.value] === true;
      }
    }

    return f.validations?.required === true;
  });

  if (requiredFields.length === 0) {
    return true;
  }

  return requiredFields.every((field) => {
    const value = jobSheetData[field.key];

    if (value === undefined || value === null || value === "") {
      return false;
    }

    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    return true;
  });
};

const completedJobSheetsCount = computed(() => {
  return visibleJobSheets.value.filter((js) => isJobSheetCompleted(js.job_id))
    .length;
});

const isOverviewComplete = computed(() => {
  if (!formDetails.value?.custom_FormTemplate?.corefields) return true;

  const coreFields = formDetails.value.custom_FormTemplate.corefields;

  const mandatoryFields = coreFields.filter((field) => {
    if (!isFieldVisible(field)) return false;

    const rbMandatory = field.roleBasedMandatory;
    if (rbMandatory && typeof rbMandatory === "object") {
      if (rbMandatory[userRole.value] !== undefined) {
        return rbMandatory[userRole.value] === true;
      }
    }

    const rbRequired = field.roleBasedRequired;
    if (rbRequired && typeof rbRequired === "object") {
      if (rbRequired[userRole.value] !== undefined) {
        return rbRequired[userRole.value] === true;
      }
    }

    return field.validations?.required === true;
  });

  if (mandatoryFields.length === 0) {
    return true;
  }

  return mandatoryFields.every((field) => {
    const value = workOrderFormData[field.key];

    if (value === undefined || value === null || value === "") {
      return false;
    }

    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    return true;
  });
});

const canSubmit = computed(() => {
  if (dateValidationError.value) {
    return false;
  }

  // If no job sheets are enabled, only check overview completion
  if (Object.values(enabledJobSheets).every((enabled) => !enabled)) {
    return isOverviewComplete.value;
  }

  // Check overview and all enabled job sheets
  return (
    isOverviewComplete.value &&
    visibleJobSheets.value.every(
      (js) => !enabledJobSheets[js.job_id] || isJobSheetCompleted(js.job_id),
    )
  );
});

const dateValidationError = computed(() => {
  const fromDateTimeRaw =
    workOrderFormData.from ||
    workOrderFormData.fromDate ||
    workOrderFormData.startDate;
  const dueDateRaw =
    workOrderFormData.dueTime ||
    workOrderFormData.dueDate ||
    workOrderFormData.endDate;

  if (fromDateTimeRaw && dueDateRaw) {
    const from = new Date(fromDateTimeRaw);
    const due = new Date(dueDateRaw);

    if (isNaN(from.getTime()) || isNaN(due.getTime())) {
      return "Invalid date format provided.";
    }

    if (from > due) {
      return "Start date/time cannot be after end date/time";
    }
  }

  return null;
});

const bodyEl = ref(null);

const scrollTop = () => {
  if (bodyEl.value && typeof bodyEl.value.scrollTo === "function") {
    bodyEl.value.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    const el = document.querySelector(".cwo-wrapper .form-body");
    if (el && typeof el.scrollTo === "function") {
      el.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
};

const openQrScanner = (fieldKey) => {
  currentQrFieldKey.value = fieldKey;
  showQrScannerDialog.value = true;
  qrImageFile.value = [];
  decodedQrContent.value = "";
  qrScanError.value = "";
};

const closeQrScanner = () => {
  showQrScannerDialog.value = false;
  qrImageFile.value = [];
  decodedQrContent.value = "";
  qrScanError.value = "";
  currentQrFieldKey.value = "";
};

const applyQrContent = () => {
  if (decodedQrContent.value && currentQrFieldKey.value) {
    const targetFormData =
      currentQrFieldKey.value.includes("_") &&
      jobSheets.value.some((js) =>
        currentQrFieldKey.value.startsWith(js.job_id + "_"),
      )
        ? workOrderFormData[currentQrFieldKey.value.split("_")[0]]
        : workOrderFormData;

    const fieldKey = currentQrFieldKey.value.includes("_")
      ? currentQrFieldKey.value.split("_")[1]
      : currentQrFieldKey.value;

    targetFormData[fieldKey] = decodedQrContent.value;
    closeQrScanner();
  } else {
    qrScanError.value = "No QR content to apply or target field not set.";
  }
};

const handleFieldAction = (field) => {
  const fieldType =
    typeof field.type === "object" && field.type.date === true
      ? "date"
      : field.type;

  if (fieldType === "clientSelector" && field.input_modes?.qr) {
    openQrScanner(field.key);
  } else if (fieldType === "gps" || fieldType === "gps-currentLocation") {
    const clientOrgId = getSelectedClientOrgId();
    if (!clientOrgId) {
      showValidationToast(
        "Please select a Client before choosing a Client Location",
        "warning",
      );
      return;
    }
    openLocationSelector(field.key, clientOrgId);
  }
};

const generateCode = (field) => {
  const length = field.validations?.length || (field.type === "otp" ? 6 : 4);
  const isNumeric = field.input_modes?.number !== false;
  const chars = isNumeric
    ? "0123456789"
    : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const targetFormData =
    field.key.includes("_") &&
    jobSheets.value.some((js) => field.key.startsWith(js.job_id + "_"))
      ? workOrderFormData[field.key.split("_")[0]]
      : workOrderFormData;

  const fieldKey = field.key.includes("_")
    ? field.key.split("_")[1]
    : field.key;

  targetFormData[fieldKey] = code;
};

const emailRules = [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const promptForEmail = () =>
  new Promise((resolve) => {
    resolveEmailPrompt = resolve;
    showEmailDialog.value = true;
  });

const updateClientEmailAndSubmit = () => {
  if (!clientEmail.value || !/.+@.+\..+/.test(clientEmail.value)) {
    showValidationToast("Please enter a valid email address", "error");
    return;
  }
  if (resolveEmailPrompt) resolveEmailPrompt(clientEmail.value);
  resolveEmailPrompt = null;
  showEmailDialog.value = false;
  clientEmail.value = "";
};

const skipEmailProcess = () => {
  if (resolveEmailPrompt) resolveEmailPrompt(null);
  resolveEmailPrompt = null;
  showEmailDialog.value = false;
  clientEmail.value = "";
};

const updatePriority = (newPriority) => {
  priority.value = newPriority;
  workOrderFormData.priority = newPriority;
};

const updateRescheduleEnabled = (newEnabled) => {
  rescheduleEnabled.value = newEnabled;
  workOrderFormData.rescheduleEnabled = newEnabled;
};

const updateScheduleEndDate = (newEndDate) => {
  scheduleEndDate.value = newEndDate;
  workOrderFormData.scheduleEndDate = newEndDate;
};

const updateSelectedDays = (newDays) => {
  selectedDays.value = newDays;
  workOrderFormData.selectedDays = newDays;
};

const updateFromDate = (newFromDate) => {
  fromDate.value = newFromDate;
  workOrderFormData.fromDate = newFromDate;
};

const updateDueDate = (newDueDate) => {
  dueDate.value = newDueDate;
  workOrderFormData.dueDate = newDueDate;
};

const updateClientContactDetails = (details) => {
  contactDetails.value = details;
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    if (!formDetails.value || !formDetails.value.custom_FormTemplate) {
      showValidationToast(
        "Form details not loaded. Please try again.",
        "error",
      );
      return;
    }

    let submissionData = { ...workOrderFormData };

    if (sharedProperties.value?.booleans?.team && submissionData.team) {
      console.log(
        "[v0] Including team field in submission:",
        submissionData.team,
      );
    }

    const dynamicFields = [];

    // Process core fields
    const coreFieldsForSubmit =
      formDetails.value?.custom_FormTemplate?.corefields || [];
    for (const f of coreFieldsForSubmit) {
      if (!isFieldVisible(f)) continue;

      const key = f.key;
      if (submissionData[key] !== undefined) {
        if (key === "user_location") {
          submissionData[key] = {
            lat: submissionData.lat,
            lng: submissionData.lng,
          };
        } else if (key === "taskimage" && submissionData[key]) {
          if (
            Array.isArray(submissionData[key]) &&
            typeof submissionData[key][0] === "string"
          ) {
            submissionData[key] = submissionData[key];
          } else if (submissionData[key].length > 0) {
            submissionData[key] = await uploadImages(submissionData[key]);
          }
        } else if (
          ![
            "orgId",
            "from",
            "dueTime",
            "title",
            "description",
            "task_priority",
          ].includes(key)
        ) {
          submissionData[key] = submissionData[key];
        }
      }
    }

    const employeeIdAlt = getFirstPresent(submissionData, [
      "UsersId",
      "employeeId",
      "empId",
      "assignedEmployee",
      "assignedUserId",
    ]);
    if (employeeIdAlt) submissionData.UsersId = employeeIdAlt;

    if (sharedProperties.value?.booleans?.team && submissionData.team) {
      submissionData.team = submissionData.team;
    }

    // Process job sheets
    const jobSheetsForSubmit =
      formDetails.value?.custom_FormTemplate?.jobSheet || [];
    console.log("[DEBUG] enabledJobSheets state:", enabledJobSheets);
    for (const jobSheet of jobSheetsForSubmit) {
      console.log(
        `[DEBUG] Processing job sheet ${jobSheet.job_id}, isVisible: ${!!enabledJobSheets[jobSheet.job_id]}`,
      );

      const jobFields = {};
      const isJobSheetEnabled = !!enabledJobSheets[jobSheet.job_id];

      // Only process fields for enabled job sheets
      if (isJobSheetEnabled) {
        const jobSheetData = submissionData[jobSheet.job_id] || {};
        console.log(
          `[DEBUG] jobSheetData for ${jobSheet.job_id}:`,
          JSON.stringify(jobSheetData, null, 2),
        );

        const fieldsToProcess = jobSheet.fields.filter(
          (f) =>
            f.field_type === "creation" ||
            f.field_type === "creation/completion",
        );

        for (const field of fieldsToProcess) {
          if (!isFieldVisible(field)) continue;
          const key = field.key;
          if (
            jobSheetData[key] !== undefined &&
            jobSheetData[key] !== null &&
            jobSheetData[key] !== ""
          ) {
            if (key === "taskimage" && jobSheetData[key]) {
              if (
                Array.isArray(jobSheetData[key]) &&
                typeof jobSheetData[key][0] === "string"
              ) {
                jobFields[key] = jobSheetData[key];
              } else if (jobSheetData[key].length > 0) {
                jobFields[key] = await uploadImages(jobSheetData[key]);
              }
            } else {
              jobFields[key] = jobSheetData[key];
            }
          }
        }

        if (jobSheet.requires_location) {
          const latKey = jobSheet.location_field_key?.lat || "lat";
          const lngKey = jobSheet.location_field_key?.lng || "lng";
          if (jobSheetData[latKey] || jobSheetData[lngKey]) {
            jobFields["user_location"] = {
              lat: jobSheetData[latKey],
              lng: jobSheetData[lngKey],
            };
          }
        }

        if (employeeIdAlt) jobFields.UsersId = employeeIdAlt;
      }

      console.log(
        `[DEBUG] jobFields for ${jobSheet.job_id}:`,
        JSON.stringify(jobFields, null, 2),
      );

      dynamicFields.push({
        taskId: jobSheet.job_id,
        job_name: jobSheet.job_name,
        isVisible: isJobSheetEnabled,
        fields: jobFields,
      });
    }

    console.log(
      "[DEBUG] dynamicFields after processing:",
      JSON.stringify(dynamicFields, null, 2),
    );

    submissionData.dynamicFields = { tasks: dynamicFields };

    if (priority.value) {
      submissionData.task_priority = priority.value;
    }

    console.log(
      "[DEBUG] Final submissionData:",
      JSON.stringify(submissionData, null, 2),
    );

    const rescheduleConditionMet =
      rescheduleEnabled.value && fromDate.value && scheduleEndDate.value;

    let taskResponse;
    if (rescheduleConditionMet) {
      const start = normalizedFromDate.value;
      const end = normalizeDateString(scheduleEndDate.value);
      const selected = selectedDays.value || [];

      if (!selected.length) {
        showValidationToast(
          "Please select at least one day for rescheduling.",
          "error",
        );
        return;
      }

      let fromTime = "09:00";
      let dueTime = "17:00";

      if (fromDate.value && fromDate.value.includes("T")) {
        fromTime = fromDate.value.split("T")[1].substring(0, 5);
      }
      if (dueDate.value && dueDate.value.includes("T")) {
        dueTime = dueDate.value.split("T")[1].substring(0, 5);
      }

      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(fromTime) || !timeRegex.test(dueTime)) {
        showValidationToast("Invalid time format. Please use HH:MM.", "error");
        return;
      }

      const days = datesInRangeByWeekdays(start, end, selected);

      if (!days.length) {
        showValidationToast(
          "No valid days found for the selected weekdays in the date range.",
          "error",
        );
        return;
      }

      const batchPayload = days.map((day) => ({
        ...submissionData,
        from: `${day}T${fromTime}:00`,
        dueTime: `${day}T${dueTime}:00`,
        dynamicFields: submissionData.dynamicFields,
      }));

      console.log(
        "FINAL BATCH PAYLOAD:",
        JSON.stringify(batchPayload, null, 2),
      );
      console.log(
        `Creating ${days.length} tasks for dates: ${days.join(", ")}`,
      );

      taskResponse = await submitForm(
        batchPayload,
        formDetails.value,
        clients.value,
      );

      showValidationToast(`Task created successfully!`, "success");
    } else if (fromDate.value && dueDate.value) {
      console.log(">>> ENTERING SINGLE TASK LOGIC <<<");

      if (!fromDate.value.includes("T") || !dueDate.value.includes("T")) {
        showValidationToast(
          "Please specify valid start and due times.",
          "error",
        );
        return;
      }

      const fromTime = fromDate.value.split("T")[1].substring(0, 5);
      const dueTime = dueDate.value.split("T")[1].substring(0, 5);
      const timeRegex = /^\d{2}:\d{2}$/;

      if (!timeRegex.test(fromTime) || !timeRegex.test(dueTime)) {
        showValidationToast("Invalid time format. Please use HH:MM.", "error");
        return;
      }

      submissionData.from = `${normalizedFromDate.value}T${fromTime}:00`;
      submissionData.dueTime = `${normalizedDueDate.value}T${dueTime}:00`;

      console.log(
        "Single task payload:",
        JSON.stringify(submissionData, null, 2),
      );
      taskResponse = await submitForm(
        submissionData,
        formDetails.value,
        clients.value,
      );

      showValidationToast("Task created successfully!", "success");
    } else {
      console.log(">>> ENTERING FALLBACK LOGIC (no dates) <<<");
      taskResponse = await submitForm(
        submissionData,
        formDetails.value,
        clients.value,
      );
      showValidationToast("Task created successfully!", "success");
    }

    const allFieldsForMeta = [
      ...(formDetails.value?.custom_FormTemplate?.corefields || []),
      ...(Array.isArray(jobSheets.value)
        ? jobSheets.value.reduce(
            (acc, js) => [...acc, ...(js.fields || [])],
            [],
          )
        : []),
    ];
    const formMeta = { fields: allFieldsForMeta };
    const selectedOrgId = getSelectedClientOrgId();

    if (selectedOrgId) {
      console.log(
        "[DEBUG] Passing taskResponse to maybeSendCodes:",
        JSON.stringify(taskResponse, null, 2),
      );
      await maybeSendCodes({
        createdTask: taskResponse,
        formMeta,
        selectedOrgId,
        options: {
          showToast: showValidationToast,
          promptForEmail: async () => {
            const email = await promptForEmail();
            return email || null;
          },
        },
      });
    }

    emit("created");
    if (!props.embedded) emit("update:open", false);
  } catch (err) {
    console.error("SUBMISSION ERROR:", err);
    showValidationToast(err.message || "Failed to submit form", "error");
  } finally {
    isSubmitting.value = false;
  }
};

const getSelectedClientOrgId = () => {
  const fields = formDetails.value?.custom_FormTemplate?.corefields || [];

  const clientField = fields.find((f) => {
    const type =
      typeof f.type === "object" && f.type?.date === true ? "date" : f.type;
    return type === "clientSelector" || f.key === "orgId";
  });

  if (clientField) {
    const val = workOrderFormData[clientField.key];
    if (val && typeof val === "object" && "id" in val) return val.id;
    return val || null;
  }

  const candidates = [
    "orgLocationId",
    "orgLocation.id",
    "clientOrgId",
    "clientId",
    "orgId",
  ];
  for (const key of candidates)
    if (workOrderFormData[key]) return workOrderFormData[key];
  return null;
};

const onApplyLocation = () => {
  if (displayLocationDetails.value && currentGpsFieldKey.value) {
    const { lat, lng } = displayLocationDetails.value.locmark || {};
    if (typeof lat !== "undefined" && typeof lng !== "undefined") {
      const latNum = Number(lat);
      const lngNum = Number(lng);

      const targetFormData =
        currentGpsFieldKey.value.includes("_") &&
        jobSheets.value.some((js) =>
          currentGpsFieldKey.value.startsWith(js.job_id + "_"),
        )
          ? workOrderFormData[currentGpsFieldKey.value.split("_")[0]]
          : workOrderFormData;

      const fieldKey = currentGpsFieldKey.value.includes("_")
        ? currentGpsFieldKey.value.split("_")[1]
        : currentGpsFieldKey.value;

      targetFormData[fieldKey] = `${
        isFinite(latNum) ? latNum.toFixed(6) : lat
      },${isFinite(lngNum) ? lngNum.toFixed(6) : lng}`;

      const allFields = [
        ...(formDetails.value?.custom_FormTemplate?.corefields || []),
        ...(Array.isArray(jobSheets.value)
          ? jobSheets.value.reduce(
              (acc, js) => [...acc, ...(js.fields || [])],
              [],
            )
          : []),
      ];
      const allFieldKeys = allFields.map((f) => f.key);

      const latCandidates = [`${fieldKey}_lat`, "latitude", "lat"];
      const lngCandidates = [`${fieldKey}_lng`, "longitude", "lng"];

      const latKey = latCandidates.find((k) => allFieldKeys.includes(k));
      const lngKey = lngCandidates.find((k) => allFieldKeys.includes(k));

      if (latKey)
        targetFormData[latKey] = isFinite(Number(lat))
          ? Number(lat).toFixed(6)
          : lat;
      if (lngKey)
        targetFormData[lngKey] = isFinite(Number(lng))
          ? Number(lng).toFixed(6)
          : lng;
    }
    // Update contact details when location is applied
    contactDetails.value = displayLocationDetails.value?.contactDetails || null;
  }
  applyLocation();
};

const coreFieldsWithTeam = computed(() => {
  let fields = [...coreFields.value];

  if (sharedProperties.value?.booleans?.team) {
    fields.push({
      key: "team",
      label: "Department",
      type: "dropdown",
      field_type: "creation",
    });
  }

  return fields.filter(
    (f) =>
      f.field_type === "creation" || f.field_type === "creation/completion",
  );
});

const resetFormRuntime = () => {
  formDetails.value = null;
  Object.keys(workOrderFormData).forEach((k) => delete workOrderFormData[k]);
  Object.keys(enabledJobSheets).forEach((k) => delete enabledJobSheets[k]);
};

const onDrawerUpdate = async (v) => {
  emit("update:open", v);
  if (v) {
    await loadForms();
    if (!selectedTemplateId.value) resetFormRuntime();
  } else {
    showEmailDialog.value = false;
    showQrScannerDialog.value = false;
  }
};

const loadFormsImmediate = async () => {
  await loadForms();
};

watch(
  () => props.open,
  async (newVal) => {
    if (newVal && props.embedded) {
      selectedTemplateId.value = null;
      resetFormRuntime();
      await loadForms();
    }
  },
);

loadFormsImmediate();
</script>

<style scoped>
.cwo-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  margin: 0 auto;
}

.form-header {
  padding: 16px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.template-selector {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.template-selector :deep(.v-field) {
  font-size: medium;
  border-radius: 8px;
}

.template-selector :deep(.v-field__input) {
  min-height: 40px;
  padding: 8px;
}

.createtask {
  background: linear-gradient(135deg, #059367 0%, #047857 100%) !important;
  color: #ffffff !important;
  min-width: 140px;
  height: 42px !important;
  font-size: medium !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  text-transform: none !important;
}

.createtask:hover:not(:disabled) {
  transform: translateY(-2px);
}

.form-body {
  flex: 1;
  overflow-y: auto;
  background: #fafbff;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  scrollbar-color: #cbd5e1 #f1f5f9;
  scrollbar-width: thin;
  height: 80vh;
  padding: 24px;
}
.section-box {
  border-radius: 20px;
  width: 100%;
  max-width: 1100px;
  border: 2px solid #c5c5c5;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.section-title {
  font-size: large;
  font-weight: 600;
  margin-bottom: 20px;
  color: #059669;
  padding: 20px;
  border-bottom: 2px solid #c5c5c5 !important;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}
.jobsheet-item {
  background: transparent;
  border: none;
  border-radius: 12px;
  margin-bottom: 16px;
}

/* Ensure proper alignment and spacing for the title row */
.jobsheet-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 16px;
}

.jobsheet-name {
  color: #059669;
  font-size: medium;
  font-weight: 600;
  flex: 1;
  padding-right: 16px;
}

.jobsheet-toggle {
  flex-shrink: 0;
  margin-left: 16px;
}
.jobsheet-toggle :deep(.v-input__control) {
  min-height: unset !important;
}

.jobsheet-toggle :deep(.v-selection-control) {
  min-height: unset !important;
}

.v-expansion-panel-title {
  padding: 16px;
  background: transparent;
}

.jobsheets-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pb-safe {
  height: 24px;
}

.expand-all-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s ease;
}

.expand-all-btn:hover {
  transform: translateY(-2px);
}

.section-title.jobsheet-title {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 960px) {
  .cwo-wrapper {
    max-width: 100%;
    border-radius: 0;
  }

  .form-body {
    padding: 16px;
  }

  .header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .template-selector {
    max-width: 100%;
  }

  .createtask {
    width: 100%;
  }

  .section-box {
    padding: 16px;
  }
}
</style>

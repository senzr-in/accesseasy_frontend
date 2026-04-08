<!-- InternalTskForm.vue -->
<template>
  <v-card class="form-step-card" elevation="8">
    <v-card-text class="form-step-content">
      <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
        <v-row class="field-grid">
          <v-col cols="12" class="field-column">
            <v-label class="field-label">
              <v-icon size="18" color="primary" class="mr-2"
                >mdi-format-title</v-icon
              >
              Job Name <span class="required-indicator">*</span>
            </v-label>
            <v-text-field
              label="taskName"
              v-model="taskName"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              :rules="[(v) => !!v || 'Job name is required']"
              placeholder="Enter Job name"
            />
          </v-col>

          <v-col cols="12" class="field-column">
            <v-label class="field-label">
              <v-icon size="18" color="primary" class="mr-2"
                >mdi-text-box</v-icon
              >
              Job Description
            </v-label>
            <v-textarea
              label="Job Description"
              v-model="taskDescription"
              variant="outlined"
              density="comfortable"
              auto-grow
              hide-details="auto"
              placeholder="Describe the Job"
            />
          </v-col>

          <v-col cols="12" class="field-column">
            <v-label class="field-label">
              <v-icon size="18" color="primary" class="mr-2"
                >mdi-account-badge</v-icon
              >
              Assign to (Employee)
            </v-label>
            <v-select
              label="Employee"
              v-model="selectedUserId"
              :items="getUserOptions()"
              item-title="label"
              item-value="id"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              clearable
              placeholder="Select employee"
              :rules="[(v) => !!v || 'Assignee is required']"
            >
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps">
                  <v-list-item-subtitle
                    v-if="item?.raw?.employeeId"
                  ></v-list-item-subtitle>
                  <template #append>
                    <v-chip
                      size="x-small"
                      :color="item?.raw?.attendance?.color || 'orange'"
                      variant="tonal"
                      prepend-icon="mdi-clock-outline"
                    >
                      {{ item?.raw?.attendance?.label || "Not Punched In" }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>

          <!-- From Date -->
          <v-col cols="12" class="field-column">
            <v-label class="field-label">
              <v-icon size="18" color="primary" class="mr-2"
                >mdi-calendar-start</v-icon
              >
              From date & time
            </v-label>
            <v-text-field
              label="fromDate"
              v-model="fromDate"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              :min="new Date().toISOString().slice(0, 16)"
              placeholder="Select start date & time"
            />
          </v-col>

          <!-- Due Date -->
          <v-col cols="12" class="field-column">
            <v-label class="field-label">
              <v-icon size="18" color="primary" class="mr-2"
                >mdi-calendar-end</v-icon
              >
              Due date & time
            </v-label>
            <v-text-field
              label="dueDate"
              v-model="dueDate"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              :disabled="!fromDate"
              :min="fromDate || new Date().toISOString().slice(0, 16)"
              placeholder="Select due date & time"
            />
          </v-col>

          <v-col cols="12" class="field-column">
            <v-label class="field-label">
              <v-icon size="18" color="primary" class="mr-2">mdi-flag</v-icon>
              Task priority
            </v-label>
            <v-select
              label="priority"
              v-model="priority"
              :items="priorityItems"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              clearable
              placeholder="Select priority"
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

          <!-- Reschedule toggle (only when same-day) -->
          <v-col cols="12" class="field-column">
            <v-switch
              v-model="rescheduleEnabled"
              :disabled="!canEnableReschedule"
              color="primary"
              :label="`Reschedule across multiple days`"
              hide-details="auto"
            />
            <small v-if="!canEnableReschedule" class="text-muted">
              Enable only when From and Due date are the same.
            </small>
          </v-col>

          <!-- Reschedule controls -->
          <template v-if="rescheduleEnabled">
            <!-- Start date (disabled) -->
            <v-col cols="12" class="field-column">
              <v-label class="field-label">
                <v-icon size="18" color="primary" class="mr-2"
                  >mdi-calendar</v-icon
                >
                Start date (fixed)
              </v-label>
              <v-text-field
                label="normalizedFromDate"
                :value="normalizedFromDate"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                disabled
              />
            </v-col>

            <!-- End date (select) -->
            <v-col cols="12" class="field-column">
              <v-label class="field-label">
                <v-icon size="18" color="primary" class="mr-2"
                  >mdi-calendar-range</v-icon
                >
                End date
              </v-label>
              <v-text-field
                label="scheduleEndDate"
                v-model="scheduleEndDate"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :min="normalizedFromDate || undefined"
                placeholder="Select end date"
              />
            </v-col>

            <!-- Weekday selection -->
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
                  v-model="selectedDays"
                  :label="d.label"
                  :value="d.value"
                  hide-details="auto"
                  density="compact"
                  color="primary"
                />
              </div>
              <small class="text-muted"
                >Tasks will be created for the selected weekdays between Start
                and End date.</small
              >
            </v-col>
          </template>
        </v-row>

        <v-card-actions class="form-actions">
          <v-btn
            color="primary"
            type="submit"
            size="large"
            class="action-btn primary-btn"
            :append-icon="submitting ? 'mdi-loading' : 'mdi-check-circle'"
            :loading="submitting"
            :disabled="!formValid || submitting"
          >
            Create Task
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useFormApi as formApi } from "@/composables/workorder/createWorkOrderForm/useFormApi";

const props = defineProps({ users: { type: Array, default: () => [] } });
const emit = defineEmits(["created", "cancel", "back"]);

const { submitForm, users: usersFromApi, fetchDropdownData } = formApi();

// Immediately fetch dropdowns so the select has data on first open
fetchDropdownData?.();

const formRef = ref(null);
const formValid = ref(false);
const taskName = ref("");
const taskDescription = ref("");
const selectedUserId = ref(null);
const fromDate = ref(null);
const dueDate = ref(null);
const priority = ref(null);
const submitting = ref(false);
const errorMessage = ref(null); // For UI feedback

// Rescheduling state
const rescheduleEnabled = ref(false);
const scheduleEndDate = ref(null);
const selectedDays = ref([]); // e.g. ['Mon', 'Fri', 'Sat']

const weekdays = [
  { label: "M", value: "Mon", js: 1 },
  { label: "T", value: "Tue", js: 2 },
  { label: "W", value: "Wed", js: 3 },
  { label: "T", value: "Thu", js: 4 },
  { label: "F", value: "Fri", js: 5 },
  { label: "S", value: "Sat", js: 6 },
  { label: "S", value: "Sun", js: 0 },
];

const getUserOptions = () => {
  const base = props.users.length > 0 ? props.users : usersFromApi.value || [];
  return base.map((u) => {
    const first = u.firstName || u.assignedUser?.first_name || "";
    const last = u.lastName || u.assignedUser?.last_name || "";
    const empId =
      u.employeeId || u.employee_id || u.empId || u.employeeID || u.idNumber;
    const name = `${(first || "").trim()} ${(last || "").trim()}`.trim();
    const label = u.label || (empId ? `${name} (${empId})` : name) || "Unknown";
    return {
      id: u.id,
      label,
      employeeId: empId ?? null,
      attendance: u.attendance,
      raw: u,
    };
  });
};

const priorityItems = [
  { label: "Low", value: "low", icon: "mdi-flag-outline", color: "green" },
  { label: "Medium", value: "medium", icon: "mdi-flag", color: "orange" },
  { label: "High", value: "high", icon: "mdi-flag-checkered", color: "red" },
];

// Helpers
const normalizeDateString = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") {
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

// Reset form to prevent cached data
const resetForm = () => {
  taskName.value = "";
  taskDescription.value = "";
  selectedUserId.value = null;
  fromDate.value = null;
  dueDate.value = null;
  priority.value = null;
  rescheduleEnabled.value = false;
  scheduleEndDate.value = null;
  selectedDays.value = [];
  errorMessage.value = null;
};

// Reset form on mount to avoid cached data
onMounted(() => {
  resetForm();
});

// Ensure watchers are registered at top level
watch([normalizedFromDate, normalizedDueDate], () => {
  if (!canEnableReschedule.value) {
    rescheduleEnabled.value = false;
    scheduleEndDate.value = null;
    selectedDays.value = [];
  } else {
    scheduleEndDate.value = normalizedFromDate.value;
  }
});

// Date iteration with strict start date enforcement and UTC handling
const datesInRangeByWeekdays = (startStr, endStr, dayValues) => {
  if (!startStr || !endStr || !dayValues.length) {
    console.error("Invalid inputs for date range:", {
      startStr,
      endStr,
      dayValues,
    });
    return [];
  }
  const start = new Date(`${startStr}T00:00:00Z`); // Use UTC to avoid timezone issues
  const end = new Date(`${endStr}T00:00:00Z`);
  if (isNaN(start) || isNaN(end) || start > end) {
    console.error("Invalid date range:", { startStr, endStr });
    return [];
  }

  const weekdays = [
    { value: "Sun", js: 0 },
    { value: "Mon", js: 1 },
    { value: "Tue", js: 2 },
    { value: "Wed", js: 3 },
    { value: "Thu", js: 4 },
    { value: "Fri", js: 5 },
    { value: "Sat", js: 6 },
  ];
  const allowed = new Set(
    dayValues
      .map((v) => weekdays.find((w) => w.value === v)?.js)
      .filter((x) => x !== undefined),
  );

  const out = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (allowed.has(d.getUTCDay())) {
      out.push(d.toISOString().slice(0, 10));
    }
  }
  console.log("Generated dates:", out); // Debug
  return out;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  const ok = await formRef.value.validate();
  if (!ok?.valid) {
    errorMessage.value = "Please fill out all required fields correctly.";
    return;
  }

  try {
    submitting.value = true;
    errorMessage.value = null;

    // Log form inputs for debugging
    console.log("Form inputs:", {
      taskName: taskName.value,
      taskDescription: taskDescription.value,
      selectedUserId: selectedUserId.value,
      fromDate: fromDate.value,
      dueDate: dueDate.value,
      priority: priority.value,
      rescheduleEnabled: rescheduleEnabled.value,
      scheduleEndDate: scheduleEndDate.value,
      selectedDays: selectedDays.value,
    });

    const baseData = {
      title: taskName.value,
      description: taskDescription.value || "",
      UsersId: selectedUserId.value,
      task_priority: priority.value || "medium", // Default to medium as per input
    };

    const pseudoFormDetails = { id: undefined, formName: "Internal Task" };

    if (rescheduleEnabled.value) {
      const start = normalizedFromDate.value;
      const end = normalizeDateString(scheduleEndDate.value);
      const selected = selectedDays.value || [];

      if (!start || !end || selected.length === 0) {
        errorMessage.value = "Please choose End date and at least one weekday.";
        throw new Error("Invalid rescheduling inputs");
      }

      // Validate fromDate and dueDate have time components
      if (!fromDate.value.includes("T") || !dueDate.value.includes("T")) {
        errorMessage.value = "Please specify valid start and due times.";
        throw new Error("Invalid time format");
      }

      const fromTime = fromDate.value.split("T")[1];
      const dueTime = dueDate.value.split("T")[1];

      // Validate time format (e.g., HH:mm)
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(fromTime) || !timeRegex.test(dueTime)) {
        errorMessage.value = "Invalid time format. Please use HH:mm.";
        throw new Error("Invalid time format");
      }

      const days = datesInRangeByWeekdays(start, end, selected);
      if (!days.length) {
        errorMessage.value = "No valid days found for the selected weekdays.";
        throw new Error("No valid days in range");
      }

      const batchPayload = days.map((day) => ({
        ...baseData,
        from: `${day}T${fromTime}:00Z`, // Use UTC
        dueTime: `${day}T${dueTime}:00Z`,
      }));

      console.log("Batch payload:", batchPayload); // Debug

      await submitForm(batchPayload, pseudoFormDetails, []);
    } else {
      // Validate fromDate and dueDate for single task
      if (!fromDate.value.includes("T") || !dueDate.value.includes("T")) {
        errorMessage.value = "Please specify valid start and due times.";
        throw new Error("Invalid time format");
      }

      const fromTime = fromDate.value.split("T")[1];
      const dueTime = dueDate.value.split("T")[1];
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(fromTime) || !timeRegex.test(dueTime)) {
        errorMessage.value = "Invalid time format. Please use HH:mm.";
        throw new Error("Invalid time format");
      }

      const single = {
        ...baseData,
        from: `${normalizedFromDate.value}T${fromTime}:00Z`,
        dueTime: `${normalizedDueDate.value}T${dueTime}:00Z`,
      };

      console.log("Single payload:", single); // Debug

      await submitForm(single, pseudoFormDetails, []);
    }

    emit("created");
  } catch (e) {
    console.error("Failed to create internal task:", e);
    errorMessage.value =
      e.message || "Failed to create task. Please try again.";
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.form-step-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden;
}

.field-column {
  transition: all 0.3s ease;
}

.field-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.required-indicator {
  color: #f44336;
  margin-left: 4px;
  font-weight: 700;
}

.action-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  min-width: 140px;
}

.primary-btn {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3) !important;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4) !important;
}

.form-actions {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: #fff;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.weekday-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.text-muted {
  color: #6b7280;
}
</style>

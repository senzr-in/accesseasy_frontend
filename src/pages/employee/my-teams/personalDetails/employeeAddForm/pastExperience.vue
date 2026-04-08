<template>
  <div class="past-experience-container">
    <!-- Header with title and action button -->
    <div class="experience-header">
      <h3 class="section-title">Past Experience</h3>
      <v-chip
        v-if="hasPreviousRecord"
        color="primary"
        size="small"
        class="ml-2"
        :style="{ marginRight: '380px' }"
      >
        {{ previousRecords.length }} Record{{
          previousRecords.length !== 1 ? "s" : ""
        }}
      </v-chip>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="addNewPreviousRecord"
        variant="tonal"
        rounded="pill"
        size="small"
      >
        Add Experience
      </v-btn>
    </div>

    <!-- Empty State - No Records -->
    <v-card
      v-if="!hasPreviousRecord && !showPreviousRecordForm"
      class="empty-state-card"
      variant="outlined"
    >
      <v-card-text class="text-center pa-6">
        <div class="empty-icon-container mb-4">
          <v-icon size="64" color="grey-lighten-1">mdi-briefcase-clock</v-icon>
        </div>
        <h4 class="text-h6 mb-2">No Work Experience</h4>
        <p class="text-body-1 text-grey mb-6">
          Add the employee's previous work experience to build their
          professional history.
        </p>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="addNewPreviousRecord"
          class="px-6"
          rounded="pill"
          variant="elevated"
        >
          Add Experience
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Records List -->
    <div
      v-if="hasPreviousRecord && !showPreviousRecordForm"
      class="experience-list"
    >
      <div class="timeline-container">
        <div class="timeline-line"></div>
        <div
          v-for="(record, index) in previousRecords"
          :key="index"
          class="timeline-item"
        >
          <div class="timeline-dot">
            <v-icon size="small" color="white">mdi-briefcase</v-icon>
          </div>
          <v-card variant="outlined" class="timeline-card">
            <v-card-item>
              <template v-slot:prepend>
                <v-avatar color="primary" variant="tonal" class="mr-3">
                  <v-icon>mdi-office-building</v-icon>
                </v-avatar>
              </template>
              <v-card-title>{{ record.companyName }}</v-card-title>
              <v-card-subtitle>{{ record.Designation }}</v-card-subtitle>

              <template v-slot:append>
                <div class="card-actions">
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    @click="editPreviousRecord(index)"
                    color="primary"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    @click="deletePreviousRecord(index)"
                    color="error"
                  ></v-btn>
                </div>
              </template>
            </v-card-item>

            <v-card-text>
              <div class="record-details">
                <div class="detail-item">
                  <v-icon size="small" color="primary"
                    >mdi-calendar-range</v-icon
                  >
                  <span
                    >{{ formatDate(record.joiningDate) }} -
                    {{ formatDate(record.leavingDate) }}</span
                  >
                </div>
                <div class="detail-item">
                  <v-icon size="small" color="success">mdi-cash</v-icon>
                  <span>{{ record.Currency }} {{ record.salary }}</span>
                </div>
                <div class="detail-item">
                  <v-icon size="small" color="info">mdi-clock-outline</v-icon>
                  <span>{{
                    calculateDuration(record.joiningDate, record.leavingDate)
                  }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <v-card v-if="showPreviousRecordForm" class="form-card">
      <v-card-item>
        <v-card-title>
          <v-icon color="primary" class="mr-2">
            {{ isEditingRecord ? "mdi-pencil" : "mdi-plus-circle" }}
          </v-icon>
          {{ isEditingRecord ? "Edit Experience" : "Add New Experience" }}
        </v-card-title>
      </v-card-item>

      <v-card-text>
        <v-form
          ref="form"
          v-model="isFormValid"
          @submit.prevent="savePreviousRecord"
        >
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="currentRecord.company"
                label="Company Name"
                :rules="[(v) => !!v || 'Company is required']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-office-building"
                placeholder="Enter company name"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="currentRecord.designation"
                label="Job Title"
                :rules="[(v) => !!v || 'Job title is required']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-badge-account"
                placeholder="Enter job title"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="currentRecord.joiningDate"
                label="Start Date"
                type="date"
                :rules="[(v) => !!v || 'Start date is required']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-calendar-start"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="currentRecord.leavingDate"
                label="End Date"
                type="date"
                :rules="[(v) => !!v || 'End date is required']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-calendar-end"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="currentRecord.currency"
                :items="currencyOptions"
                label="Currency"
                :rules="[(v) => !!v || 'Currency is required']"
                required
                variant="outlined"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="currentRecord.salary"
                label="Salary"
                type="number"
                :rules="[(v) => !!v || 'Salary is required']"
                required
                variant="outlined"
                prepend-inner-icon="mdi-cash"
                placeholder="Enter salary amount"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="cancelForm" class="mr-2">
          Cancel
        </v-btn>
        <v-btn
          color="black"
          @click="savePreviousRecord"
          :disabled="
            !currentRecord.company ||
            !currentRecord.designation ||
            !currentRecord.joiningDate ||
            !currentRecord.leavingDate ||
            !currentRecord.currency ||
            !currentRecord.salary
          "
          variant="elevated"
        >
          {{ isEditingRecord ? "Update" : "Save" }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Notifications -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="3000"
      location="top"
      rounded="pill"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      v-model="showErrorSnackbar"
      color="error"
      timeout="3000"
      location="top"
      rounded="pill"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const previousRecords = ref([...props.modelValue]);
const hasPreviousRecord = computed(() => previousRecords.value.length > 0);
const showPreviousRecordForm = ref(false);
const isEditingRecord = ref(false);
const editingRecordIndex = ref(-1);
const isFormValid = ref(false);
const form = ref(null);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const currencyOptions = [{ title: "Indian Rupee (INR)", value: "INR" }];

const currentRecord = ref({
  company: "",
  designation: "",
  joiningDate: "",
  leavingDate: "",
  currency: "",
  salary: "",
});

// Watch for changes in currentRecord to update form validity
watch(
  currentRecord,
  () => {
    isFormValid.value =
      !!currentRecord.value.company &&
      !!currentRecord.value.designation &&
      !!currentRecord.value.joiningDate &&
      !!currentRecord.value.leavingDate &&
      !!currentRecord.value.currency &&
      !!currentRecord.value.salary;
  },
  { deep: true, immediate: true },
);

// Watch for changes in previousRecords and emit to parent
watch(
  previousRecords,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
  { deep: true },
);

// Watch for changes in props.modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    previousRecords.value = [...newValue];
  },
  { deep: true },
);

// Function to show success message
const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const addNewPreviousRecord = () => {
  showPreviousRecordForm.value = true;
  isEditingRecord.value = false;
  currentRecord.value = {
    company: "",
    designation: "",
    joiningDate: "",
    leavingDate: "",
    currency: "INR",
    salary: "",
  };
};

const editPreviousRecord = (index) => {
  isEditingRecord.value = true;
  editingRecordIndex.value = index;
  const record = previousRecords.value[index];
  currentRecord.value = {
    company: record.companyName,
    designation: record.Designation,
    joiningDate: record.joiningDate,
    leavingDate: record.leavingDate,
    currency: record.Currency,
    salary: record.salary,
  };
  showPreviousRecordForm.value = true;
};

const deletePreviousRecord = (index) => {
  if (confirm("Are you sure you want to delete this experience record?")) {
    previousRecords.value.splice(index, 1);
    showSuccessMessage("Experience record deleted successfully!");
  }
};

const savePreviousRecord = () => {
  try {
    const record = {
      companyName: currentRecord.value.company,
      Designation: currentRecord.value.designation,
      joiningDate: currentRecord.value.joiningDate,
      leavingDate: currentRecord.value.leavingDate,
      Currency: currentRecord.value.currency,
      salary: parseInt(currentRecord.value.salary),
    };

    if (isEditingRecord.value) {
      previousRecords.value[editingRecordIndex.value] = record;
      showSuccessMessage("Experience record updated successfully!");
    } else {
      previousRecords.value.push(record);
      showSuccessMessage("New experience record added successfully!");
    }

    showPreviousRecordForm.value = false;
    isEditingRecord.value = false;
    currentRecord.value = {
      company: "",
      designation: "",
      joiningDate: "",
      leavingDate: "",
      currency: "",
      salary: "",
    };
  } catch (error) {
    console.error("Error saving experience record:", error);
    showErrorMessage(`Failed to save: ${error.message}`);
  }
};

const cancelForm = () => {
  showPreviousRecordForm.value = false;
  isEditingRecord.value = false;
  currentRecord.value = {
    company: "",
    designation: "",
    joiningDate: "",
    leavingDate: "",
    currency: "",
    salary: "",
  };
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "Duration unknown";

  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);

  let result = "";
  if (years > 0) {
    result += `${years} year${years !== 1 ? "s" : ""}`;
  }
  if (months > 0) {
    result += `${result ? " " : ""}${months} month${months !== 1 ? "s" : ""}`;
  }
  if (!result) {
    result = "Less than a month";
  }

  return result;
};
</script>

<style scoped>
.past-experience-container {
  margin: 0 auto;
}

.experience-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
}

.empty-state-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px dashed #ccc;
  background-color: #fafafa;
}

.empty-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  background-color: #f5f5f5;
}

.experience-list {
  margin-top: 24px;
}

.timeline-container {
  position: relative;
  padding-left: 32px;
  height: calc(80vh - 170px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
  max-width: 800px;
}

.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 16px;
  width: 2px;
  background-color: #e0e0e0;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-dot {
  position: absolute;
  left: -32px;
  top: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--v-primary-base, #080808);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.timeline-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  margin-left: 16px;
  border-left: 4px solid var(--v-primary-base, #020202);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.record-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.form-card {
  border-radius: 12px;
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .timeline-container {
    padding-left: 24px;
  }

  .timeline-dot {
    left: -24px;
    width: 24px;
    height: 24px;
  }

  .record-details {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

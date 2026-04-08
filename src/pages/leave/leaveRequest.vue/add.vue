<template>
  <div class="add-form-container">
    <!-- Snackbars -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      class="errormessge"
      v-model="showErrorSnackbar"
      color="error"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>

    <v-container fluid>
      <!-- Tabs -->
      <v-tabs
        v-model="activeTab"
        show-arrows
        background-color="transparent"
        class="custom-tabs"
        @update:modelValue="handleTabChange"
      >
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          class="custom-tab"
        >
          <v-icon :icon="tab.icon" class="mr-2"></v-icon>
          {{ tab.title }}
        </v-tab>
      </v-tabs>

      <!-- Dynamic Content -->
      <v-window v-model="activeTab">
        <v-window-item v-for="tab in tabs" :key="tab.value" :value="tab.value">
          <v-card flat class="tab-content-wrapper">
            <v-card-text>
              <!-- Request Tab Content -->
              <template v-if="tab.value === 'request'">
                <v-form ref="form">
                  <v-toolbar
                    density="compact"
                    color="white"
                    elevation="1"
                    class="form-header"
                  >
                    <v-btn class="back-btn" icon @click="$emit('closeAddPage')">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title class="ml-4 form-title"
                      >Add Request</v-toolbar-title
                    >
                    <v-spacer></v-spacer>
                  </v-toolbar>

                  <div class="form-content">
                    <v-card class="form-card" elevation="0">
                      <v-card-text class="form-fields">
                        <!-- Start Date Field -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper">
                              <label class="field-label">Start Date *</label>
                              <v-text-field
                                v-model="formData.from"
                                type="date"
                                variant="outlined"
                                density="comfortable"
                                :rules="[
                                  (v) => !!v || 'Start date is required',
                                ]"
                                required
                                :hint="
                                  typeof currentCycleDates === 'string'
                                    ? currentCycleDates
                                    : currentCycleDates.formatted
                                "
                                persistent-hint
                                class="custom-field"
                              />
                            </div>
                          </v-col>
                        </v-row>

                        <!-- End Date Field -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper">
                              <label class="field-label">End Date *</label>
                              <v-text-field
                                v-model="formData.to"
                                type="date"
                                variant="outlined"
                                density="comfortable"
                                :rules="[(v) => !!v || 'End date is required']"
                                required
                                class="custom-field"
                              />
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Request Type -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper">
                              <label class="field-label">Request Type *</label>
                              <v-select
                                v-model="formData.leaveType"
                                :items="availableLeaveTypes"
                                item-title="text"
                                item-value="value"
                                variant="outlined"
                                :rules="[
                                  (v) => !!v || 'Leave type is required',
                                ]"
                                required
                                class="custom-field"
                                @update:modelValue="resetHalfDayAndTimeFields"
                              >
                                <template v-slot:item="{ item, props }">
                                  <v-list-item v-bind="props">
                                    <template v-slot:title>
                                      {{ item.raw.text }}
                                    </template>
                                  </v-list-item>
                                </template>
                              </v-select>
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Half Day Switch -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper switch-wrapper">
                              <label class="field-label">Half Day Leave</label>
                              <v-switch
                                v-model="formData.halfDay"
                                color="primary"
                                hide-details
                                inset
                                :disabled="
                                  dateDifference > 1 ||
                                  formData.leaveType === 'workFromHome'
                                "
                                class="custom-switch"
                              >
                                <template v-slot:label>
                                  <span class="switch-label">{{
                                    formData.halfDay ? "Yes" : "No"
                                  }}</span>
                                  <v-tooltip
                                    v-if="
                                      dateDifference > 1 ||
                                      formData.leaveType === 'workFromHome'
                                    "
                                    location="top"
                                  >
                                    <template v-slot:activator="{ props }">
                                      <v-icon
                                        v-bind="props"
                                        color="grey"
                                        size="small"
                                        class="ms-1"
                                      >
                                        mdi-information
                                      </v-icon>
                                    </template>
                                    <span>
                                      {{
                                        formData.leaveType === "workFromHome"
                                          ? "Half-day option is not available for Work From Home"
                                          : "Half-day option is only available for single-day leaves"
                                      }}
                                    </span>
                                  </v-tooltip>
                                </template>
                              </v-switch>
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Time From and Time To Fields (Conditional) -->
                        <v-row v-if="formData.halfDay" class="mb-2">
                          <v-col cols="6">
                            <div class="field-wrapper">
                              <label class="field-label">Time From *</label>
                              <v-text-field
                                v-model="formData.timefrom"
                                type="time"
                                variant="outlined"
                                density="comfortable"
                                :rules="[
                                  (v) =>
                                    !formData.halfDay ||
                                    !!v ||
                                    'Time From is required for half-day leave',
                                ]"
                                required
                                class="custom-field"
                              />
                            </div>
                          </v-col>
                          <v-col cols="6">
                            <div class="field-wrapper">
                              <label class="field-label">Time To *</label>
                              <v-text-field
                                v-model="formData.timeTo"
                                type="time"
                                variant="outlined"
                                density="comfortable"
                                :rules="[
                                  (v) =>
                                    !formData.halfDay ||
                                    !!v ||
                                    'Time To is required for half-day leave',
                                  (v) =>
                                    !formData.halfDay ||
                                    !v ||
                                    !formData.timefrom ||
                                    v > formData.timefrom ||
                                    'Time To must be after Time From',
                                ]"
                                required
                                class="custom-field"
                              />
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Reason -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper">
                              <label class="field-label">Reason *</label>
                              <v-textarea
                                v-model="formData.reason"
                                variant="outlined"
                                :rules="[(v) => !!v || 'Reason is required']"
                                required
                                rows="3"
                                placeholder="Please provide a reason for your leave request..."
                                class="custom-field"
                              />
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Attachments -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper attachment-wrapper">
                              <label class="field-label"
                                >Attachments (Optional)</label
                              >
                              <v-file-input
                                v-model="formData.attachments"
                                variant="outlined"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.csv"
                                :show-size="true"
                                prepend-icon="mdi-paperclip"
                                counter
                                multiple
                                hint="Upload supporting documents (PDF, images, Word docs, or CSV)"
                                persistent-hint
                                :loading="uploadingFiles"
                                @change="handleFileChange"
                                class="custom-field attachment-field"
                              />
                            </div>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </div>

                  <v-toolbar
                    density="compact"
                    color="white"
                    elevation="1"
                    class="form-footer"
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      class="cancel-btn"
                      variant="outlined"
                      color="error"
                      @click="$emit('closeAddPage')"
                    >
                      CANCEL
                    </v-btn>
                    <v-btn
                      class="save-btn ml-3"
                      color="primary"
                      :loading="isSaving"
                      :disabled="isSaving"
                      @click="handleSave"
                    >
                      <template v-slot:loader>
                        <v-progress-circular
                          indeterminate
                          size="20"
                          width="2"
                        ></v-progress-circular>
                        <span class="ml-2">Saving...</span>
                      </template>
                      SAVE
                    </v-btn>
                  </v-toolbar>
                </v-form>
              </template>

              <!-- Out Request Tab Content -->
              <template v-if="tab.value === 'outRequest'">
                <v-form ref="outForm">
                  <v-toolbar
                    density="compact"
                    color="white"
                    elevation="1"
                    class="form-header"
                  >
                    <v-btn class="back-btn" icon @click="$emit('closeAddPage')">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title class="ml-4 form-title"
                      >Add Out Request</v-toolbar-title
                    >
                    <v-spacer></v-spacer>
                  </v-toolbar>

                  <div class="form-content">
                    <v-card class="form-card" elevation="0">
                      <v-card-text class="form-fields">
                        <!-- Dropdown for Attendance Records -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper">
                              <label class="field-label"
                                >Select In Record *</label
                              >
                              <v-select
                                v-model="outFormData.selectedAttendance"
                                :items="attendanceOptions"
                                item-title="title"
                                item-value="value"
                                variant="outlined"
                                :rules="[(v) => !!v || 'Selection is required']"
                                required
                                class="custom-field"
                              />
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Date Field (Disabled) -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper">
                              <label class="field-label">Date</label>
                              <v-text-field
                                v-model="outFormData.date"
                                type="date"
                                variant="outlined"
                                density="comfortable"
                                disabled
                                class="custom-field"
                              />
                            </div>
                          </v-col>
                        </v-row>

                        <!-- In Time Field (Disabled) -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper">
                              <label class="field-label">In Time</label>
                              <v-text-field
                                v-model="outFormData.inTime"
                                type="time"
                                variant="outlined"
                                density="comfortable"
                                disabled
                                class="custom-field"
                              />
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Out Time Field -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper">
                              <label class="field-label">Out Time *</label>
                              <v-text-field
                                v-model="outFormData.outTime"
                                type="time"
                                variant="outlined"
                                density="comfortable"
                                :disabled="!outFormData.selectedAttendance"
                                :rules="[
                                  (v) => !!v || 'Out time is required',
                                  (v) =>
                                    !v ||
                                    !outFormData.inTime ||
                                    v > outFormData.inTime ||
                                    'Out time must be after in time',
                                ]"
                                required
                                class="custom-field"
                              />
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Reason -->
                        <v-row class="mb-2">
                          <v-col cols="12">
                            <div class="field-wrapper">
                              <label class="field-label">Reason *</label>
                              <v-textarea
                                v-model="outFormData.reason"
                                variant="outlined"
                                :disabled="!outFormData.selectedAttendance"
                                :rules="[(v) => !!v || 'Reason is required']"
                                required
                                rows="3"
                                placeholder="Please provide a reason for your out request..."
                                class="custom-field"
                              />
                            </div>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </div>

                  <v-toolbar
                    density="compact"
                    color="white"
                    elevation="1"
                    class="form-footer"
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      class="cancel-btn"
                      variant="outlined"
                      color="error"
                      @click="$emit('closeAddPage')"
                    >
                      CANCEL
                    </v-btn>
                    <v-btn
                      class="save-btn ml-3"
                      color="primary"
                      :loading="isSaving"
                      :disabled="isSaving || !outFormData.selectedAttendance"
                      @click="handleOutSave"
                    >
                      <template v-slot:loader>
                        <v-progress-circular
                          indeterminate
                          size="20"
                          width="2"
                        ></v-progress-circular>
                        <span class="ml-2">Saving...</span>
                      </template>
                      SAVE
                    </v-btn>
                  </v-toolbar>
                </v-form>
              </template>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";

const emit = defineEmits(["closeAddPage", "leaveApplied"]);

const form = ref(null);
const outForm = ref(null);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const uploadingFiles = ref(false);
const uploadedFileIds = ref([]);
const leaveDocumentsFolderId = ref(null);
const attendanceCycle = ref(null);
const userDetails = ref(null);
const personalModuleData = ref(null);
const isSaving = ref(false);
const userRole = currentUserTenant.getRole();
const activeTab = ref("request");
const isAdmin = computed(() => userRole === "Admin");
const tabs = ref([]);
const setTabsBasedOnRole = () => {
  const baseTabs = [
    {
      value: "request",
      title: "Request",
      icon: "mdi-calendar-clock",
    },
  ];

  // Only add Out Request tab if user is not Admin
  if (userRole !== "Admin") {
    baseTabs.push({
      value: "outRequest",
      title: "Out Reqest",
      icon: "mdi-exit-to-app",
    });
  }

  tabs.value = baseTabs;
};
const formData = ref({
  from: null,
  to: null,
  leaveType: null,
  halfDay: false,
  timefrom: null,
  timeTo: null,
  reason: null,
  attachments: [],
});

const outFormData = ref({
  selectedAttendance: null,
  date: null,
  inTime: null,
  outTime: null,
  reason: null,
});

const attendanceOptions = ref([]);

const leaveConfig = ref({
  enabledLeaveTypes: [],
});

const leaveBalance = ref({});
const leaveTaken = ref({});
const monthLimits = ref({});
const cumulativeLimits = ref({});

const availableLeaveTypes = computed(() => {
  const leaveTypes = [
    {
      text: "On Duty",
      value: "onDuty",
      color: "primary",
      disabled: false,
    },
    {
      text: "Work From Home",
      value: "workFromHome",
      color: "primary",
      disabled: false,
    },
  ];

  if (leaveConfig.value.enabledLeaveTypes) {
    leaveConfig.value.enabledLeaveTypes.forEach((leaveType) => {
      const displayName = leaveType
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      const normalizedType = leaveType.toLowerCase().replace(/\s+/g, "");
      const balance = leaveBalance.value[normalizedType] || 0;
      const taken = leaveTaken.value[`t${normalizedType}`] || 0;
      const cumulative = cumulativeLimits.value[normalizedType] || 0;
      console.log(
        "Leave Type:",
        leaveType,
        "Balance:",
        balance,
        "Taken:",
        taken,
        "Cumulative:",
        cumulative,
      );
      leaveTypes.push({
        text: `${displayName} (Balance: ${balance - taken})`,
        value: leaveType,
        color: "primary",
        disabled: balance <= 0,
      });
    });
  }

  return leaveTypes;
});

const dateDifference = computed(() => {
  if (!formData.value.from || !formData.value.to) return 0;
  const start = new Date(formData.value.from);
  const end = new Date(formData.value.to);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

const currentCycleDates = computed(() => {
  if (!attendanceCycle.value || !personalModuleData.value) {
    return "Loading cycle information…";
  }
  const cycle = getEmployeeCycleConfig();
  if (!cycle) return "Cycle configuration not found";

  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();

  const startDay = Number(cycle.startDate);
  const endLiteral = cycle.endDate;

  let startDate, endDate;

  if (endLiteral === "end of the month") {
    startDate = new Date(y, m, startDay);
    endDate = new Date(y, m + 1, 0);
  } else {
    let startYear = y;
    let startMonth = m - 1;
    let endYear = y;
    let endMonth = m;

    if (startMonth < 0) {
      startMonth += 12;
      startYear -= 1;
    }

    const maxDayInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
    const adjustedStartDay = Math.min(startDay, maxDayInStartMonth);
    startDate = new Date(startYear, startMonth, adjustedStartDay);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 29);
    endMonth = endDate.getMonth();
    endYear = endDate.getFullYear();
    const maxDayInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
    const adjustedEndDay = Math.min(endDate.getDate(), maxDayInEndMonth);
    endDate = new Date(endYear, endMonth, adjustedEndDay);

    const diffTime = endDate - startDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays !== 29) {
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 29);
      endMonth = endDate.getMonth();
      endYear = endDate.getFullYear();
      const maxDayInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
      const adjustedEndDay = Math.min(endDate.getDate(), maxDayInEndMonth);
      endDate = new Date(endYear, endMonth, adjustedEndDay);
    }

    if (startDate > endDate) {
      endMonth += 1;
      if (endMonth > 11) {
        endMonth -= 12;
        endYear += 1;
      }
      const maxDayInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
      const adjustedEndDay = Math.min(
        Number(endLiteral) || maxDayInEndMonth,
        maxDayInEndMonth,
      );
      endDate = new Date(endYear, endMonth, adjustedEndDay);
    }
  }

  const fmt = (d) =>
    d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  return {
    startDate,
    endDate,
    formatted: `Cycle: ${fmt(startDate)} – ${fmt(endDate)}`,
  };
});

const getLeaveBalance = (leaveType) => {
  if (leaveType === "UnpaidLeave") {
    return Infinity;
  }
  const normalizedType = leaveType.toLowerCase().replace(/\s+/g, "");
  const balance = leaveBalance.value[normalizedType] || 0;
  const taken = leaveTaken.value[`t${normalizedType}`] || 0;
  const cumulative = cumulativeLimits.value[normalizedType] || 0;
  return balance - taken;
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const getLeaveDocumentsFolderId = async () => {
  const tenantId = currentUserTenant.getTenantId();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields[]=foldersId`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch tenant data");
    }
    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].foldersId) {
      const leaveDocumentsFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Leave Documents",
      );
      if (leaveDocumentsFolder) {
        return leaveDocumentsFolder.id;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching Leave Documents folder ID:", error);
    return null;
  }
};

const handleFileChange = async (event) => {
  const files = formData.value.attachments;
  if (!files || files.length === 0) {
    uploadedFileIds.value = [];
    return;
  }
  await handleFileUpload(files);
};

const handleFileUpload = async (files) => {
  if (!leaveDocumentsFolderId.value) {
    showErrorMessage("Leave Documents folder not configured.");
    return;
  }
  uploadingFiles.value = true;
  const newUploadedFileIds = [];
  try {
    const fileArray = Array.isArray(files) ? files : [files];
    for (const file of fileArray) {
      if (!file || !(file instanceof File)) continue;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", leaveDocumentsFolderId.value);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error(`Failed to upload file: ${file.name}`);
      const data = await response.json();
      newUploadedFileIds.push(data.data.id);
    }
    uploadedFileIds.value = newUploadedFileIds;
    if (newUploadedFileIds.length > 0) {
      showSuccessMessage(
        `Successfully uploaded ${newUploadedFileIds.length} file(s)`,
      );
    }
  } catch (error) {
    console.error("Error uploading files:", error);
    showErrorMessage("Failed to upload files.");
    uploadedFileIds.value = [];
  } finally {
    uploadingFiles.value = false;
  }
};

const fetchUserAndLeaveData = async () => {
  try {
    const token = getToken();
    userDetails.value = await currentUserTenant.fetchLoginUserDetails();
    const userId = userDetails.value.id;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?` +
        `fields[]=id,assignedUser.dateOfJoining,leaves.id,leaves.CarryForwardleave,leaves.monthLimit,leaves.leaveBalance,leaves.leaveTaken,leaves.assignedLeave,cycleType` +
        `&filter[_and][0][assignedUser][id][_eq]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    personalModuleData.value = data.data?.[0];

    if (!personalModuleData.value) {
      throw new Error("Personal module not found");
    }

    const assignedLeaves = personalModuleData.value.leaves?.assignedLeave || [];
    leaveConfig.value.enabledLeaveTypes = assignedLeaves.map((leave) =>
      leave.toLowerCase().replace(/\s+/g, ""),
    );

    if (personalModuleData.value.leaves) {
      const {
        leaveBalance: balance,
        leaveTaken: taken,
        monthLimit,
      } = personalModuleData.value.leaves;

      const newLeaveBalance = {};
      const newLeaveTaken = {};
      const newMonthLimits = {};
      const newCumulativeLimits = {};

      assignedLeaves.forEach((leaveName) => {
        const normalizedName = leaveName.toLowerCase().replace(/\s+/g, "");

        const possibleKeys = [
          normalizedName,
          leaveName.toLowerCase().replace(/\s+/g, "_"),
          leaveName.toLowerCase(),
          leaveName,
          leaveName.replace(/\s+/g, ""),
          leaveName.charAt(0).toUpperCase() + leaveName.slice(1).toLowerCase(),
          leaveName
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(" "),
          leaveName
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(""),
        ];

        let actualBalance = 0;
        let actualTaken = 0;
        let actualMonthLimit = 0;

        for (const key of possibleKeys) {
          if (balance && balance[key] !== undefined) {
            actualBalance = Number(balance[key] || 0);
            break;
          }
        }

        for (const key of possibleKeys) {
          const takenKey = `t${key}`;
          if (taken && taken[takenKey] !== undefined) {
            actualTaken = Number(taken[takenKey] || 0);
            break;
          }
          if (taken && taken[key] !== undefined) {
            actualTaken = Number(taken[key] || 0);
            break;
          }
        }

        for (const key of possibleKeys) {
          if (monthLimit && monthLimit[key] !== undefined) {
            actualMonthLimit = Number(monthLimit[key] || 0);
            break;
          }
        }

        newLeaveBalance[normalizedName] = actualBalance;
        newLeaveTaken[`t${normalizedName}`] = actualTaken;
        newMonthLimits[normalizedName] = actualMonthLimit;
        newCumulativeLimits[normalizedName] = 0;
      });

      leaveBalance.value = newLeaveBalance;
      leaveTaken.value = newLeaveTaken;
      monthLimits.value = newMonthLimits;
      cumulativeLimits.value = newCumulativeLimits;

      // try {
      //   await calculateCumulativeLimits(
      //     userDetails.value,
      //     assignedLeaves,
      //     personalModuleData.value.assignedUser?.dateOfJoining,
      //   );
      // } catch (error) {
      //   console.error("Failed to calculate cumulative limits:", error);
      //   showErrorMessage("Unable to calculate cumulative leave limits.");
      // }
    }
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    showErrorMessage("Failed to fetch leave balance data.");
  }
};

// const calculateCumulativeLimits = async (
//   userDetails,
//   assignedLeaves,
//   dateOfJoining,
// ) => {
//   console.log("🟢 STEP 1: Function called with parameters:", {
//     userDetails,
//     assignedLeaves,
//     dateOfJoining,
//   });

//   try {
//     const token = getToken();
//     const userId = userDetails.id;
//     const tenantId = currentUserTenant.getTenantId();

//     console.log("🟢 STEP 2: Token, User ID, Tenant ID", {
//       token,
//       userId,
//       tenantId,
//     });

//     const joinDate = new Date(dateOfJoining);
//     if (!dateOfJoining || isNaN(joinDate.getTime())) {
//       console.error(
//         "❌ STEP 3: Invalid or missing joining date:",
//         dateOfJoining,
//       );
//       showErrorMessage("Joining date is missing or invalid.");
//       return;
//     }
//     console.log("🟢 STEP 3: Valid joining date:", joinDate.toISOString());

//     const leaveNamesFilter = assignedLeaves
//       .map((leave) => encodeURIComponent(leave))
//       .join(",");
//     console.log("🟢 STEP 4: Leave names filter prepared:", leaveNamesFilter);

//     const leaveSettingUrl =
//       `${import.meta.env.VITE_API_URL}/items/leaveSetting?` +
//       `fields[]=leaveName,date_created&` +
//       `filter[_and][0][leaveName][_in]=${leaveNamesFilter}&` +
//       `filter[_and][1][tenant][tenantId][_eq]=${tenantId}`;

//     console.log("🟢 STEP 5: Fetching leave settings:", leaveSettingUrl);

//     const leaveSettingResponse = await fetch(leaveSettingUrl, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!leaveSettingResponse.ok) {
//       console.error("❌ STEP 6: Failed to fetch leave settings");
//       showErrorMessage("Failed to fetch leave settings.");
//       return;
//     }

//     const leaveSettingData = await leaveSettingResponse.json();
//     console.log("🟢 STEP 6: Leave settings data received:", leaveSettingData);

//     const leaveSettingsMap = new Map(
//       leaveSettingData.data.map((setting) => [
//         setting.leaveName,
//         new Date(setting.date_created),
//       ]),
//     );
//     console.log("🟢 STEP 7: Leave settings map created:", leaveSettingsMap);

//     for (const leaveName of assignedLeaves) {
//       console.log("🔵 STEP 8: Processing leave type:", leaveName);

//       const normalizedKey = leaveName.toLowerCase().replace(/\s+/g, "");
//       const leaveCreationDate = leaveSettingsMap.get(leaveName);
//       console.log("🔵 STEP 8.1: Normalized Key & Leave Creation Date:", {
//         normalizedKey,
//         leaveCreationDate,
//       });

//       if (!leaveCreationDate || isNaN(leaveCreationDate.getTime())) {
//         console.warn(
//           "⚠️ STEP 8.2: Invalid leave creation date, skipping:",
//           leaveName,
//         );
//         continue;
//       }

//       const startDate = new Date(
//         Math.max(joinDate.getTime(), leaveCreationDate.getTime()),
//       );
//       startDate.setDate(1);
//       startDate.setMonth(startDate.getMonth() + 1);

//       const currentDate = new Date();
//       const monthsToProcess = [];

//       let currentMonth = new Date(startDate);
//       while (currentMonth <= currentDate && !isNaN(currentMonth.getTime())) {
//         monthsToProcess.push(new Date(currentMonth));
//         currentMonth.setMonth(currentMonth.getMonth() + 1);
//       }

//       console.log(
//         "🟢 STEP 9: Months to process for",
//         leaveName,
//         monthsToProcess,
//       );

//       if (monthLimits.value[normalizedKey] > 0) {
//         console.log(
//           "🟢 STEP 10: Monthly limit found for",
//           leaveName,
//           monthLimits.value[normalizedKey],
//         );
//         let totalCumulative = 0;

//         for (const month of monthsToProcess) {
//           if (isNaN(month.getTime())) {
//             console.warn("⚠️ STEP 11: Invalid month date, skipping:", month);
//             continue;
//           }

//           const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
//           const monthEnd = new Date(
//             month.getFullYear(),
//             month.getMonth() + 1,
//             0,
//           );

//           console.log("🔵 STEP 12: Processing month:", {
//             leaveName,
//             monthStart: monthStart.toISOString(),
//             monthEnd: monthEnd.toISOString(),
//           });

//           const requestUrl =
//             `${import.meta.env.VITE_API_URL}/items/leaveRequest?` +
//             `filter[_and][0][requestedBy][assignedUser][id][_eq]=${userId}&` +
//             `filter[_and][1][status][_in]=approved,pending&` +
//             `filter[_and][2][leaveType][_eq]=${encodeURIComponent(leaveName)}&` +
//             `filter[_and][3][fromDate][_gte]=${monthStart.toISOString().split("T")[0]}&` +
//             `filter[_and][4][fromDate][_lte]=${monthEnd.toISOString().split("T")[0]}`;

//           console.log(
//             "🟢 STEP 13: Fetching leave requests for month:",
//             requestUrl,
//           );

//           const response = await fetch(requestUrl, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           });

//           if (!response.ok) {
//             console.warn(
//               "⚠️ STEP 14: Failed to fetch leave requests for:",
//               leaveName,
//             );
//             continue;
//           }

//           const leaveData = await response.json();
//           console.log("🟢 STEP 15: Leave requests fetched:", leaveData);

//           let monthUsed = 0;
//           for (const leave of leaveData.data || []) {
//             const daysUsed = calculateDays(
//               leave.fromDate,
//               leave.toDate,
//               leave.halfDay,
//             );
//             monthUsed += daysUsed;
//             console.log("🔹 STEP 16: Calculating used days:", {
//               leaveId: leave.id,
//               from: leave.fromDate,
//               to: leave.toDate,
//               daysUsed,
//             });
//           }

//           const monthLimit = monthLimits.value[normalizedKey];
//           const remaining = Math.max(0, monthLimit - monthUsed);
//           console.log("🟢 STEP 17: Month summary:", {
//             monthLimit,
//             monthUsed,
//             remaining,
//           });

//           totalCumulative += remaining;
//         }

//         cumulativeLimits.value[normalizedKey] = totalCumulative;
//         console.log("✅ STEP 18: Cumulative limit set:", {
//           leaveName,
//           totalCumulative,
//         });
//       } else {
//         console.warn("⚠️ STEP 19: No monthly limit found for:", leaveName);
//       }
//     }

//     console.log("🏁 STEP 20: Final cumulative limits:", cumulativeLimits.value);
//   } catch (error) {
//     console.error("❌ STEP 21: Error calculating cumulative limits:", error);
//     showErrorMessage("Failed to calculate cumulative limits.");
//   }
// };

const getEmployeeCycleConfig = () => {
  if (!attendanceCycle.value || !personalModuleData.value) return null;

  const cycleType = personalModuleData.value.cycleType;
  const cycle = attendanceCycle.value.multi_attendance_cycle?.cycles?.find(
    (c) => String(c.cycleId) === String(cycleType),
  );
  return cycle || null;
};

const calculateDays = (fromDate, toDate, isHalfDay) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return isHalfDay ? diffDays * 0.5 : diffDays;
};

const resetHalfDayAndTimeFields = () => {
  if (formData.value.leaveType === "workFromHome") {
    formData.value.halfDay = false;
    formData.value.timefrom = null;
    formData.value.timeTo = null;
  }
};

const fetchAttendanceRecords = async () => {
  const cycleDates = currentCycleDates.value;
  if (typeof cycleDates === "string") {
    showErrorMessage(cycleDates);
    return;
  }

  const start = cycleDates.startDate.toISOString().split("T")[0];
  const end = cycleDates.endDate.toISOString().split("T")[0];
  const tenantId = currentUserTenant.getTenantId();
  const employeeId = personalModuleData.value.id;

  const url =
    `${import.meta.env.VITE_API_URL}/items/attendance?` +
    `filter[_and][0][date][_between][0]=${start}&` +
    `filter[_and][0][date][_between][1]=${end}&` +
    `filter[_and][1][status][_eq]=in&` +
    `filter[_and][3][employeeId][id][_eq]=${employeeId}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch attendance records");
    }
    const data = await response.json();
    attendanceOptions.value = data.data.map((item) => ({
      title: `${item.date} - In: ${item.inTime}`,
      value: item.id,
      date: item.date,
      inTime: item.inTime,
    }));
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    showErrorMessage("Failed to fetch attendance records.");
  }
};

const transformPayload = async (data) => {
  const tenantId = currentUserTenant.getTenantId();
  if (!userDetails.value || !personalModuleData.value) {
    await fetchUserAndLeaveData();
  }

  const payload = {
    tenant: { tenantId },
    fromDate: data.from,
    toDate: data.to,
    leaveType: data.leaveType,
    halfDay: data.halfDay,
    reason: data.reason,
    status: "pending",
    requestedBy: personalModuleData.value.id,
    attachments: uploadedFileIds.value,
  };

  if (data.halfDay) {
    // Combine date and time into full datetime strings
    const fromDateTime = `${data.from}T${data.timefrom}:00`;
    const toDateTime = `${data.to}T${data.timeTo}:00`;

    payload.timefrom = fromDateTime;
    payload.timeTo = toDateTime;
  }

  return payload;
};

const checkMonthlyLeaveLimit = async (payload) => {
  console.log("🟢 STEP 1: Function called with payload:", payload);

  if (payload.leaveType === "UnpaidLeave") {
    console.log(
      "🟢 STEP 2: Leave type is 'UnpaidLeave' — skipping limit check.",
    );
    return true;
  }

  const normalizedType = payload.leaveType.toLowerCase().replace(/\s+/g, "");
  const monthLimit = monthLimits.value[normalizedType] || 0;

  console.log("🟢 STEP 3: Normalized leave type & month limit:", {
    normalizedType,
    monthLimit,
  });

  if (monthLimit <= 0) {
    console.warn(
      "⚠️ STEP 4: No monthly limit found for leave type:",
      payload.leaveType,
    );
    return true;
  }

  const requestDays = calculateDays(
    payload.fromDate,
    payload.toDate,
    payload.halfDay,
  );
  console.log("🟢 STEP 5: Calculated requested leave days:", requestDays);

  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const formattedFirstDay = firstDayOfMonth.toISOString().split("T")[0];

    console.log("🟢 STEP 6: Current month details:", {
      today: today.toISOString(),
      firstDayOfMonth: formattedFirstDay,
    });

    const url =
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?` +
      `filter[_and][0][requestedBy][id][_eq]=${payload.requestedBy}&` +
      `filter[_and][1][status][_in]=approved,pending&` +
      `filter[_and][2][leaveType][_eq]=${payload.leaveType}&` +
      `filter[_and][3][fromDate][_gte]=${formattedFirstDay}`;

    console.log("🟢 STEP 7: Fetching current month leaves from:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      console.error(
        "❌ STEP 8: Failed to fetch leave requests. Status:",
        response.status,
      );
      throw new Error("Failed to fetch current month's leaves");
    }

    const data = await response.json();
    const currentMonthLeaves = data.data || [];
    console.log("🟢 STEP 9: Leave requests fetched:", currentMonthLeaves);

    let totalDaysUsed = 0;
    currentMonthLeaves.forEach((leave) => {
      if (leave.id !== payload.id) {
        const days = calculateDays(leave.fromDate, leave.toDate, leave.halfDay);
        totalDaysUsed += days;
        console.log("🔹 STEP 10: Counting leave days:", {
          leaveId: leave.id,
          from: leave.fromDate,
          to: leave.toDate,
          halfDay: leave.halfDay,
          daysUsed: days,
        });
      } else {
        console.log(
          "🔹 STEP 10: Skipping current request (editing existing leave):",
          leave.id,
        );
      }
    });

    console.log(
      "🟢 STEP 11: Total days used this month so far:",
      totalDaysUsed,
    );

    const totalMonthLimit = monthLimit;
    console.log(
      "🟢 STEP 12: Total limit (monthly + cumulative):",
      totalMonthLimit,
    );

    const totalRequestedIncludingThis = totalDaysUsed + requestDays;
    console.log(
      "🟢 STEP 13: Total requested days (including this):",
      totalRequestedIncludingThis,
    );

    if (totalRequestedIncludingThis > totalMonthLimit) {
      const remainingDays = totalMonthLimit - totalDaysUsed;
      console.warn("⚠️ STEP 14: Leave limit exceeded!", {
        totalRequestedIncludingThis,
        totalMonthLimit,
        remainingDays,
      });

      showErrorMessage(
        `Leave limit exceeded. You can only take ${remainingDays} more day(s) of ${payload.leaveType} this month.`,
      );
      return false;
    }

    console.log("✅ STEP 15: Leave within limits — allowed.");
    return true;
  } catch (error) {
    console.error("❌ STEP 16: Error checking monthly limit:", error);
    showErrorMessage("Failed to verify monthly leave limit.");
    return false;
  }
};

const checkJoiningDate = (leaveStartDate) => {
  if (!userDetails.value?.dateOfJoining) return true;
  const joinDate = new Date(userDetails.value.dateOfJoining);
  const leaveDate = new Date(leaveStartDate);
  const isSameMonth =
    joinDate.getMonth() === leaveDate.getMonth() &&
    joinDate.getFullYear() === leaveDate.getFullYear();
  if (isSameMonth) {
    showErrorMessage("You cannot request leave in the joining month.");
    return false;
  }
  return true;
};

const validateDates = (fromDate, toDate) => {
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);

  if (endDate < startDate) {
    showErrorMessage("End date cannot be before start date");
    return false;
  }

  return true;
};

const fetchAttendanceCycle = async () => {
  const tenantId = currentUserTenant.getTenantId();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[tenant][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch attendance cycle");
    const data = await response.json();
    attendanceCycle.value = data.data?.[0] || null;
  } catch (error) {
    console.error("Error fetching attendance cycle:", error);
    showErrorMessage("Failed to load attendance cycle data");
  }
};

const validateDatesAgainstCycle = (fromDate, toDate) => {
  if (!attendanceCycle.value || !personalModuleData.value) {
    showErrorMessage("Attendance cycle not configured");
    return false;
  }

  const cycleDates = currentCycleDates.value;
  if (typeof cycleDates === "string") {
    showErrorMessage(cycleDates);
    return false;
  }

  const start = new Date(fromDate);
  const end = new Date(toDate);
  const cycleStart = cycleDates.startDate;
  const cycleEnd = cycleDates.endDate;

  const startOfDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const endOfDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  if (startOfDay < cycleStart || endOfDay > cycleEnd) {
    showErrorMessage(
      `Leave must be within your attendance cycle period (${cycleStart.toLocaleDateString()} to ${cycleEnd.toLocaleDateString()})`,
    );
    return false;
  }

  if (
    attendanceCycle.value.fixedCycle &&
    (start.getMonth() !== end.getMonth() ||
      start.getFullYear() !== end.getFullYear())
  ) {
    showErrorMessage(
      "Leave request cannot span multiple months in a fixed cycle",
    );
    return false;
  }

  return true;
};

const checkPayrollVerification = async () => {
  const tenantId = currentUserTenant.getTenantId();
  try {
    if (!attendanceCycle.value || !userDetails.value) {
      showErrorMessage("Attendance cycle or user details not configured.");
      return false;
    }

    const cycleDates = currentCycleDates.value;
    if (typeof cycleDates === "string") {
      showErrorMessage(cycleDates);
      return false;
    }

    const cycleStartDate = cycleDates.startDate.toISOString().split("T")[0];
    const cycleEndDate = cycleDates.endDate.toISOString().split("T")[0];

    const url =
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?` +
      `filter[employee][assignedUser][id][_eq]=${userDetails.value.id}&` +
      `filter[startDate][_between]=${cycleStartDate},${cycleEndDate}&` +
      `filter[employee][assignedUser][tenant][tenantId][_eq]=${tenantId}&` +
      `fields=attendaceVerification,salaryVerification`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch payroll verification data: ${response.status}`,
      );
    }

    const data = await response.json();
    const payrollData = data.data?.[0];
    if (!payrollData) {
      return true;
    }

    const { attendanceVerification, salaryVerification } = payrollData;
    if (attendanceVerification || salaryVerification) {
      showErrorMessage(
        "Leave application is disabled due to ongoing attendance or salary verification.",
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking payroll verification:", error);
    showErrorMessage("Failed to verify payroll status. Please try again.");
    return false;
  }
};

const checkConflictingLeaveRequests = async (payload) => {
  try {
    const { fromDate, toDate, requestedBy } = payload;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?` +
        `filter[_and][0][requestedBy][id][_eq]=${requestedBy}&` +
        `filter[_and][1][status][_in]=approved,pending&` +
        `filter[_and][2][_or][0][fromDate][_between]=${fromDate},${toDate}&` +
        `filter[_and][2][_or][1][toDate][_between]=${fromDate},${toDate}&` +
        `filter[_and][2][_or][2][_and][0][fromDate][_lte]=${fromDate}&` +
        `filter[_and][2][_or][2][_and][1][toDate][_gte]=${toDate}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to check for conflicting leave requests");
    }

    const data = await response.json();
    const conflictingLeaves = data.data || [];

    if (conflictingLeaves.length > 0) {
      const conflictingTypes = conflictingLeaves
        .map((leave) => leave.leaveType)
        .join(", ");
      showErrorMessage(
        `Cannot apply leave. You have existing ${conflictingTypes} request(s) overlapping with the selected dates.`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking conflicting leave requests:", error);
    showErrorMessage(
      "Failed to verify conflicting leave requests. Please try again.",
    );
    return false;
  }
};

const handleSave = async () => {
  try {
    isSaving.value = true;
    const tenantId = currentUserTenant.getTenantId();
    console.log("🔍 DEBUG FORM VALIDATION:");
    console.log("form.value:", form.value);
    console.log("form.value.validate:", form.value?.validate);
    console.log("Form data:", JSON.parse(JSON.stringify(formData.value)));

    let isValid = false;

    // Try form validation first, fallback to manual validation
    if (form.value && typeof form.value.validate === "function") {
      console.log("🟢 Using form validation");
      const { valid } = await form.value.validate();
      isValid = valid;
      console.log("Form validation result:", valid);
    } else {
      console.log("🟡 Using manual validation");
      isValid =
        formData.value.from &&
        formData.value.to &&
        formData.value.leaveType &&
        formData.value.reason &&
        (!formData.value.halfDay ||
          (formData.value.timefrom && formData.value.timeTo));
      console.log("Manual validation result:", isValid);
      console.log("Individual fields:", {
        from: !!formData.value.from,
        to: !!formData.value.to,
        leaveType: !!formData.value.leaveType,
        reason: !!formData.value.reason,
        timefrom: !formData.value.halfDay || !!formData.value.timefrom,
        timeTo: !formData.value.halfDay || !!formData.value.timeTo,
      });
    }

    console.log("Final isValid:", isValid);

    if (!isValid) {
      console.log("❌ Validation failed - showing error");
      showErrorMessage("Please fill all required fields");
      return;
    } else {
      console.log("✅ Validation passed - continuing with save");
    }

    if (!validateDates(formData.value.from, formData.value.to)) {
      return;
    }

    if (!validateDatesAgainstCycle(formData.value.from, formData.value.to)) {
      return;
    }

    const isPayrollVerified = await checkPayrollVerification();
    if (!isPayrollVerified) {
      return;
    }

    const payload = await transformPayload(formData.value);
    const noConflicts = await checkConflictingLeaveRequests(payload);
    if (!noConflicts) {
      return;
    }

    if (!payload.requestedBy) {
      throw new Error("RequestedBy ID is missing");
    }

    const leaveTypeKey = formData.value.leaveType
      .toLowerCase()
      .replace(/\s+/g, "");

    if (
      leaveTypeKey !== "workfromhome" &&
      leaveTypeKey !== "onduty" &&
      !leaveConfig.value.enabledLeaveTypes.includes(leaveTypeKey)
    ) {
      showErrorMessage("This leave type is not available for you");
      return;
    }

    if (!checkJoiningDate(formData.value.from)) {
      return;
    }

    const isMonthlyLimitOk = await checkMonthlyLeaveLimit(payload);
    if (!isMonthlyLimitOk) return;

    const numberOfDays = calculateDays(
      formData.value.from,
      formData.value.to,
      formData.value.halfDay,
    );

    if (leaveTypeKey !== "workfromhome" && leaveTypeKey !== "onduty") {
      const currentBalance = getLeaveBalance(formData.value.leaveType);
      if (numberOfDays > currentBalance) {
        showErrorMessage(
          `Insufficient leave balance. You only have ${currentBalance} days remaining.`,
        );
        return;
      }
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveSetting?filter[tenant][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch leave settings: ${response.status}`);
    }
    const leaveSettings = await response.json();
    const leaveSetting = leaveSettings.data?.find(
      (setting) =>
        setting.leaveName &&
        setting.leaveName.toLowerCase().replace(/\s+/g, "") === leaveTypeKey,
    );

    if (
      leaveTypeKey !== "workfromhome" &&
      leaveTypeKey !== "onduty" &&
      !leaveSetting
    ) {
      showErrorMessage("Leave settings not found for this leave type");
      return;
    }

    const canClubWithOtherLeaves =
      leaveSetting?.leaveConfig?.condition?.includes("clubWithOtherLeaves") ||
      false;

    const newLeaveStartDate = new Date(formData.value.from);
    const previousDate = new Date(newLeaveStartDate);
    previousDate.setDate(newLeaveStartDate.getDate() - 1);
    const formattedPreviousDate = previousDate.toISOString().split("T")[0];

    const prevLeaveResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?filter[_and][0][requestedBy][id][_eq]=${payload.requestedBy}&filter[_and][1][status][_in]=approved,pending&filter[_and][2][toDate][_eq]=${formattedPreviousDate}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (!prevLeaveResponse.ok) {
      throw new Error(
        `Failed to fetch previous leave request: ${prevLeaveResponse.status}`,
      );
    }
    const prevLeaveData = await prevLeaveResponse.json();
    const previousLeave = prevLeaveData.data?.[0];

    if (previousLeave && !canClubWithOtherLeaves) {
      const isConsecutive = previousLeave.toDate === formattedPreviousDate;
      if (
        isConsecutive &&
        previousLeave.leaveType.toLowerCase().replace(/\s+/g, "") !==
          leaveTypeKey
      ) {
        showErrorMessage(
          `Cannot apply for ${formData.value.leaveType} consecutively after ${previousLeave.leaveType}.`,
        );
        return;
      }
    }

    const responseLeave = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!responseLeave.ok) {
      const errorData = await responseLeave.json();
      throw new Error(
        `Failed to save leave request: ${errorData.message || responseLeave.status}`,
      );
    }

    // Generate all dates in the range
    const allDates = getAllDatesInRange(formData.value.from, formData.value.to);
    console.log(`Creating logs and attendance for dates:`, allDates);

    // Check existing logs for the date range
    const logsResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/logs?filter[_and][0][employeeId][_eq]=${payload.requestedBy}&filter[_and][1][tenant][_eq]=${tenantId}&filter[_and][2][date][_between][0]=${formData.value.from}&filter[_and][2][date][_between][1]=${formData.value.to}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (!logsResponse.ok) {
      throw new Error(`Failed to check existing logs: ${logsResponse.status}`);
    }
    const existingLogs = await logsResponse.json();

    // Process logs for each date
    for (const date of allDates) {
      const logPayloadBase = {
        status: "request",
        date: date,
        employeeId: payload.requestedBy,
        tenant: tenantId,
      };

      const existingLogsForDate = existingLogs.data.filter(
        (log) => log.date === date,
      );

      const isPartialLeave =
        formData.value.timefrom &&
        formData.value.timeTo &&
        leaveTypeKey !== "workfromhome";

      if (isPartialLeave) {
        // Clean up any existing logs for this date by deleting them
        if (existingLogsForDate.length > 0) {
          for (const log of existingLogsForDate) {
            const deleteResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/items/logs/${log.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              },
            );
            if (!deleteResponse.ok) {
              throw new Error(
                `Failed to delete existing log: ${deleteResponse.status}`,
              );
            }
            console.log(`🗑️ Deleted existing log for date: ${date}`);
          }
        }

        // Create two new logs with timeStamp
        const times = [
          { timeStamp: formData.value.timefrom },
          { timeStamp: formData.value.timeTo },
        ];

        for (const timeObj of times) {
          const logPayload = { ...logPayloadBase, ...timeObj };
          const createResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/logs`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
              },
              body: JSON.stringify(logPayload),
            },
          );

          if (!createResponse.ok) {
            throw new Error(`Failed to create log: ${createResponse.status}`);
          }
          console.log(
            `✅ Created log for date: ${date} with timeStamp: ${timeObj.timeStamp}`,
          );
        }
      } else {
        // Clean up extras if more than one, update the first or create if none
        const logPayload = { ...logPayloadBase }; // No timeStamp

        if (existingLogsForDate.length > 0) {
          // Update the first one
          const firstLog = existingLogsForDate[0];
          const updateResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/logs/${firstLog.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
              },
              body: JSON.stringify(logPayload),
            },
          );

          if (!updateResponse.ok) {
            throw new Error(`Failed to update log: ${updateResponse.status}`);
          }
          console.log(`✅ Updated log for date: ${date}`);

          // Delete any extra logs
          for (let i = 1; i < existingLogsForDate.length; i++) {
            const deleteResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/items/logs/${existingLogsForDate[i].id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              },
            );
            if (!deleteResponse.ok) {
              throw new Error(
                `Failed to delete extra log: ${deleteResponse.status}`,
              );
            }
            console.log(`🗑️ Deleted extra log for date: ${date}`);
          }
        } else {
          // Create new log
          const createResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/logs`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
              },
              body: JSON.stringify(logPayload),
            },
          );

          if (!createResponse.ok) {
            throw new Error(`Failed to create log: ${createResponse.status}`);
          }
          console.log(`✅ Created log for date: ${date}`);
        }
      }
    }

    // Check existing attendance for the date range
    const attendanceResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendance?filter[_and][0][employeeId][_eq]=${payload.requestedBy}&filter[_and][1][tenant][_eq]=${tenantId}&filter[_and][2][date][_between][0]=${formData.value.from}&filter[_and][2][date][_between][1]=${formData.value.to}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (!attendanceResponse.ok) {
      throw new Error(
        `Failed to check existing attendance: ${attendanceResponse.status}`,
      );
    }
    const existingAttendance = await attendanceResponse.json();
    const existingAttendanceDates = existingAttendance.data.map(
      (att) => att.date,
    );

    // Process attendance for each date
    for (const date of allDates) {
      const attendancePayload = {
        status: "request",
        date: date,
        employeeId: payload.requestedBy,
        tenant: tenantId,
        leaveType: formData.value.leaveType,
        attendance: "paidLeave",
      };

      if (formData.value.timefrom) {
        attendancePayload.inTime = formData.value.timefrom; // Assuming timeFrom is inTime equivalent
      }
      if (formData.value.timeTo) {
        attendancePayload.outTime = formData.value.timeTo; // Assuming timeTo is outTime equivalent
      }

      if (existingAttendanceDates.includes(date)) {
        // Update existing attendance
        const attendanceId = existingAttendance.data.find(
          (att) => att.date === date,
        ).id;
        const updateResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance/${attendanceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(attendancePayload),
          },
        );

        if (!updateResponse.ok) {
          throw new Error(
            `Failed to update attendance: ${updateResponse.status}`,
          );
        }
        console.log(`✅ Updated attendance for date: ${date}`);
      } else {
        // Create new attendance
        const createResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(attendancePayload),
          },
        );

        if (!createResponse.ok) {
          throw new Error(
            `Failed to create attendance: ${createResponse.status}`,
          );
        }
        console.log(`✅ Created attendance for date: ${date}`);
      }
    }

    if (leaveTypeKey !== "unpaidleave") {
      const normalizedType = leaveTypeKey;
      const takenKey = `t${normalizedType}`;

      if (!personalModuleData.value?.leaves?.id) {
        throw new Error("Leave data ID is missing");
      }

      const updateResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/leave/${personalModuleData.value.leaves.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leaveTaken: {
              ...leaveTaken.value,
              [takenKey]: (leaveTaken.value[takenKey] || 0) + numberOfDays,
            },
          }),
        },
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(
          `Failed to update leave balance: ${errorData.message || updateResponse.status}`,
        );
      }

      leaveTaken.value[takenKey] =
        (leaveTaken.value[takenKey] || 0) + numberOfDays;
      leaveBalance.value[normalizedType] =
        (leaveBalance.value[normalizedType] || 0) - numberOfDays;
    }

    showSuccessMessage("Leave applied successfully");

    setTimeout(() => {
      emit("closeAddPage");
      emit("leaveApplied");
    }, 2000);
  } catch (error) {
    console.error("ERROR in handleSave:", error);
    showErrorMessage(`Failed to apply leave: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
};

// Helper function to generate all dates between from and to
const getAllDatesInRange = (fromDate, toDate) => {
  const dates = [];
  const currentDate = new Date(fromDate);
  const endDate = new Date(toDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const handleOutSave = async () => {
  try {
    isSaving.value = true;

    if (outForm.value && typeof outForm.value.validate === "function") {
      const { valid } = await outForm.value.validate();
      if (!valid) {
        showErrorMessage("Please fill all required fields");
        return;
      }
    } else {
      // Manual validation
      if (
        !outFormData.value.selectedAttendance ||
        !outFormData.value.outTime ||
        !outFormData.value.reason
      ) {
        showErrorMessage("Please fill all required fields");
        return;
      }
      if (outFormData.value.outTime <= outFormData.value.inTime) {
        showErrorMessage("Out time must be after in time");
        return;
      }
    }

    const payload = {
      tenant: { tenantId: currentUserTenant.getTenantId() },
      fromDate: outFormData.value.date,
      toDate: outFormData.value.date,
      leaveType: "abnormal",
      halfDay: true,
      timefrom: `${outFormData.value.date}T${outFormData.value.inTime}`,
      timeTo: `${outFormData.value.date}T${outFormData.value.outTime}`,
      reason: outFormData.value.reason,
      status: "pending",
      requestedBy: personalModuleData.value.id,
      attendance: outFormData.value.selectedAttendance,
      attachments: [],
    };

    // Additional checks if needed, similar to handleSave
    const noConflicts = await checkConflictingLeaveRequests(payload);
    if (!noConflicts) return;

    const isPayrollVerified = await checkPayrollVerification();
    if (!isPayrollVerified) return;

    if (!validateDatesAgainstCycle(payload.fromDate, payload.toDate)) return;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to save out request: ${errorData.message || response.status}`,
      );
    }

    showSuccessMessage("Out request applied successfully");

    setTimeout(() => {
      emit("closeAddPage");
      emit("leaveApplied");
    }, 2000);
  } catch (error) {
    console.error("ERROR in handleOutSave:", error);
    showErrorMessage(`Failed to apply out request: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
};

const handleTabChange = () => {
  formData.value = {
    from: null,
    to: null,
    leaveType: null,
    halfDay: false,
    timefrom: null,
    timeTo: null,
    reason: null,
    attachments: [],
  };
  outFormData.value = {
    selectedAttendance: null,
    date: null,
    inTime: null,
    outTime: null,
    reason: null,
  };
  if (form.value) {
    form.value.resetValidation();
  }
  if (outForm.value) {
    outForm.value.resetValidation();
  }
};

watch(
  () => outFormData.value.selectedAttendance,
  (newVal) => {
    if (newVal) {
      const selected = attendanceOptions.value.find(
        (opt) => opt.value === newVal,
      );
      if (selected) {
        outFormData.value.date = selected.date;
        outFormData.value.inTime = selected.inTime;
      }
    } else {
      outFormData.value.date = null;
      outFormData.value.inTime = null;
      outFormData.value.outTime = null;
      outFormData.value.reason = null;
    }
  },
);

onMounted(async () => {
  await fetchUserAndLeaveData();
  await fetchAttendanceCycle();

  await fetchAttendanceRecords();

  leaveDocumentsFolderId.value = await getLeaveDocumentsFolderId();
  setTabsBasedOnRole();
});
</script>
<style scoped>
.add-form-container {
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.custom-tabs {
  background-color: #e8edff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 8px 10px 0;
}

.custom-tab {
  background-color: white;
  color: #122f68 !important;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  margin-right: 8px;
  min-height: 48px;
  transition: background-color 0.3s ease;
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
}

.v-tab--selected.custom-tab {
  background-color: #122f68 !important;
  color: whitesmoke !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.custom-tab .v-icon {
  color: #122f68 !important;
  opacity: 0.8;
}

.v-tab--selected .v-icon {
  color: white !important;
  opacity: 1;
}

.tab-content-wrapper {
  border-radius: 0 0 12px 12px;
  background: white;
}

.out-request-content {
  padding: 16px;
  color: #424242;
  font-size: 1rem;
}

.form-header {
  padding: 5px;
  background: white !important;
  border-bottom: 2px solid #e3f2fd;
  position: sticky;
  top: 0;
  z-index: 10;
}

.form-footer {
  padding: 5px;
  background: white !important;
  border-top: 2px solid #e3f2fd;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.back-btn {
  background: #f5f5f5;
  color: #333;
}

.back-btn:hover {
  background: #e0e0e0;
}

.form-title {
  font-weight: 600;
  color: #1976d2;
  font-size: 1.2rem;
}

.form-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.form-card {
  border-radius: 12px;
  overflow: hidden;
  min-height: 100%;
}

.form-fields {
  padding: 16px 16px 24px 16px;
  background: white;
}

.field-wrapper {
  margin-bottom: 4px;
}

.field-label {
  display: block;
  font-weight: 500;
  color: #424242;
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.custom-field {
  background: #fafafa;
  border-radius: 8px;
}

.custom-field :deep(.v-field) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-field :deep(.v-field--focused) {
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.custom-field :deep(.v-field__input) {
  padding: 10px 14px;
  font-size: 0.95rem;
}

.custom-field :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}

.custom-field :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
  color: #1976d2;
}

.save-btn :deep(.v-btn__loader) {
  color: white;
}

.save-btn :deep(.v-progress-circular) {
  margin: 0;
}

.switch-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 4px;
}

.custom-switch {
  margin-top: 4px;
}

.switch-label {
  font-weight: 500;
  color: #424242;
  margin-left: 8px;
}

.attachment-wrapper {
  margin-top: 8px;
}

.attachment-field {
  margin-top: 4px;
}

.cancel-btn {
  border-color: #f44336 !important;
  background-color: #f44336 !important;
  color: #fff !important;
}

.save-btn {
  background: #1a1b5e !important;
  color: rgb(236, 236, 236) !important;
  font-weight: 500;
}

:deep(.v-navigation-drawer__content) {
  flex: 0 1 auto;
  height: 80vh;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.add-form-container .v-col {
  padding: 0 !important;
}

:deep(.v-navigation-drawer__scrim) {
  background: rgba(0, 0, 0, 0.5) !important;
  opacity: 1;
}

@media (max-width: 960px) {
  .form-content {
    padding: 16px;
  }

  .form-fields {
    padding: 16px 12px;
  }

  .cancel-btn,
  .save-btn {
    min-width: 80px;
    font-size: 0.85rem;
  }
}

@media (max-width: 600px) {
  .form-fields {
    padding: 12px 8px;
  }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

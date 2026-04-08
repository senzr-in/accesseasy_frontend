<template>
  <div class="wo-single-page-root" :class="`status-${statusClass}`">
    <!-- Header with Status Badge and Download Button -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">{{ taskDetails?.title || "Work Order" }}</h1>
          <v-chip
            v-if="taskDetails?.status"
            :color="statusColor(taskDetails.status)"
            class="status-badge"
            size="large"
            label
          >
            <v-icon size="18" class="mr-1">{{
              statusIcon(taskDetails.status)
            }}</v-icon>
            {{ statusLabel(taskDetails.status) }}
          </v-chip>
        </div>
        <v-btn
          class="pdf-btn"
          @click="downloadPDF"
          :loading="pdfLoading"
          :disabled="!taskDetails"
          variant="flat"
          icon
        >
          <v-icon size="20">mdi-download</v-icon>
        </v-btn>
      </div>
      <v-divider class="mt-3" />
    </div>

    <!-- Loading/Error States -->
    <v-alert
      v-if="pdfError"
      type="error"
      variant="tonal"
      class="ma-3"
      closable
      @click:close="pdfError = null"
    >
      {{ pdfError }}
    </v-alert>

    <v-alert
      v-if="pdfSuccess"
      type="success"
      variant="tonal"
      class="ma-3"
      closable
      @click:close="pdfSuccess = null"
    >
      {{ pdfSuccess }}
    </v-alert>

    <!-- Main Content - All Sections on One Page -->
    <div class="page-content">
      <v-skeleton-loader v-if="loading" type="list-item-three-line" />
      <div v-else class="content-sections">
        <!-- Work Order Details Section -->
        <v-div class="section-card" elevation="2" rounded="lg">
          <v-card-title class="section-title">
            Work Order Details
          </v-card-title>
          <v-card-text>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Job Type</div>
                <div class="detail-value">
                  {{ taskDetails?.taskType || "No Data" }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Job Title</div>
                <div class="detail-value">
                  {{ taskDetails?.title || "No Data" }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Start Date</div>
                <div class="detail-value">
                  {{ fmtDateTime(taskDetails?.from) }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Due Date</div>
                <div class="detail-value">
                  {{ fmtDateTime(taskDetails?.dueTime) }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Priority</div>
                <v-chip
                  v-if="taskDetails?.task_priority"
                  :color="priorityColor(taskDetails.task_priority)"
                  size="small"
                  label
                >
                  {{ cap(taskDetails?.task_priority) || "No Data" }}
                </v-chip>
                <div v-else class="detail-value">—</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Location</div>
                <div class="detail-value">
                  {{ taskDetails?.locationName || "No Data" }}
                  <span
                    v-if="taskDetails?.address"
                    class="text-xs text-gray-500"
                  >
                    ({{ taskDetails.address }})
                  </span>
                </div>
              </div>
            </div>

            <!-- Task Image -->
            <div v-if="taskImageUrl" class="mt-4">
              <div class="detail-label mb-2">Task Image</div>
              <v-img
                :src="taskImageUrl"
                alt="Task image"
                class="rounded-lg"
                height="200"
                cover
              />
            </div>

            <!-- Organization Location Map -->
            <div v-if="location" class="mt-4">
              <div class="detail-label mb-2">Organization Location</div>
              <div
                ref="mapContainer"
                class="gps-map-container"
                style="height: 250px"
              ></div>
              <div class="text-xs text-gray-600 mt-2">
                Lat: {{ location.lat }}, Lng: {{ location.lng }} | Radius:
                {{ radius }} meters
              </div>
            </div>
          </v-card-text>
        </v-div>

        <!-- Client Details Section -->
        <v-div class="section-card" elevation="2" rounded="lg">
          <v-card-title class="section-title"> Client Details </v-card-title>
          <v-card-text>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Client Name</div>
                <div class="detail-value">
                  {{ taskDetails?.orgName || "No Data" }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Work Location</div>
                <div class="detail-value">
                  {{ taskDetails?.locationName || "No Data" }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Supervisor</div>
                <div class="detail-value">
                  {{
                    taskDetails?.orgLocation?.contactDetails?.contactPerson ||
                    "No Data"
                  }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Contact Number</div>
                <div class="detail-value">
                  {{
                    taskDetails?.orgLocation?.contactDetails?.contactNumber ||
                    "No Data"
                  }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">
                  {{
                    taskDetails?.orgLocation?.contactDetails?.Email || "No Data"
                  }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Service Range</div>
                <div class="detail-value">
                  {{
                    taskDetails?.locSize ? `${taskDetails.locSize}` : "No Data"
                  }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-div>

        <!-- Assigned Employee Section -->
        <v-div class="section-card" elevation="2" rounded="lg">
          <v-card-title class="section-title"> Assigned Employee </v-card-title>
          <v-card-text>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Employee Name</div>
                <div class="detail-value">
                  {{
                    taskDetails?.employeeId?.assignedUser?.first_name &&
                    taskDetails?.employeeId?.employeeId
                      ? `${taskDetails.employeeId.assignedUser.first_name} - ${taskDetails.employeeId.employeeId}`
                      : taskDetails?.employeeId?.employeeId || "Not assigned"
                  }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Employee ID</div>
                <div class="detail-value">
                  {{ taskDetails?.employeeId?.employeeId || "No Data" }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-div>

        <!-- Jobsheets Section -->
        <v-div class="section-card" elevation="2" rounded="lg">
          <v-card-title class="section-title">
            Assigned Jobsheets
            <v-btn
              class="ml-auto"
              :text="allExpanded ? 'Collapse All' : 'Show All'"
              :icon="allExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              variant="flat"
              :color="statusColor(taskDetails?.status)"
              @click="toggleAllJobs"
            ></v-btn>
          </v-card-title>
          <v-card-text>
            <v-alert
              v-if="!jobsWithData.length"
              type="info"
              variant="tonal"
              class="mb-3"
            >
              No jobsheet data available.
            </v-alert>

            <div v-else class="jobsheets-container">
              <v-div
                v-for="job in jobsWithData"
                :key="job.job_id"
                class="jobsheet-item"
                elevation="1"
                rounded="lg"
              >
                <v-card-title
                  class="jobsheet-title"
                  @click="toggleJob(job.job_id)"
                >
                  <v-btn
                    class="expand-btn mr-2"
                    :icon="
                      expandedJobs[job.job_id]
                        ? 'mdi-chevron-up'
                        : 'mdi-chevron-down'
                    "
                    size="small"
                    variant="text"
                  ></v-btn>
                  {{ job.job_name }}
                  <v-chip
                    class="ml-auto"
                    :color="
                      job.taskRef?.status
                        ? taskStatusColor(job.taskRef.status)
                        : 'amber'
                    "
                    size="small"
                    label
                  >
                    {{
                      job.taskRef?.status ? cap(job.taskRef.status) : "Pending"
                    }}
                  </v-chip>
                </v-card-title>

                <v-expand-transition>
                  <v-card-text v-if="expandedJobs[job.job_id]">
                    <div
                      v-if="job.taskRef?.workHours"
                      class="mb-3 d-flex gap-3 flex-wrap"
                    >
                      <v-chip
                        size="small"
                        label
                        color="grey-lighten-3"
                        variant="flat"
                      >
                        <v-icon size="16" class="mr-1">mdi-play-circle</v-icon>
                        {{ fmtDateTime(job.taskRef.workHours.start_time) }}
                      </v-chip>
                      <v-chip
                        size="small"
                        label
                        color="grey-lighten-3"
                        variant="flat"
                      >
                        <v-icon size="16" class="mr-1">mdi-stop-circle</v-icon>
                        {{ fmtDateTime(job.taskRef.workHours.end_time) }}
                      </v-chip>
                      <v-chip
                        size="small"
                        label
                        color="grey-lighten-3"
                        variant="flat"
                      >
                        <v-icon size="16" class="mr-1"
                          >mdi-timer-outline</v-icon
                        >
                        {{ job.taskRef.workHours.total_hours }} hrs
                      </v-chip>
                    </div>

                    <div class="field-grid">
                      <template
                        v-for="field in job.fields.filter(isCompletionField)"
                        :key="`${job.job_id}-${field.key}`"
                      >
                        <div class="field-item">
                          <div class="field-label">
                            {{ field.label }}
                          </div>

                          <div v-if="isImage(field)" class="mt-2">
                            <div class="d-flex gap-2 flex-wrap">
                              <template
                                v-for="img in imagesFor(job, field)"
                                :key="img.key"
                              >
                                <v-skeleton-loader
                                  v-if="!img.url && img.loading"
                                  type="image"
                                  class="rounded-lg"
                                  width="100"
                                  height="80"
                                />
                                <v-img
                                  v-else-if="img.url"
                                  :src="img.url"
                                  :alt="`${field.label} image`"
                                  width="100"
                                  class="rounded-lg ring-1"
                                  cover
                                />
                              </template>
                              <span
                                v-if="!imagesFor(job, field).length"
                                class="text-medium-emphasis"
                                >—</span
                              >
                            </div>
                          </div>

                          <div v-else-if="isGPS(field)" class="mt-2">
                            <div
                              v-if="valueFor(job, field)"
                              :ref="
                                (el) =>
                                  setGpsMapContainer(job.job_id, field.key, el)
                              "
                              class="gps-map-container"
                              style="height: 150px"
                            ></div>
                            <span v-else class="text-medium-emphasis">—</span>
                          </div>

                          <div v-else-if="isBoolean(field)" class="mt-2">
                            <v-chip
                              size="small"
                              :color="valueFor(job, field) ? 'green' : 'grey'"
                              label
                              variant="flat"
                            >
                              {{ valueFor(job, field) ? "Yes" : "No" }}
                            </v-chip>
                          </div>

                          <div v-else class="mt-2 text-medium-emphasis">
                            {{ displayValue(valueFor(job, field)) }}
                          </div>
                        </div>
                      </template>
                    </div>
                  </v-card-text>
                </v-expand-transition>
              </v-div>
            </div>
          </v-card-text>
        </v-div>

        <!-- Notes Section -->
        <v-div class="section-card" elevation="2" rounded="lg">
          <v-card-title class="section-title">
            Notes & Additional Information
          </v-card-title>
          <v-card-text>
            <v-alert
              v-if="
                !taskDetails?.complete_Task_Note &&
                !sharedBooleans.rating &&
                !sharedBooleans.signature &&
                !clientImageUrl &&
                !taskDetails?.assignedTo
              "
              type="info"
              variant="tonal"
              class="mb-3"
            >
              No notes, rating, signature, or client photo available.
            </v-alert>

            <div class="notes-container">
              <v-card
                v-if="taskDetails?.complete_Task_Note"
                class="note-item"
                variant="flat"
                color="white"
                rounded="lg"
                elevation="1"
              >
                <v-card-title class="note-title">
                  Completion Notes
                </v-card-title>
                <v-card-text class="pt-0">
                  <div class="text-body-2 text-black">
                    {{ taskDetails?.complete_Task_Note }}
                  </div>
                </v-card-text>
              </v-card>

              <v-card
                v-if="sharedBooleans.rating"
                class="note-item"
                variant="flat"
                color="white"
                rounded="lg"
                elevation="1"
              >
                <v-card-title class="note-title"> Rating </v-card-title>
                <v-card-text class="pt-0">
                  <div class="d-flex align-center">
                    <template v-for="n in 5" :key="n">
                      <v-icon
                        :color="
                          n <= (ratingsValue || 0) ? 'yellow' : 'grey-lighten-1'
                        "
                        size="24"
                        class="mr-1"
                      >
                        {{
                          n <= (ratingsValue || 0)
                            ? "mdi-star"
                            : "mdi-star-outline"
                        }}
                      </v-icon>
                    </template>
                    <span class="ml-2 text-black">
                      {{ ratingsValue ? `${ratingsValue} / 5` : "No rating" }}
                    </span>
                  </div>
                </v-card-text>
              </v-card>

              <v-card
                v-if="sharedBooleans.signature"
                class="note-item"
                variant="flat"
                color="white"
                rounded="lg"
                elevation="1"
              >
                <v-card-title class="note-title"> Signature </v-card-title>
                <v-card-text class="pt-0">
                  <div v-if="signatureUrl">
                    <v-img
                      :src="signatureUrl"
                      alt="Signature"
                      height="120"
                      class="rounded-lg"
                      contain
                    />
                  </div>
                  <div v-else class="text-black">No signature available.</div>
                </v-card-text>
              </v-card>

              <v-card
                class="note-item"
                variant="flat"
                color="white"
                rounded="lg"
                elevation="1"
              >
                <v-card-title class="note-title"> Client Photo </v-card-title>
                <v-card-text class="pt-0">
                  <div v-if="clientImageUrl">
                    <v-img
                      :src="clientImageUrl"
                      alt="Client Photo"
                      height="120"
                      class="rounded-lg"
                      contain
                    />
                  </div>
                  <div v-else class="text-black">
                    No client image available.
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTaskCompletionApi } from "@/composables/workorder/completeWorkOrderForm/useTaskCompletionApi";
import { usePdfGenerator } from "@/composables/workorder/completeWorkOrderForm/usePdfGenerator";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  taskId: { type: [String, Number], required: true },
  assignFormId: { type: [String, Number], required: false },
  initialTemplateJson: { type: Object, default: null },
  initialDynamicFieldsJson: { type: Object, default: null },
  ratings: { type: Number, default: null },
  signatureFileId: { type: String, default: null },
});

const emit = defineEmits(["update:modelValue", "complete", "saveDraft"]);

const loading = ref(false);
const taskDetails = ref(null);
const templateJson = ref(null);
const dynamicFieldsObj = ref(null);
const taskImageUrl = ref(null);
const signatureUrl = ref(null);
const clientImageUrl = ref(null);
const fileUrlCache = new Map();
const mapContainer = ref(null);
const gpsMapContainerMap = ref(new Map());
const expandedJobs = ref({});

// PDF related state
const pdfLoading = ref(false);
const pdfError = ref(null);
const pdfSuccess = ref(null);
const tenantData = ref({});

// API composables
const {
  fetchTaskDetails,
  fetchWorkOrderDetails,
  fetchTaskImageBlob,
  fetchOrganizationDetails,
  fetchLocationManagementData,
} = useTaskCompletionApi();

const { generateTaskPDF } = usePdfGenerator();

const statusClass = computed(() => {
  const status = String(taskDetails.value?.status || "").toLowerCase();
  if (status === "completed") return "completed";
  if (status === "overdue") return "overdue";
  if (status === "inProgress") return "inProgress";
  if (status === "pending") return "pending";
  if (status === "cancelled") return "cancelled";
  return "default";
});

// Utility functions
const cap = (s) =>
  s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : "";
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "No Data");
const statusLabel = (s) => cap(s);

const statusColor = (s) => {
  const m = String(s || "").toLowerCase();
  if (m === "completed") return "green";
  if (m === "overdue") return "red";
  if (m === "inProgress" || m === "inProgress") return "orange";
  if (m === "pending" || m === "pending") return "orange";
  return "grey";
};

const statusIcon = (s) => {
  const m = String(s || "").toLowerCase();
  if (m === "completed") return "mdi-check-circle";
  if (m === "overdue") return "mdi-alert-circle";
  if (m === "inProgress") return "mdi-progress-clock";
  if (m === "pending") return "mdi-clock-outline";
  return "mdi-information";
};

const taskStatusColor = statusColor;

const sharedBooleans = computed(() => {
  return (
    templateJson.value?.shared_properties?.booleans || {
      signature: false,
      rating: false,
    }
  );
});

const ratingsValue = computed(() => {
  if (props.ratings != null) return props.ratings;
  const rootRating =
    taskDetails.value?.ratings ?? taskDetails.value?.rating ?? null;
  if (rootRating != null) return Number(rootRating);
  const dfRating =
    dynamicFieldsObj.value?.ratings ?? dynamicFieldsObj.value?.rating ?? null;
  return dfRating != null ? Number(dfRating) : null;
});

const signatureFileId = computed(() => {
  if (props.signatureFileId) return props.signatureFileId;
  return (
    taskDetails.value?.signature || dynamicFieldsObj.value?.signature || null
  );
});

const clientImageId = computed(() => {
  return (
    taskDetails.value?.verified_client_photo ||
    dynamicFieldsObj.value?.verified_client_photo ||
    null
  );
});

const dfTasks = computed(() => dynamicFieldsObj.value?.tasks || []);

// const jobsWithData = computed(() => {
//   const jobs = templateJson.value?.jobSheet || [];
//   if (!jobs.length) return [];
//   const byId = Object.fromEntries(dfTasks.value.map((t) => [t.taskId, t]));
//   return jobs.map((job) => ({
//     ...job,
//     taskRef: byId[job.job_id] || null,
//   }));
// });

const jobsWithData = computed(() => {
  const jobs = templateJson.value?.jobSheet || [];
  if (!jobs.length) return [];
  const byId = Object.fromEntries(
    dfTasks.value
      .filter((t) => t.isVisible === true) // Only include tasks with isVisible: true
      .map((t) => [t.taskId, t]),
  );
  return jobs
    .map((job) => ({
      ...job,
      taskRef: byId[job.job_id] || null,
    }))
    .filter((job) => job.taskRef !== null); // Only include jobs with a matching task
});
const allExpanded = computed(() => {
  return jobsWithData.value.every((job) => expandedJobs.value[job.job_id]);
});

const location = computed(() => {
  let loc = taskDetails.value?.orgLocation;
  if (typeof loc === "string") {
    try {
      loc = JSON.parse(loc);
    } catch {
      return null;
    }
  }
  return loc?.lat && loc?.lng ? { lat: loc.lat, lng: loc.lng } : null;
});

const radius = computed(() => taskDetails.value?.radiusInMeters || 100);

const isCompletionField = (field) => {
  const ft = String(field.field_type || "").toLowerCase();
  return (
    ft === "completion" || ft === "creation/completion" || ft === "creation"
  );
};
const isImage = (field) => String(normalizeType(field.type)) === "image";
const isGPS = (field) => {
  const t = String(normalizeType(field.type));
  return t === "gps" || t === "gps-currentlocation";
};
const isBoolean = (field) => String(normalizeType(field.type)) === "boolean";
const normalizeType = (t) => {
  if (!t) return "text";
  if (typeof t === "object" && t.date) return "date";
  return String(t).toLowerCase();
};

const iconFor = (t) => {
  const k = String(normalizeType(t));
  const map = {
    text: "mdi-form-textbox",
    number: "mdi-numeric",
    bigtext: "mdi-text-long",
    dropdown: "mdi-menu-down",
    boolean: "mdi-checkbox-marked",
    image: "mdi-camera",
    gps: "mdi-map-marker",
    "gps-currentlocation": "mdi-crosshairs-gps",
    date: "mdi-calendar",
    "happy-code": "mdi-emoticon-happy",
    otp: "mdi-key-variant",
    clientselector: "mdi-account-group",
    orgid: "mdi-domain",
  };
  return map[k] || "mdi-form-textbox";
};

const priorityColor = (priority) => {
  const p = String(priority || "").toLowerCase();
  if (p === "high") return "red";
  if (p === "medium") return "amber";
  if (p === "low") return "green";
  return "grey";
};

const valueFor = (job, field) => {
  const task = job.taskRef;
  if (!task) return null;
  const key = field.key;
  const v = task.fields?.[key];
  return v === undefined ? null : v;
};

const displayValue = (v) => {
  if (v == null || v === "") return "No Data";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

const imagesFor = (job, field) => {
  const val = valueFor(job, field);
  if (!val) return [];
  const arr = Array.isArray(val) ? val : [val];
  const normalized = arr
    .map((x) => {
      const isId = typeof x === "string" && /^[0-9a-f-]{10,}$/i.test(x);
      return { id: isId ? x : null, raw: x };
    })
    .filter((x) => x.id || typeof x.raw === "string");

  return normalized.map((item) => {
    const cacheKey = item.id || item.raw;
    const url = fileUrlCache.get(cacheKey);
    return {
      key: cacheKey,
      url: url || (typeof item.raw === "string" && !item.id ? item.raw : null),
      loading: !url && !!item.id,
    };
  });
};

const ensureFileUrl = async (id) => {
  if (!id || fileUrlCache.has(id)) return;
  const { success, data } = await fetchTaskImageBlob(id);
  if (success && data?.url) {
    fileUrlCache.set(id, data.url);
  }
};

const resolveJobImages = async () => {
  const jobs = jobsWithData.value;
  for (const job of jobs) {
    for (const field of (job.fields || []).filter(isCompletionField)) {
      if (!isImage(field)) continue;
      const val = valueFor(job, field);
      const arr = Array.isArray(val) ? val : val ? [val] : [];
      for (const x of arr) {
        const isId = typeof x === "string" && /^[0-9a-f-]{10,}$/i.test(x);
        if (isId) await ensureFileUrl(x);
      }
    }
  }
};

const setGpsMapContainer = (jobId, fieldKey, el) => {
  if (el) {
    const key = `${jobId}-${fieldKey}`;
    gpsMapContainerMap.value.set(key, el);
  }
};

const toggleJob = (jobId) => {
  expandedJobs.value = {
    ...expandedJobs.value,
    [jobId]: !expandedJobs.value[jobId],
  };
};

const toggleAllJobs = () => {
  const newState = !allExpanded.value;
  const updatedJobs = {};
  jobsWithData.value.forEach((job) => {
    updatedJobs[job.job_id] = newState;
  });
  expandedJobs.value = updatedJobs;
};

const initMaps = () => {
  if (location.value && mapContainer.value) {
    const map = L.map(mapContainer.value).setView(
      [location.value.lat, location.value.lng],
      15,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    L.circle([location.value.lat, location.value.lng], {
      color: "blue",
      fillColor: "#30f",
      fillOpacity: 0.5,
      radius: radius.value,
    }).addTo(map);
  }

  jobsWithData.value.forEach((job) => {
    job.fields
      .filter(isCompletionField)
      .filter(isGPS)
      .forEach((field) => {
        const gpsValue = valueFor(job, field);
        if (gpsValue?.lat && gpsValue?.lng && expandedJobs.value[job.job_id]) {
          const key = `${job.job_id}-${field.key}`;
          const container = gpsMapContainerMap.value.get(key);
          if (container) {
            const gpsMap = L.map(container).setView(
              [gpsValue.lat, gpsValue.lng],
              15,
            );
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "&copy; OpenStreetMap contributors",
            }).addTo(gpsMap);
            L.circle([gpsValue.lat, gpsValue.lng], {
              color: "blue",
              fillColor: "#30f",
              fillOpacity: 0.5,
              radius: taskDetails.value?.radiusInMeters || 100,
            }).addTo(gpsMap);
          }
        }
      });
  });
};

const fetchTenantData = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();
    if (!tenantId) return;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields[]=tenantName&fields[]=companyAddress&fields[]=logo`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (response.ok) {
      const data = await response.json();
      if (data.data?.[0]) {
        tenantData.value = {
          companyName: data.data[0].tenantName || "Company Name",
          companyAddress: data.data[0].companyAddress || "",
          contact: data.data[0].contactNumber || data.data[0].email || "",
          logoId: data.data[0].logo || null,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching tenant data:", error);
  }
};

const downloadPDF = async () => {
  if (!taskDetails.value) {
    pdfError.value = "Task details not loaded yet";
    return;
  }

  pdfLoading.value = true;
  pdfError.value = null;
  pdfSuccess.value = null;

  try {
    const pdfData = {
      tenantData: tenantData.value,
      logoId: tenantData.value.logoId,
      overview: {
        taskId: props.taskId,
        taskType: taskDetails.value.taskType || "N/A",
        title: taskDetails.value.title || "N/A",
        assignedTo: taskDetails.value.employeeId?.assignedUser?.first_name
          ? `${taskDetails.value.employeeId.assignedUser.first_name} - ${taskDetails.value.employeeId.employeeId}`
          : taskDetails.value.employeeId?.employeeId || "N/A",
        employeeIdDisplay: taskDetails.value.employeeId?.employeeId || "N/A",
        orgName: taskDetails.value.orgName || "N/A",
        startDate: fmtDateTime(taskDetails.value.from),
        dueDate: fmtDateTime(taskDetails.value.dueTime),
        priority: cap(taskDetails.value.task_priority) || "N/A",
        status: cap(taskDetails.value.status) || "N/A",
      },
      location: {
        locationName: taskDetails.value.locationName || "N/A",
        address: taskDetails.value.address || "N/A",
        locSize: taskDetails.value.locSize || "N/A",
        supervisor:
          taskDetails.value.orgLocation?.contactDetails?.contactPerson || "N/A",
        contactNumber:
          taskDetails.value.orgLocation?.contactDetails?.contactNumber || "N/A",
        email: taskDetails.value.orgLocation?.contactDetails?.Email || "N/A",
      },
      jobsWithData: jobsWithData.value,
      notesData: {
        notes: taskDetails.value.complete_Task_Note || null,
        rating: ratingsValue.value,
        signature: signatureFileId.value,
        clientImage: clientImageId.value,
      },
    };

    const result = await generateTaskPDF(pdfData);

    if (result.success) {
      pdfSuccess.value = "PDF downloaded successfully!";
      setTimeout(() => {
        pdfSuccess.value = null;
      }, 3000);
    } else {
      pdfError.value = result.error || "Failed to generate PDF";
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    pdfError.value = "An error occurred while generating the PDF";
  } finally {
    pdfLoading.value = false;
  }
};

const init = async () => {
  if (!props.taskId) {
    console.error("Task ID is required but not provided.");
    return;
  }
  loading.value = true;
  try {
    await fetchTenantData();

    const tRes = await fetchTaskDetails(props.taskId);
    if (tRes?.success) {
      taskDetails.value = tRes.data;

      if (taskDetails.value?.orgId) {
        const orgRes = await fetchOrganizationDetails(taskDetails.value.orgId);
        if (orgRes?.success) {
          taskDetails.value.orgName = orgRes.data.orgName;
        } else {
          console.warn("Failed to fetch organization details:", orgRes.error);
        }

        const locRes = await fetchLocationManagementData(
          taskDetails.value.orgId,
        );
        if (locRes?.success && locRes.data?.length > 0) {
          const location = locRes.data[0];
          taskDetails.value = {
            ...taskDetails.value,
            locationName: location.locdetail?.locationName,
            address: location.locdetail?.address,
            pincodes: location.locdetail?.pincode
              ? [location.locdetail.pincode]
              : [],
            locSize: location.locSize,
            locmark: location.locmark,
          };
        } else {
          console.warn(
            "Failed to fetch location management data:",
            locRes?.error || "No locations found",
          );
        }
      }

      if (props.initialTemplateJson) {
        templateJson.value = props.initialTemplateJson;
      } else if (props.assignFormId) {
        const wRes = await fetchWorkOrderDetails(props.assignFormId);
        if (wRes?.success) {
          const raw =
            wRes.data?.custom_FormTemplate ||
            wRes.data?.custom_FormTemplate?.json;
          templateJson.value =
            typeof raw === "string" ? JSON.parse(raw) : raw || null;
        }
      }

      if (props.initialDynamicFieldsJson) {
        dynamicFieldsObj.value = props.initialDynamicFieldsJson;
      } else {
        const df = tRes?.data?.dynamicFields;
        dynamicFieldsObj.value =
          typeof df === "string" ? JSON.parse(df) : df || null;
      }

      const taskImageId = Array.isArray(tRes.data?.taskimage)
        ? tRes.data.taskimage[0]
        : tRes.data?.taskimage;
      if (taskImageId) {
        const isId = /^[0-9a-f-]{10,}$/i.test(taskImageId);
        if (isId) {
          const imgRes = await fetchTaskImageBlob(taskImageId);
          if (imgRes?.success) taskImageUrl.value = imgRes.data.url;
        } else {
          taskImageUrl.value = taskImageId;
        }
      }

      if (signatureFileId.value) {
        const sRes = await fetchTaskImageBlob(signatureFileId.value);
        if (sRes?.success) signatureUrl.value = sRes.data.url;
      }

      if (clientImageId.value) {
        const cRes = await fetchTaskImageBlob(clientImageId.value);
        if (cRes?.success) clientImageUrl.value = cRes.data.url;
      }

      await resolveJobImages();
      initMaps();
    }
  } catch (e) {
    console.warn("[WorkOrderReadOnlyTabs] init failed", e);
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.taskId, props.assignFormId],
  () => init(),
  { immediate: true },
);

watch(
  [taskDetails, jobsWithData],
  () => {
    if (taskDetails.value && jobsWithData.value) {
      initMaps();
    }
  },
  { deep: true },
);

watch(
  expandedJobs,
  () => {
    setTimeout(() => {
      initMaps();
    }, 300);
  },
  { deep: true },
);
</script>

<style scoped>
/* Complete redesign for single-page layout with status-based styling */
.wo-single-page-root {
  display: flex;
  flex-direction: column;
  min-height: 100dvh; /* Dynamic viewport height (fixes mobile address bar) */
  overflow: hidden; /* Prevent double scrollbars */
  background: #f5f5f5;
  transition: background-color 0.3s ease;
}

/* Status-based background colors */
.wo-single-page-root.status-completed {
  --status-color: #10b981;
  --status-light: #d1fae5;
  --status-border: #6ee7b7;
}

.wo-single-page-root.status-overdue {
  --status-color: #861313;
  --status-light: #fee2e2;
  --status-border: #b67575;
}

.wo-single-page-root.status-inProgress {
  --status-color: #6366f1;
  --status-light: #e0e7ff;
  --status-border: #a5b4fc;
}

.wo-single-page-root.status-pending {
  --status-color: #f59e0b;
  --status-light: #fef3c7;
  --status-border: #fcd34d;
}

.wo-single-page-root.status-cancelled {
  --status-color: #ef4444;
  --status-light: #fee2e2;
  --status-border: #fca5a5;
}

.wo-single-page-root.status-default {
  --status-color: #6b7280;
  --status-light: #f3f4f6;
  --status-border: #d1d5db;
}

.page-header {
  flex-shrink: 0; /* Prevent header from shrinking */
  background: white;
  border-bottom: 3px solid var(--status-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
}

.section-card {
  border: 2px solid #c5c5c5;
  border-radius: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.status-badge {
  background: var(--status-color) !important;
  color: white !important;
  font-weight: 600;
}

.pdf-btn {
  background: linear-gradient(
    135deg,
    var(--status-color) 0%,
    var(--status-color) 100%
  ) !important;
  color: white !important;
  height: 44px;
  width: 44px;
  min-width: 44px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.pdf-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.page-content {
  flex: 1 1 auto;
  padding: 14px;
  background-color: white;
  -webkit-overflow-scrolling: touch;
}

.content-sections {
  height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  overflow-y: auto;
  scrollbar-color: #cbd5e1 #f1f5f9;
  scrollbar-width: thin;
}

.section-title {
  font-size: large;
  font-weight: 700;
  color: #059669;
  display: flex;
  align-items: center;
  padding: 16px !important;
  border-bottom: 1px solid #e5e7eb;
}

.section-title .v-icon {
  color: var(--status-color);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
  transition: all 0.2s ease;
  text-transform: capitalize;
}

.detail-label {
  font-size: medium;
  font-weight: 600;
  color: #969696;
  text-transform: capitalize;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  font-weight: 500;
}

.detail-label::after {
  content: ":";
  margin-right: 4px;
}

.detail-value {
  font-size: medium;
  font-weight: 500;
  color: #000000;
  text-transform: capitalize;
  flex: 1;
  font-weight: 500;
}

.detail-value .v-chip {
  margin-top: 0;
}

.work-hours-chips .v-chip {
  background: var(--status-light) !important;
  color: var(--status-color) !important;
  font-weight: 500;
  font-size: medium;
  border: 1px solid var(--status-border);
}

.jobsheets-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.text-medium-emphasis {
  color: rgb(0 0 0) !important;
}

.jobsheet-title {
  font-size: medium;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  padding: 12px !important;
  background: #f9fafb;
  cursor: pointer;
}

.jobsheet-title:hover {
  background: #e5e7eb;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.field-item {
  font-size: medium;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.field-label {
  font-size: medium;
  font-weight: 600;
  color: #6b7280;
  display: flex;
  align-items: center;
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

.notes-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-title {
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  padding: 12px !important;
  background: #f9fafb;
}

.gps-map-container {
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--status-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: height 0.3s ease;
}

.text-black {
  color: #1f2937;
}

.text-xs {
  font-size: 12px;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.ring-1 {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08) inset;
}

.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.mt-2 {
  margin-top: 8px;
}
.mt-3 {
  margin-top: 12px;
}
.mt-4 {
  margin-top: 16px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mb-3 {
  margin-bottom: 12px;
}
.mr-1 {
  margin-right: 4px;
}
.mr-2 {
  margin-right: 8px;
}
.ml-auto {
  margin-left: auto;
}

.expand-btn {
  transition: transform 0.2s ease;
}

.expand-btn:hover {
  transform: scale(1.1);
}

.jobsheet-item {
  transition: all 0.3s ease;
  cursor: pointer;
}

.jobsheet-item:hover {
  background: #f9fafb;
}

.jobsheet-item .v-card-text {
  padding-top: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    padding: 12px;
  }

  .page-title {
    font-size: 22px;
  }

  .page-content {
    padding: 12px;
  }

  .details-grid,
  .field-grid {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-wrap: wrap;
  }

  .detail-label {
    min-width: 120px;
  }
}
</style>

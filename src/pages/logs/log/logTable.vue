<template>
  <div class="logs-container">
    <!-- Filter Panel -->
    <div class="filter-panel" v-if="showFilters && tenantId">
      <div class="filter-content">
        <FilterComponent
          :tenantId="tenantId"
          :initialFilters="initialFilters"
          :initiallyVisible="true"
          :filter-schema="pageFilters"
          @apply-filters="handleApplyFilters"
          @filter-visibility-changed="onFilterVisibilityChanged"
        />
      </div>
    </div>

    <!-- Filter Toggle Button -->

    <!-- Main Content -->
    <div class="main-content" :class="{ 'full-width': !showFilters }">
      <data-table-wrapper
        v-model:searchQuery="search"
        :search-placeholder="'Search Logs...'"
        :show-search="true"
        :has-error="showError"
        wrapper-class="logs-table-wrapper"
      >
        <template #before-search>
          <button
            v-if="tenantId"
            class="filter-toggle-static"
            @click="toggleFilters"
            :class="{ active: hasActiveFilters }"
            :title="showFilters ? 'Hide filters' : 'Show filters'"
            aria-label="Toggle filters"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
            </svg>
            <div v-if="hasActiveFilters" class="filter-indicator"></div>
          </button>
        </template>
        <!-- Toolbar Actions Slot -->
        <template #toolbar-actions>
          <div class="d-flex align-center" style="gap: 8px">
            <BaseButton
              v-if="userRole === 'Admin'"
              variant="primary"
              size="md"
              text="Import Logs"
              :leftIcon="Upload"
              @click="openImportDialog"
            />
            <!-- <BaseButton
              v-if="userRole === 'Admin'"
              variant="danger"
              text="Delete"
              :leftIcon="Trash"
              @click="handleDelete"
            /> -->

            <!-- Export Dropdown -->
            <!-- <Dropdown
              v-if="!['Manager', 'Employee'].includes(userRole?.trim())"
              text="Export"
              variant="primary"
              :leftIcon="Download"
              :items="exportOptions"
              placement="bottom-right"
              @itemClick="handleExportOption"
            /> -->
            <v-chip-group
              v-model="selectedStatus"
              class="mt-2 mt-sm-0"
              mandatory
            >
              <v-chip
                v-for="status in statuses"
                :key="status.value"
                :value="status.value"
                filter
                :color="status.color"
                label
                class="ma-1"
              >
                {{ status.text }} ({{ getStatusCount(status.value) }})
              </v-chip>
            </v-chip-group>
          </div>
        </template>

        <!-- Loading State -->
        <template v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="itemsPerPage || 10"
            :columns="columns.length"
          />
        </template>

        <!-- Error State -->
        <template v-else-if="showError">
          <ErrorState
            title="Unable to load logs"
            :message="errorMessage"
            @retry="fetchLogs"
          />
        </template>

        <!-- Empty State -->
        <template v-else-if="items.length === 0 && !loading">
          <EmptyState
            title="No logs data found"
            message="Try adjusting your filters or check back later"
            :primary-action="{ text: 'Clear Filters', icon: 'X' }"
            @primaryAction="clearFilters"
          />
        </template>

        <!-- Table Content -->
        <template v-else>
          <DataTable
            :items="items"
            :columns="columns"
            :sort-by="sortBy.key"
            :sort-direction="sortBy.order"
            :row-clickable="false"
            item-key="id"
            @sort="handleSort"
          >
            <!-- Custom Cell for Profile -->
            <template #cell-avatarImage="{ item }">
              <div class="profile-avatar">
                <img
                  v-if="item.avatarImage"
                  :src="item.avatarImage"
                  :alt="item.employeeId?.assignedUser?.first_name"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </template>

            <!-- Custom Cell for Employee ID -->
            <template #cell-employeeId.employeeId="{ item }">
              <span class="employee-code">{{
                item.employeeId?.employeeId || "N/A"
              }}</span>
            </template>

            <!-- Custom Cell for Name -->
            <template #cell-employeeId="{ item }">
              <div class="employee-info">
                <div class="employee-details">
                  <h3 class="employee-name">
                    {{ item.employeeId?.assignedUser?.first_name || "Unknown" }}
                  </h3>
                </div>
              </div>
            </template>

            <!-- Custom Cell for Date -->
            <template #cell-date="{ item }">
              <span>{{ item.date || "-" }}</span>
            </template>

            <!-- Custom Cell for Time -->
            <template #cell-timeStamp="{ item }">
              <span>{{ formatTime24Hour(item.timeStamp) }}</span>
            </template>

            <!-- Custom Cell for Action -->
            <template #cell-action="{ item }">
              <v-chip
                :color="getActionColor(item.action)"
                size="small"
                variant="flat"
                class="font-weight-medium attendance-count"
              >
                <v-icon start size="16">{{
                  getActionIcon(item.action)
                }}</v-icon>
                {{ item.action?.toUpperCase() || "N/A" }}
              </v-chip>
            </template>

            <!-- Custom Cell for Mode -->
            <template #cell-mode="{ item }">
              <v-chip
                :color="getModeColor(item.mode)"
                size="small"
                variant="flat"
                class="font-weight-medium attendance-count"
                :class="getModeClass(item.mode)"
              >
                <v-icon start size="16">{{ getModeIcon(item.mode) }}</v-icon>
                {{ getModeDisplayName(item.mode) || "-" }}
              </v-chip>
            </template>

            <!-- Custom Cell for ValidLogs -->
            <template #cell-ValidLogs="{ item }">
              <v-chip
                :color="getValidLogsColor(item.ValidLogs)"
                size="small"
                variant="flat"
                class="font-weight-medium attendance-count"
              >
                <v-icon start size="16">{{
                  getValidLogsIcon(item.ValidLogs)
                }}</v-icon>
                {{ getValidLogsText(item.ValidLogs) }}
              </v-chip>
            </template>

            <!-- Custom Cell for RFID -->
            <template #cell-rfid="{ item }">
              <span>{{ item.rfid || "-" }}</span>
            </template>

            <!-- Custom Cell for Device ID -->
            <template #cell-sn="{ item }">
              <span>{{ item.sn || "-" }}</span>
            </template>

            <!-- Custom Cell for Message Type -->
            <template #cell-msgType="{ item }">
              <span>{{ item.msgType || "-" }}</span>
            </template>

            <!-- Custom Cell for Door -->
            <template #cell-door.doorName="{ item }">
              <span>{{ item.door?.doorName || "-" }}</span>
            </template>

            <!-- Custom Cell for Door Number -->
            <template #cell-door.doorNumber="{ item }">
              <span>{{ item.door?.doorNumber || "-" }}</span>
            </template>

            <!-- Custom Cell for Base64 Image -->
            <template #cell-base64Data="{ item }">
              <div v-if="item.base64Data" class="image-cell">
                <v-img
                  :src="getImageSrc(item.base64Data)"
                  width="60"
                  height="60"
                  class="thumbnail-image"
                  @click="openImagePopup(item.base64Data, item)"
                  style="
                    cursor: pointer;
                    border-radius: 8px;
                    border: 2px solid #e0e0e0;
                  "
                  cover
                >
                  <template v-slot:error>
                    <div class="error-placeholder">
                      <v-icon size="24">mdi-image-broken</v-icon>
                    </div>
                  </template>
                  <template v-slot:placeholder>
                    <div class="loading-placeholder">
                      <v-progress-circular
                        indeterminate
                        size="20"
                      ></v-progress-circular>
                    </div>
                  </template>
                </v-img>
                <div class="image-overlay">
                  <v-icon size="16" color="white">mdi-magnify</v-icon>
                </div>
              </div>
              <span v-else class="null-value">No Image</span>
            </template>

            <!-- Custom Cell for Face ID -->
            <template #cell-faceId="{ item }">
              <div v-if="item.faceIdImage" class="image-cell">
                <v-img
                  :src="item.faceIdImage"
                  width="60"
                  height="60"
                  class="thumbnail-image"
                  @click="openImagePopup(item.faceIdImage, item, 'faceId')"
                  style="
                    cursor: pointer;
                    border-radius: 8px;
                    border: 2px solid #e0e0e0;
                  "
                  cover
                >
                  <template v-slot:error>
                    <div class="error-placeholder">
                      <v-icon size="24">mdi-image-broken</v-icon>
                    </div>
                  </template>
                  <template v-slot:placeholder>
                    <div class="loading-placeholder">
                      <v-progress-circular
                        indeterminate
                        size="20"
                      ></v-progress-circular>
                    </div>
                  </template>
                </v-img>
                <div class="image-overlay">
                  <v-icon size="16" color="white">mdi-magnify</v-icon>
                </div>
              </div>
              <span v-else class="null-value">{{
                item.faceId || "No Face ID"
              }}</span>
            </template>

            <!-- Custom Cell for Log Connected At Server -->
            <template #cell-date_created="{ item }">
              <span>{{ formatDate(item.date_created) }}</span>
            </template>
          </DataTable>
        </template>

        <!-- Pagination Slot -->
        <template v-slot:pagination>
          <CustomPagination
            v-model:page="page"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </data-table-wrapper>
    </div>
    <v-dialog v-model="showImportDialog" max-width="650">
      <v-card>
        <v-card-title> Upload Excel File </v-card-title>

        <!-- Make only content area scrollable -->
        <v-card-text>
          <!-- Show file input only if not uploaded yet -->

          <v-file-input
            v-model="selectedFile"
            label="Select a file"
            accept=".xls"
            variant="outlined"
          ></v-file-input>
          <div
            v-if="isLoading"
            class="d-flex flex-column align-center justify-center py-10"
          >
            <v-progress-circular
              indeterminate
              color="blue-lighten-2"
              size="50"
            ></v-progress-circular>
            <p class="mt-3 text-blue-200">Processing file... Please wait</p>
          </div>
        </v-card-text>

        <v-card-actions class="border-t border-grey-800">
          <BaseButton
            text="Close"
            variant="secondary"
            size="sm"
            @click="closeImportDialog"
          />
          <BaseButton
            v-if="!uploadResponse"
            text="Upload"
            variant="primary"
            size="sm"
            :disabled="!selectedFile"
            @click="submitFile"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Image Popup Dialog -->
    <v-dialog v-model="imageDialog" max-width="900px" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div>
            <span class="text-h5">{{ imageDialogTitle }}</span>
            <div class="text-caption text-grey mt-1" v-if="selectedLogItem">
              Employee: {{ getEmployeeName(selectedLogItem) }} | Date:
              {{ formatDate(selectedLogItem.date_created) }} | Action:
              {{ selectedLogItem.action }}
            </div>
          </div>
          <v-btn icon variant="text" @click="closeImageDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
          <div class="image-container">
            <v-img
              v-if="selectedImage"
              :src="selectedImage"
              max-height="600"
              contain
              class="full-image"
            >
              <template v-slot:error>
                <div class="error-placeholder-large">
                  <v-icon size="64" color="error">mdi-image-broken</v-icon>
                  <p class="mt-2">Failed to load image</p>
                  <p class="text-caption">The image data may be corrupted</p>
                </div>
              </template>
              <template v-slot:placeholder>
                <div class="loading-placeholder-large">
                  <v-progress-circular
                    indeterminate
                    size="48"
                  ></v-progress-circular>
                  <p class="mt-2">Loading image...</p>
                </div>
              </template>
            </v-img>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            @click="downloadImage"
            v-if="selectedImage"
            prepend-icon="mdi-download"
          >
            Download Image
          </v-btn>
          <v-btn color="grey" variant="text" @click="closeImageDialog">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import Logs Component -->
    <!-- <ImportLogs ref="importLogsRef" @import-completed="handleImportCompleted" /> -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import ImportLogs from "./importLogs.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import Dropdown from "@/components/common/buttons/DropdownButton.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import { Filter, Upload, Download } from "lucide-vue-next";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import debounce from "lodash/debounce";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";

const debouncedFetchLogs = debounce(() => {
  page.value = 1;
  fetchLogs();
}, 300);

const items = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(true);
const showError = ref(false);
const errorMessage = ref("");
const selectedStatus = ref("all");
const statuses = ref([]);

// Image popup state
const imageDialog = ref(false);
const selectedImage = ref(null);
const selectedLogItem = ref(null);
const imageDialogTitle = ref("Log Image");

const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();
const sortBy = ref({ key: "date_created", order: "desc" });

// Filter options
const filters = reactive({
  status: "",
  mode: "",
  dateFrom: "",
});

const initialFilters = computed(() => ({
  status: filters.status,
  mode: filters.mode,
  dateFrom: filters.dateFrom,
}));

const pageFilters = ref([
  { key: "dateFrom", label: "From Date", type: "date", show: true },
  { key: "status", label: "Status", type: "select", show: true },
  { key: "mode", label: "Mode", type: "select", show: true },
]);

const actionOptions = ["in", "out"];
const modeOptions = [
  { value: "face", title: "AI Face" },
  { value: "manual", title: "Manual Entry" },
  { value: "import", title: "Import Entry" },
  { value: "throughApp", title: "Through App" },
  { value: "cronJob", title: "Cron Job" },
  { value: "rfid", title: "Card Entry" },
  { value: "fingerprint", title: "Fingerprint" },
];

const validLogsOptions = [
  { value: "authorized", title: "Authorized" },
  { value: "unAuthorized", title: "UnAuthorized" },
];

const exportOptions = ref([
  { label: "Excel", value: "excel", icon: Download },
  { label: "CSV", value: "csv", icon: Download },
  { label: "PDF", value: "pdf", icon: Download },
]);

const columns = ref([
  { key: "avatarImage", label: "Profile", sortable: false, width: "80px" },
  {
    key: "employeeId.employeeId",
    label: "EmpID",
    sortable: true,
    width: "120px",
  },
  { key: "employeeId", label: "Name", sortable: true, width: "150px" },
  { key: "date", label: "Date", sortable: true, width: "150px" },
  { key: "timeStamp", label: "Time", sortable: true, width: "100px" },
  { key: "action", label: "Action", sortable: true, width: "120px" },
  { key: "mode", label: "Mode", sortable: true, width: "100px" },
  { key: "status", label: "Status", sortable: true, width: "100px" },
  { key: "ValidLogs", label: "ValidLogs", sortable: true, width: "150px" },
  // { key: "rfid", label: "RFID Card", sortable: true, width: "100px" },
  // { key: "sn", label: "Device ID", sortable: true, width: "200px" },
  { key: "msgType", label: "Message Type", sortable: true, width: "200px" },
  // { key: "door.doorName", label: "Door", sortable: true, width: "120px" },
  // {
  //   key: "door.doorNumber",
  //   label: "Door Number",
  //   sortable: true,
  //   width: "120px",
  // },
  // {
  //   key: "base64Data",
  //   label: "AI Device Face Image",
  //   sortable: false,
  //   width: "90px",
  // },
  {
    key: "faceId",
    label: "MobileApp Face ID",
    sortable: false,
    width: "100px",
  },

  {
    key: "date_created",
    label: "Log Connected At Server",
    sortable: true,
    width: "200px",
  },
]);

// Chip styling functions
const getActionColor = (action) => {
  switch (action?.toLowerCase()) {
    case "in":
      return "success";
    case "out":
      return "warning";
    default:
      return "grey";
  }
};

const getActionIcon = (action) => {
  switch (action?.toLowerCase()) {
    case "in":
      return "mdi-login";
    case "out":
      return "mdi-logout";
    default:
      return "mdi-help-circle";
  }
};

const getModeColor = (mode) => {
  switch (mode?.toLowerCase()) {
    case "face":
      return "primary";
    case "manual":
      return "secondary";
    case "import":
      return "info";
    case "throughapp":
      return "purple";
    case "cronjob":
      return "orange";
    case "rfid":
      return "teal";
    case "fingerprint":
      return "pink";
    default:
      return "grey";
  }
};

const getModeIcon = (mode) => {
  switch (mode?.toLowerCase()) {
    case "face":
      return "mdi-face-recognition";
    case "manual":
      return "mdi-hand-back-right";
    case "import":
      return "mdi-import";
    case "throughapp":
      return "mdi-cellphone";
    case "cronjob":
      return "mdi-clock-outline";
    case "rfid":
      return "mdi-card-account-details";
    case "fingerprint":
      return "mdi-fingerprint";
    default:
      return "mdi-help-circle";
  }
};

const getModeDisplayName = (mode) => {
  const modeOption = modeOptions.find((option) => option.value === mode);
  return modeOption ? modeOption.title : mode || "N/A";
};

const getModeClass = (mode) => {
  switch (mode?.toLowerCase()) {
    case "face":
      return "present";
    case "manual":
      return "absent";
    case "import":
      return "weekoff";
    case "throughapp":
      return "holiday";
    case "cronjob":
      return "onduty";
    case "rfid":
      return "wfh";
    case "fingerprint":
      return "halfday";
    default:
      return "total";
  }
};

const getValidLogsColor = (validLogs) => {
  if (validLogs === true || validLogs === "authorized" || validLogs === 1) {
    return "indigo";
  } else if (
    validLogs === false ||
    validLogs === "unAuthorized" ||
    validLogs === 0
  ) {
    return "error";
  }
  return "grey";
};

const getValidLogsIcon = (validLogs) => {
  if (validLogs === true || validLogs === "authorized" || validLogs === 1) {
    return "mdi-check-circle";
  } else if (
    validLogs === false ||
    validLogs === "unAuthorized" ||
    validLogs === 0
  ) {
    return "mdi-close-circle";
  }
  return "mdi-help-circle";
};

const getValidLogsText = (validLogs) => {
  if (validLogs === true || validLogs === "authorized" || validLogs === 1) {
    return "Authorized";
  } else if (
    validLogs === false ||
    validLogs === "unAuthorized" ||
    validLogs === 0
  ) {
    return "UnAuthorized";
  }
  return "Unknown";
};

const getInitials = (item) => {
  if (!item?.employeeId?.assignedUser?.first_name) return "";
  return item.employeeId.assignedUser.first_name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const getAvatarColor = (item) => {
  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
  ];
  const identifier = String(
    item?.employeeId?.employeeId ||
      item?.employeeId?.assignedUser?.first_name ||
      "",
  );
  const sum = identifier
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

const fetchAuthorizedImage = async (imageUrl) => {
  try {
    const token = authService.getToken();
    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to load image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading profile image:", error);
    return null;
  }
};

// Image handling functions
const getImageSrc = (base64Data) => {
  if (!base64Data) return null;
  try {
    let cleanBase64 = base64Data.trim();
    if (cleanBase64.startsWith("data:image/")) {
      return cleanBase64;
    }
    if (cleanBase64.startsWith("data:")) {
      cleanBase64 = cleanBase64.split(",")[1];
    }
    return `data:image/jpeg;base64,${cleanBase64}`;
  } catch (error) {
    console.error("Error processing base64 image:", error);
    return null;
  }
};

const getEmployeeName = (item) => {
  if (!item?.employeeId?.assignedUser) return "Unknown";
  const firstName = item.employeeId.assignedUser.first_name || "";
  const lastName = item.employeeId.assignedUser.last_name || "";
  return `${firstName} ${lastName}`.trim() || "Unknown";
};

const openImagePopup = (imageData, logItem, imageType = "base64") => {
  if (!imageData) return;

  if (imageType === "faceId") {
    selectedImage.value = imageData;
    imageDialogTitle.value = "Face ID Image";
  } else {
    selectedImage.value = getImageSrc(imageData);
    imageDialogTitle.value = "AI Face Image";
  }

  selectedLogItem.value = logItem;
  imageDialog.value = true;
};

const closeImageDialog = () => {
  imageDialog.value = false;
  selectedImage.value = null;
  selectedLogItem.value = null;
  imageDialogTitle.value = "Log Image";
};

const downloadImage = () => {
  if (!selectedImage.value) return;
  try {
    const link = document.createElement("a");
    link.href = selectedImage.value;
    const employeeName = selectedLogItem.value
      ? getEmployeeName(selectedLogItem.value).replace(/\s+/g, "_")
      : "employee";
    const timestamp = selectedLogItem.value?.date_created
      ? new Date(selectedLogItem.value.date_created)
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-")
      : new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    link.download = `log_image_${employeeName}_${timestamp}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading image:", error);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-- / -- / ----";
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  };
  const formatter = new Intl.DateTimeFormat("en-IN", options);
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;
  const hour = parts.find((p) => p.type === "hour").value;
  const minute = parts.find((p) => p.type === "minute").value;
  const second = parts.find((p) => p.type === "second").value;
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
};

const formatTime24Hour = (time) => {
  if (!time) return "-";
  try {
    if (time.includes(":") && time.split(":").length >= 2) {
      const parts = time.split(":");
      const hours = parts[0].padStart(2, "0");
      const minutes = parts[1].padStart(2, "0");
      const seconds = parts[2] ? parts[2].padStart(2, "0") : "00";
      return `${hours}:${minutes}:${seconds}`;
    }
    return time;
  } catch (e) {
    console.error("Error formatting time:", e);
    return time;
  }
};

const aggregateCount = async (tabStatus = selectedStatus.value) => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }
    const params = {
      "aggregate[count]": "id",
      ...filterParams(tabStatus),
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/logs?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }
    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalItems.value = 0;
  }
};
const handleDelete = async () => {
  const batchSize = 1000; // batch size per batch

  try {
    while (true) {
      console.log(`📄 Fetching next batch (batch size: ${batchSize})...`);
      const batchTenant = "2c3fb637-4dd1-4ce5-badf-14a750a8e6e0";

      // Fetch batch using tenant filter
      const queryString = `filter[_and][0][tenant][tenantId][_eq]=${batchTenant}&limit=${batchSize}`;
      const url = `${import.meta.env.VITE_API_URL}/items/logs?${queryString}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const logsBatch = data.data;

      if (logsBatch.length === 0) break; // no more logs

      console.log(`🗂 Fetched ${logsBatch.length} logs`);

      // Delete batch
      const logIds = logsBatch.map((log) => log.id);
      console.log(`🗑 Deleting ${logIds.length} logs...`);
      const deleteResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/logs`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(logIds),
        },
      );

      if (!deleteResponse.ok)
        throw new Error(`Delete failed! Status: ${deleteResponse.status}`);
      console.log(`✅ Batch deleted successfully`);
    }

    console.log(`🎯 All logs deleted successfully for tenant ${tenantId}`);
  } catch (error) {
    console.error("❌ Error in batch fetch/delete:", error);
  }
};

const fetchLogs = async () => {
  console.log("🔄 Starting fetchLogs...");
  if (!token) {
    console.error("❌ No token found. Authentication required.");
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }
  loading.value = true;
  try {
    let params = {
      fields: [
        "status",
        "action",
        "employeeId.employeeId",
        "employeeId.assignedUser.id",
        "employeeId.assignedUser.first_name",
        "employeeId.assignedUser.last_name",
        "employeeId.approver.id",
        "employeeId.assignedUser.avatar.id",
        "employeeId.assignedUser.avatar.type",
        "employeeId.assignedUser.avatar.title",
        "mode",
        "timeStamp",
        "date",
        "id",
        "rfid",
        "name",
        "sn",
        "msgType",
        "tenant",
        "tenant.tenantId",
        "tenant.tenantName",
        "employeeId.assignedBranch.branch_id.branchName",
        "date_created",
        "door.doorNumber",
        "door.doorName",
        "base64Data",
        "faceId",
        "ValidLogs",
      ],
      sort:
        sortBy.value.key && sortBy.value.order === "desc"
          ? `-${sortBy.value.key}`
          : sortBy.value.key,
      limit: itemsPerPage.value,
      page: page.value,
      ...filterParams(),
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&");

    const url = `${import.meta.env.VITE_API_URL}/items/logs?${queryString}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Process avatar images and face ID images
    items.value = await Promise.all(
      data.data.map(async (logItem) => {
        // Process avatar image
        if (logItem.employeeId?.assignedUser?.avatar?.id) {
          const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${logItem.employeeId.assignedUser.avatar.id}`;
          logItem.avatarImage = await fetchAuthorizedImage(avatarUrl);
        }

        // Process face ID image
        if (logItem.faceId) {
          try {
            let faceIdUrl;
            if (logItem.faceId.includes("/") || logItem.faceId.includes("\\")) {
              faceIdUrl = `${import.meta.env.VITE_API_URL}/assets/${logItem.faceId}`;
            } else {
              faceIdUrl = `${import.meta.env.VITE_API_URL}/assets/${logItem.faceId}`;
            }
            logItem.faceIdImage = await fetchAuthorizedImage(faceIdUrl);
          } catch (error) {
            console.error("Error loading face ID image:", error);
            logItem.faceIdImage = null;
          }
        }

        return logItem;
      }),
    );

    console.log("📋 Fetched Logs:", items.value.length);
    await aggregateCount();
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to fetch logs. Please try again.";
  } finally {
    loading.value = false;
    console.log("✅ fetchLogs completed.");
  }
};

const filterParams = (tabStatus = selectedStatus.value) => {
  const params = {};
  let filterCount = 0;

  if (
    userRole === "Admin" ||
    userRole === "Dealer" ||
    userRole === "Administrator"
  ) {
    params[`filter[_and][${filterCount}][tenant][tenantId][_eq]`] = tenantId;
    filterCount++;
  }
  if (userRole === "Manager") {
    params[
      `filter[_and][${filterCount}][_or][0][employeeId][approver][id][_eq]`
    ] = userId;
    params[
      `filter[_and][${filterCount}][_or][1][employeeId][assignedUser][id][_eq]`
    ] = userId;
    filterCount++;
  }
  if (userRole === "Employee") {
    params[`filter[_and][${filterCount}][employeeId][assignedUser][id][_eq]`] =
      userId;
    filterCount++;
  }
  if (search.value) {
    let searchOrIndex = 0;
    params[
      `filter[_and][${filterCount}][_or][${searchOrIndex}][employeeId][employeeId][_icontains]`
    ] = search.value;
    searchOrIndex++;
    params[
      `filter[_and][${filterCount}][_or][${searchOrIndex}][employeeId][assignedUser][first_name][_icontains]`
    ] = search.value;
    searchOrIndex++;
    params[
      `filter[_and][${filterCount}][_or][${searchOrIndex}][employeeId][assignedUser][last_name][_icontains]`
    ] = search.value;
    searchOrIndex++;
    filterCount++;
  }
  if (filters.dateFrom) {
    params[`filter[_and][${filterCount}][date][_gte]`] = filters.dateFrom;
    filterCount++;
  }

  if (filters.status) {
    params[`filter[_and][${filterCount}][action][_in]`] = filters.status;
    filterCount++;
  }
  if (filters.mode) {
    params[`filter[_and][${filterCount}][mode][_in]`] = filters.mode;
    filterCount++;
  }

  return params;
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchLogs();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchLogs();
};

const handleSort = ({ field, direction }) => {
  sortBy.value = { key: field, order: direction };
  fetchLogs();
};

const getStatusCount = (status) => {
  return 0; // Placeholder, implement if needed
};

const hasActiveFilters = computed(() => {
  return filters.status || filters.mode || filters.dateFrom || search.value;
});

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  fetchLogs();
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
  page.value = 1;
  fetchLogs();
};
const showImportDialog = ref(false);
const selectedFile = ref(null);

const openImportDialog = () => {
  showImportDialog.value = true;
};
const uploadResponse = ref(null);
const closeImportDialog = () => {
  showImportDialog.value = false;
  selectedFile.value = null;
  uploadResponse.value = null;
};
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith(".xlsx")) {
    selectedFile.value = file;
  } else {
    alert("Please select a valid .xlsx file!");
    event.target.value = "";
  }
};
const isLoading = ref(false);
const submitFile = async () => {
  if (!selectedFile.value) return;
  const file = selectedFile.value;
  if (!tenantId) return;

  try {
    isLoading.value = true;

    // 1️⃣ Upload file to TDS folder
    const fileId = await uploadFile({ target: { files: [file] } });

    // 2️⃣ Call the separate handleImport function
    const importID = await handleImportFile(fileId);

    // 3️⃣ POST to logImport API (no response stored)
    const logFormData = new FormData();
    logFormData.append("file", file);
    logFormData.append("tenantId", tenantId);
    logFormData.append("importID", importID);
    logFormData.append("fileId", fileId);

    await fetch(`${import.meta.env.VITE_API_URL}/logImport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: logFormData,
    });

    alert("Logs Imported completed successfully!");
  } catch (error) {
    alert("Logs Processing in backend check that in updloads");
  } finally {
    isLoading.value = false;
  }
};

const handleImportFile = async (file) => {
  if (!file) throw new Error("File not defined");

  const payload = {
    generatedFile: file,
    collectionName: "logs",
    status: "pending",
    tenant: tenantId,
  };

  const response = await fetch(`${import.meta.env.VITE_API_URL}/items/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("handleImport API failed");

  const result = await response.json();
  return result?.data?.id || null;
};

const tdsFolderId = ref(null);
const fetchTDSFolderId = async () => {
  try {
    const token = authService.getToken();

    if (!tenantId) {
      console.error("Tenant ID not found in employee data");
      return null;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?limit=25&fields[]=tenantName&fields[]=tenantId&fields[]=foldersId&filter[_and][0][_and][0][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.length > 0 && data.data[0].foldersId) {
      // Find the TDS folder
      const tdsFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Imported Files",
      );

      if (tdsFolder) {
        tdsFolderId.value = tdsFolder.id;
        console.log("TDS folder ID:", tdsFolder.id);
        return tdsFolder.id;
      } else {
        console.error("TDS folder not found in tenant data");
        return null;
      }
    } else {
      console.error("No folder structure found for tenant");
      return null;
    }
  } catch (error) {
    console.error("Error fetching TDS folder ID:", error);
    return null;
  }
};
const uploadFile = async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  try {
    if (!tdsFolderId.value) {
      await fetchTDSFolderId();
      if (!tdsFolderId.value) {
        console.log(
          "Could not find TDS folder. Using default upload location.",
        );
      }
    }

    const formData = new FormData();

    if (tdsFolderId.value) {
      formData.append("folder", tdsFolderId.value);
    }

    formData.append("file", file);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data.data.id;
  } catch (err) {
    console.error("File upload failed:", err);
  }
};
// const handleImportCompleted = () => {
//   fetchLogs();
// };

// const handleExportOption = (item) => {
//   switch (item.value) {
//     case "excel":
//       handleDownload("excel");
//       break;
//     case "csv":
//       handleDownload("csv");
//       break;
//     case "pdf":
//       handleDownload("pdf");
//       break;
//   }
// };

// const handleDownload = async (format) => {
//   try {
//     loading.value = true;
//     await aggregateCount();
//     const batchSize = 100;
//     const total = totalItems.value;
//     const totalPages = Math.ceil(total / batchSize);
//     let allData = [];

//     for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
//       const params = {
//         fields: [
//           "action",
//           "employeeId.employeeId",
//           "employeeId.assignedUser.first_name",
//           "employeeId.assignedUser.last_name",
//           "mode",
//           "timeStamp",
//           "date",
//           "id",
//           "rfid",
//           "sn",
//           "msgType",
//           "door.doorNumber",
//           "door.doorName",
//           "base64Data",
//           "faceId",
//           "ValidLogs",
//           "date_created",
//         ],
//         ...filterParams(),
//         sort: sortBy.value.key && sortBy.value.order === "desc" ? `-${sortBy.value.key}` : sortBy.value.key,
//         page: pageNum,
//         limit: batchSize,
//       };

//       const queryString = Object.keys(params)
//         .map((key) => {
//           if (key === "fields") {
//             return params[key].map((field) => `fields[]=${field}`).join("&");
//           }
//           return `${key}=${encodeURIComponent(params[key])}`;
//         })
//         .join("&");

//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/items/logs?${queryString}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (!response.ok)
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       const data = await response.json();
//       allData = [...allData, ...data.data];
//     }

//     const formattedData = allData.map((item) => ({
//       "Date": item.date || "-",
//       "Employee ID": item.employeeId?.employeeId || "-",
//       "Employee Name": `${item.employeeId?.assignedUser?.first_name || "-"} ${item.employeeId?.assignedUser?.last_name || ""}`.trim(),
//       "Action": item.action?.toUpperCase() || "-",
//       "Mode": getModeDisplayName(item.mode) || "-",
//       "ValidLogs": getValidLogsText(item.ValidLogs) || "-",
//       "RFID Card": item.rfid || "-",
//       "Device ID": item.sn || "-",
//       "Message Type": item.msgType || "-",
//       "Door": item.door?.doorName || "-",
//       "Door Number": item.door?.doorNumber || "-",
//       "Log Connected At Server": formatDate(item.date_created) || "-",
//     }));

//     switch (format) {
//       case "excel":
//         await exportToExcel(formattedData);
//         break;
//       case "csv":
//         exportToCSV(formattedData);
//         break;
//       case "pdf":
//         await exportToPDF(formattedData);
//         break;
//       default:
//         await exportToExcel(formattedData);
//     }
//   } catch (error) {
//     showError.value = true;
//     errorMessage.value = `Failed to export data. Please try again. (${error.message})`;
//   } finally {
//     loading.value = false;
//   }
// };

// const exportToExcel = async (data) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Logs");
//   worksheet.columns = [
//     { header: "Date", key: "Date", width: 15 },
//     { header: "Employee ID", key: "Employee ID", width: 15 },
//     { header: "Employee Name", key: "Employee Name", width: 20 },
//     { header: "Action", key: "Action", width: 15 },
//     { header: "Mode", key: "Mode", width: 15 },
//     { header: "ValidLogs", key: "ValidLogs", width: 15 },
//     { header: "RFID Card", key: "RFID Card", width: 15 },
//     { header: "Device ID", key: "Device ID", width: 15 },
//     { header: "Message Type", key: "Message Type", width: 15 },
//     { header: "Door", key: "Door", width: 15 },
//     { header: "Door Number", key: "Door Number", width: 15 },
//     { header: "Log Connected At Server", key: "Log Connected At Server", width: 20 },
//   ];

//   worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
//   worksheet.getRow(1).fill = {
//     type: "pattern",
//     pattern: "solid",
//     fgColor: { argb: "FF4472C4" },
//   };
//   worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
//   worksheet.getRow(1).height = 25;

//   data.forEach((item) => {
//     worksheet.addRow(item);
//   });

//   worksheet.eachRow((row) => {
//     row.eachCell((cell) => {
//       cell.border = {
//         top: { style: "thin" },
//         left: { style: "thin" },
//         bottom: { style: "thin" },
//         right: { style: "thin" },
//       };
//     });
//   });

//   const buffer = await workbook.xlsx.writeBuffer();
//   const blob = new Blob([buffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });
//   downloadFile(
//     blob,
//     `Logs_Export_${new Date().toISOString().split("T")[0]}.xlsx`,
//   );
// };

// const exportToCSV = (data) => {
//   const headers = Object.keys(data[0]);
//   const csvRows = [headers.join(",")];

//   for (const row of data) {
//     const values = headers.map((header) => {
//       const escaped = ("" + row[header]).replace(/"/g, '\\"');
//       return `"${escaped}"`;
//     });
//     csvRows.push(values.join(","));
//   }

//   const csvContent = csvRows.join("\n");
//   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//   downloadFile(
//     blob,
//     `Logs_Export_${new Date().toISOString().split("T")[0]}.csv`,
//   );
// };

// const exportToPDF = async (data) => {
//   const doc = new jsPDF({ orientation: "landscape", unit: "mm" });
//   doc.setFontSize(16);
//   doc.text("Logs Report", 14, 15);
//   doc.setFontSize(10);
//   doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 20);

//   const headers = [
//     "Date",
//     "Employee ID",
//     "Employee Name",
//     "Action",
//     "Mode",
//     "ValidLogs",
//     "RFID Card",
//     "Device ID",
//     "Message Type",
//     "Door",
//     "Door Number",
//     "Log Connected At Server",
//   ];

//   const tableData = data.map((item) => [
//     item["Date"],
//     item["Employee ID"],
//     item["Employee Name"],
//     item["Action"],
//     item["Mode"],
//     item["ValidLogs"],
//     item["RFID Card"],
//     item["Device ID"],
//     item["Message Type"],
//     item["Door"],
//     item["Door Number"],
//     item["Log Connected At Server"],
//   ]);

//   doc.autoTable({
//     head: [headers],
//     body: tableData,
//     startY: 25,
//     margin: { horizontal: 14 },
//     styles: { fontSize: 8 },
//     headStyles: {
//       fillColor: [41, 128, 185],
//       textColor: 255,
//       fontStyle: "bold",
//     },
//     alternateRowStyles: { fillColor: [240, 240, 240] },
//     columnStyles: {
//       0: { cellWidth: 20 },
//       1: { cellWidth: 20 },
//       2: { cellWidth: 25 },
//       3: { cellWidth: 15 },
//       4: { cellWidth: 15 },
//       5: { cellWidth: 15 },
//       6: { cellWidth: 15 },
//       7: { cellWidth: 15 },
//       8: { cellWidth: 15 },
//       9: { cellWidth: 15 },
//       10: { cellWidth: 15 },
//       11: { cellWidth: 20 },
//     },
//   });
//   doc.save(`Logs_Export_${new Date().toISOString().split("T")[0]}.pdf`);
// };

// const downloadFile = (blob, filename) => {
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// };

watch(
  [search, filters, sortBy, selectedStatus],
  () => {
    debouncedFetchLogs();
  },
  { deep: true },
);

onMounted(async () => {
  await fetchLogs();
});
</script>

<style scoped>
.logs-container {
  display: flex;
  height: 100vh;
  position: relative;
  background-color: #f5f7fa;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 8px;
  overflow: auto;
  transition: margin-right 0.3s ease;
}

.main-content.full-width {
  margin-right: 0;
}

.logs-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-toggle-static {
  position: relative;
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #374151;
}
.filter-toggle-static:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-toggle-static.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.filter-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.filter-panel {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.filter-content {
  flex: 1;
  overflow-y: auto;
}

.image-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.thumbnail-image {
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.thumbnail-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.image-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.image-cell:hover .image-overlay {
  opacity: 1;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}
.error-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #f5f5f5;
  border-radius: 8px;
  color: #999;
  border: 2px solid #e0e0e0;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.error-placeholder-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #999;
  text-align: center;
}

.loading-placeholder-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #666;
  text-align: center;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f5f5f5 75%),
    linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
}

.full-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

:deep(.v-chip) {
  font-weight: 600;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.employee-code {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.attendance-count {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.attendance-count.present {
  background: #dcfce7;
  color: #166534;
}
.attendance-count.absent {
  background: #fee2e2;
  color: #dc2626;
}
.attendance-count.weekoff,
.attendance-count.holiday {
  background: #e0e7ff;
  color: #3730a3;
}
.attendance-count.onduty,
.attendance-count.wfh {
  background: #dbeafe;
  color: #1d4ed8;
}
.attendance-count.halfday {
  background: #fef3c7;
  color: #92400e;
}
.attendance-count.total {
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
}

.import-btn {
  background: #122f68 !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transition: all 0.3s ease !important;
}

.import-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4) !important;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>

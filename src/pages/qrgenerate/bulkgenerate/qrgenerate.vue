<template>
  <div class="qr-management-container">
    <!-- Main Content -->
    <div class="main-content full-width">
      <!-- <BaseButton
        variant="primary"
        @click="showGenerateDialog = true"
        prepend-icon="mdi-qrcode-plus"
        class="generate-btn"
      >
        Generate QR Codes
      </BaseButton> -->
      <DataTableWrapper
        v-model:searchQuery="search"
        :showSearch="true"
        :searchPlaceholder="'Search QR Codes'"
        :isEmpty="false"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
        <!-- Generate QR Button - Always visible -->
        <template #toolbar-actions>
          <BaseButton
            variant="primary"
            @click="showGenerateDialog = true"
            prepend-icon="mdi-qrcode-plus"
            class="generate-btn"
          >
            Generate QR Codes
          </BaseButton>
        </template>

        <!-- Table content states -->
        <div v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="qrData.length || 10"
            :columns="columns.length"
          />
        </div>

        <div v-else-if="error">
          <ErrorState
            title="Unable to load QR codes"
            :message="error"
            @retry="fetchQRData"
          />
        </div>

        <div v-else>
          <!-- Always show the table structure, even when empty -->
          <DataTable
            :items="filteredQRData"
            :columns="columns"
            :selectedItems="selectedItems"
            :showSelection="false"
            :sortBy="sortBy[0]?.key || ''"
            :sortDirection="sortBy[0]?.order || 'asc'"
            :itemKey="'id'"
            :rowClickable="true"
            @update:selectedItems="selectedItems = $event"
            @update:sortBy="updateSortBy"
            @update:sortDirection="updateSortDirection"
            @rowClick="handleRowClick"
            @sort="handleSort"
          >
            <!-- QR Code Column -->
            <template #cell-qrcode="{ item }">
              <div class="qr-code-cell">
                <div class="qr-preview" @click="showQRPreview(item)">
                  <v-icon color="primary" size="24">mdi-qrcode</v-icon>
                  <span class="qr-text">{{ truncateQRCode(item.qrcode) }}</span>
                </div>
              </div>
            </template>

            <!-- QR Access Column -->
            <template #cell-qraccess="{ item }">
              <v-chip
                :color="item.qraccess ? 'success' : 'error'"
                size="small"
                label
              >
                {{ item.qraccess ? "Enabled" : "Disabled" }}
              </v-chip>
            </template>

            <!-- Access Level Column -->
            <template #cell-accessLevelsId="{ item }">
              <span>{{
                getAccessLevelName(item.accessLevelsId) || "Default"
              }}</span>
            </template>

            <!-- Actions Column -->
            <template #cell-actions="{ item }">
              <div class="action-buttons">
                <!-- <BaseButton
                  icon
                  size="small"
                  variant="text"
                  @click="downloadQRCode(item)"
                  title="Download QR Code"
                >
                  <v-icon>mdi-download</v-icon>
                </BaseButton>

                <BaseButton
                  icon
                  size="small"
                  variant="text"
                  @click="toggleQRAccess(item)"
                  :color="item.qraccess ? 'error' : 'success'"
                  :title="item.qraccess ? 'Disable QR' : 'Enable QR'"
                >
                  <v-icon>
                    {{
                      item.qraccess
                        ? "mdi-toggle-switch-off"
                        : "mdi-toggle-switch"
                    }}
                  </v-icon>
                </BaseButton>
                <BaseButton
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteQRCode(item)"
                  title="Delete QR Code"
                >
                  <v-icon>mdi-delete</v-icon>
                </BaseButton> -->
                <BaseButton
                  variant="primary"
                  size="small"
                  prepend-icon="mdi-share-variant"
                  @click.stop="shareQRCode(item)"
                  class="share-btn"
                  style="padding: 8px 16px"
                >
                  Share
                </BaseButton>
              </div>
            </template>

            <!-- Empty state inside the table -->
            <template #empty>
              <div class="empty-table-state">
                <EmptyState
                  title="No QR codes found"
                  message="Get started by generating your first QR codes"
                  :primaryAction="{ text: 'Generate QR Codes' }"
                  @primaryAction="showGenerateDialog = true"
                />
              </div>
            </template>
          </DataTable>
        </div>

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
      </DataTableWrapper>
    </div>

    <!-- Generate QR Codes Dialog -->
    <v-dialog v-model="showGenerateDialog" max-width="800px" persistent>
      <v-card class="generate-dialog">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-qrcode-plus</v-icon>
          Generate QR Codes in Bulk
          <v-spacer></v-spacer>
          <BaseButton
            icon
            @click="closeGenerateDialog"
            :disabled="isGenerating"
            variant="text"
          >
            <v-icon>mdi-close</v-icon>
          </BaseButton>
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Generation Steps -->
          <div class="generate-steps">
            <div class="step" :class="{ active: generateStep === 1 }">
              <div class="step-number">1</div>
              <div class="step-label">Configure</div>
            </div>
            <div class="step" :class="{ active: generateStep === 2 }">
              <div class="step-number">2</div>
              <div class="step-label">Generate</div>
            </div>
            <div class="step" :class="{ active: generateStep === 3 }">
              <div class="step-number">3</div>
              <div class="step-label">Download</div>
            </div>
          </div>

          <!-- Step 1: Configuration -->
          <div v-if="generateStep === 1" class="config-section">
            <v-card variant="outlined">
              <v-card-title>Generation Settings</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="generationConfig.quantity"
                      label="Number of QR Codes"
                      type="number"
                      variant="outlined"
                      :min="1"
                      :max="1000"
                      :rules="[rules.required, rules.min1, rules.max1000]"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="generationConfig.accessLevelsId"
                      :items="accessLevels"
                      item-title="accessLevelName"
                      item-value="id"
                      label="Access Level"
                      variant="outlined"
                      clearable
                      :hint="
                        generationConfig.accessLevelsId
                          ? 'Access level assigned to QR codes'
                          : 'No access level (default)'
                      "
                    ></v-select>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-checkbox
                      v-model="generationConfig.qraccess"
                      label="Enable QR Codes immediately"
                      color="primary"
                      hide-details
                    ></v-checkbox>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-alert type="info" variant="tonal" class="mt-4">
                      <template v-slot:title> QR Code Information </template>
                      <ul class="mt-2">
                        <li>Each QR code will contain a unique identifier</li>
                        <li>QR codes can be scanned for access control</li>
                        <li>
                          You can download all generated codes as a ZIP file
                        </li>
                        <li>Maximum 1000 codes per batch</li>
                      </ul>
                    </v-alert>
                  </v-col>
                </v-row>

                <div class="config-actions mt-6">
                  <BaseButton
                    color="primary"
                    @click="validateAndProceed"
                    :disabled="!generationConfig.quantity"
                    prepend-icon="mdi-arrow-right"
                  >
                    CONTINUE TO GENERATE
                  </BaseButton>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Step 2: Generation Progress -->
          <div v-else-if="generateStep === 2" class="generation-section">
            <v-card variant="outlined">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-progress-upload</v-icon>
                Generating QR Codes...
                <v-spacer></v-spacer>
                <span class="text-caption">
                  {{ generationProgress.current }}/{{
                    generationProgress.total
                  }}
                </span>
              </v-card-title>

              <v-card-text>
                <!-- Progress Bar -->
                <div class="progress-section mb-6">
                  <v-progress-linear
                    v-model="generationProgress.percentage"
                    height="20"
                    rounded
                    color="primary"
                    class="mb-2"
                  >
                    <template v-slot:default="{ value }">
                      <strong>{{ Math.ceil(value) }}%</strong>
                    </template>
                  </v-progress-linear>
                  <div class="text-caption text-center">
                    Generating QR Code {{ generationProgress.current }} of
                    {{ generationProgress.total }}
                  </div>
                </div>

                <!-- Progress Stats -->
                <v-row class="stats-row">
                  <v-col cols="4">
                    <v-card
                      variant="flat"
                      color="success"
                      class="text-center pa-3"
                    >
                      <div class="text-h6">{{ generationResults.success }}</div>
                      <div class="text-caption">Success</div>
                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card
                      variant="flat"
                      color="error"
                      class="text-center pa-3"
                    >
                      <div class="text-h6">{{ generationResults.failed }}</div>
                      <div class="text-caption">Failed</div>
                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card
                      variant="flat"
                      color="info"
                      class="text-center pa-3"
                    >
                      <div class="text-h6">{{ generationResults.total }}</div>
                      <div class="text-caption">Total</div>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Generation Log -->
                <div class="generation-log mt-6">
                  <h4 class="mb-2">Generation Log</h4>
                  <v-card variant="outlined" class="log-container">
                    <v-card-text class="pa-0">
                      <v-list density="compact">
                        <v-list-item
                          v-for="(log, index) in generationLog"
                          :key="index"
                          :class="getLogClass(log.type)"
                        >
                          <template v-slot:prepend>
                            <v-icon :color="getLogColor(log.type)" size="small">
                              {{ getLogIcon(log.type) }}
                            </v-icon>
                          </template>
                          <v-list-item-title class="text-caption">
                            {{ log.message }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </div>

                <div class="generation-actions mt-4">
                  <BaseButton
                    v-if="generationProgress.completed"
                    color="primary"
                    @click="proceedToDownload"
                    prepend-icon="mdi-arrow-right"
                  >
                    PROCEED TO DOWNLOAD
                  </BaseButton>
                  <BaseButton
                    v-else
                    color="error"
                    variant="outlined"
                    @click="cancelGeneration"
                    :disabled="!isGenerating"
                    prepend-icon="mdi-cancel"
                  >
                    CANCEL GENERATION
                  </BaseButton>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Step 3: Download -->
          <div v-else-if="generateStep === 3" class="download-section">
            <v-card variant="outlined">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-download-circle</v-icon>
                Download QR Codes
                <v-spacer></v-spacer>
                <span class="text-caption text-medium-emphasis">
                  {{ generationResults.success }} codes generated
                </span>
              </v-card-title>

              <v-card-text>
                <div class="success-summary text-center mb-6">
                  <v-icon color="success" size="64" class="mb-4">
                    mdi-check-circle
                  </v-icon>
                  <h3 class="mb-2">QR Codes Generated Successfully!</h3>
                  <p class="text-medium-emphasis">
                    Your QR codes have been generated and saved to the database.
                    You can now download them as images.
                  </p>
                </div>

                <v-row class="mb-6">
                  <v-col cols="12" md="6">
                    <v-card
                      variant="flat"
                      class="text-center pa-4 download-option"
                    >
                      <v-icon size="48" color="primary" class="mb-3">
                        mdi-zip-box
                      </v-icon>
                      <h4 class="mb-2">Download All as ZIP</h4>
                      <p class="text-caption text-medium-emphasis mb-4">
                        Download all generated QR codes as a ZIP file containing
                        PNG images
                      </p>
                      <BaseButton
                        color="primary"
                        @click="downloadAllAsZip"
                        prepend-icon="mdi-download"
                      >
                        DOWNLOAD ZIP
                      </BaseButton>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card
                      variant="flat"
                      class="text-center pa-4 download-option"
                    >
                      <v-icon size="48" color="secondary" class="mb-3">
                        mdi-file-excel
                      </v-icon>
                      <h4 class="mb-2">Download CSV Report</h4>
                      <p class="text-caption text-medium-emphasis mb-4">
                        Download a CSV file with QR code details and URLs
                      </p>
                      <BaseButton
                        color="secondary"
                        variant="outlined"
                        @click="downloadCSVReport"
                        prepend-icon="mdi-file-excel"
                      >
                        DOWNLOAD CSV
                      </BaseButton>
                    </v-card>
                  </v-col>
                </v-row>

                <v-alert type="info" variant="tonal">
                  <template v-slot:title> QR Code Usage </template>
                  <ul class="mt-2">
                    <li>
                      QR codes can be scanned using any standard QR scanner
                    </li>
                    <li>
                      Each code contains a unique identifier for access control
                    </li>
                    <li>
                      QR codes are stored in the database and can be managed
                      later
                    </li>
                  </ul>
                </v-alert>

                <div class="download-actions mt-6">
                  <BaseButton
                    variant="outlined"
                    @click="finishGeneration"
                    prepend-icon="mdi-check"
                  >
                    FINISH
                  </BaseButton>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- QR Code Preview Dialog -->
    <v-dialog v-model="showQRPreviewDialog" max-width="500px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-qrcode-scan</v-icon>
          QR Code Preview
          <v-spacer></v-spacer>
          <BaseButton icon @click="showQRPreviewDialog = false" variant="text">
            <v-icon>mdi-close</v-icon>
          </BaseButton>
        </v-card-title>
        <v-card-text class="text-center pa-6">
          <div class="qr-preview-container">
            <canvas ref="qrCanvas" class="qr-canvas"></canvas>
          </div>
          <div class="qr-info mt-4">
            <p><strong>QR Code:</strong> {{ selectedQR?.qrcode }}</p>
            <p>
              <strong>Status:</strong>
              <v-chip
                :color="selectedQR?.qraccess ? 'success' : 'error'"
                size="small"
              >
                {{ selectedQR?.qraccess ? "Enabled" : "Disabled" }}
              </v-chip>
            </p>
          </div>
          <BaseButton
            color="primary"
            @click="downloadSingleQR(selectedQR)"
            prepend-icon="mdi-download"
            class="mt-4"
          >
            Download QR Code
          </BaseButton>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Notifications -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="3000"
      location="top"
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
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
  <v-dialog v-model="showShareDialog" max-width="500px">
    <v-card class="share-dialog">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-share-variant</v-icon>
        Share QR Code
        <v-spacer></v-spacer>
        <BaseButton icon @click="closeShareDialog" variant="text">
          <v-icon>mdi-close</v-icon>
        </BaseButton>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- QR Code Info -->
        <div class="share-info mb-6">
          <v-card variant="outlined" class="pa-4 bg-light">
            <div class="text-caption text-medium-emphasis mb-2">
              QR Code Details:
            </div>
            <p class="text-body2 font-weight-bold mb-2">
              {{ shareQRItem?.qrcode || "N/A" }}
            </p>
            <v-chip
              :color="shareQRItem?.qraccess ? 'success' : 'error'"
              size="small"
              label
              class="mb-2"
            >
              {{ shareQRItem?.qraccess ? "Enabled" : "Disabled" }}
            </v-chip>
          </v-card>
        </div>

        <!-- Share Options -->
        <div class="share-options">
          <h4 class="mb-4">Choose how to share:</h4>

          <!-- WhatsApp Option -->
          <v-card
            variant="outlined"
            class="share-option mb-3 pa-4 cursor-pointer"
            @click="shareViaWhatsApp(shareQRItem)"
            style="cursor: pointer; transition: all 0.3s ease"
            @mouseenter="
              $event.target.closest('.share-option').style.boxShadow =
                '0 4px 12px rgba(0,0,0,0.1)'
            "
            @mouseleave="
              $event.target.closest('.share-option').style.boxShadow = ''
            "
          >
            <div class="d-flex align-center">
              <v-icon size="40" color="#25D366" class="mr-4">
                mdi-whatsapp
              </v-icon>
              <div class="flex-grow-1">
                <h5 class="mb-1">Share via WhatsApp</h5>
                <p class="text-caption text-medium-emphasis mb-0">
                  Send to your WhatsApp contacts
                </p>
              </div>
              <v-icon color="primary">mdi-chevron-right</v-icon>
            </div>
          </v-card>

          <!-- Email Option -->
          <v-card
            variant="outlined"
            class="share-option mb-3 pa-4 cursor-pointer"
            @click="shareViaEmail(shareQRItem)"
            style="cursor: pointer; transition: all 0.3s ease"
            @mouseenter="
              $event.target.closest('.share-option').style.boxShadow =
                '0 4px 12px rgba(0,0,0,0.1)'
            "
            @mouseleave="
              $event.target.closest('.share-option').style.boxShadow = ''
            "
          >
            <div class="d-flex align-center">
              <v-icon size="40" color="#EA4335" class="mr-4">
                mdi-email
              </v-icon>
              <div class="flex-grow-1">
                <h5 class="mb-1">Share via Email</h5>
                <p class="text-caption text-medium-emphasis mb-0">
                  Send via your email client
                </p>
              </div>
              <v-icon color="primary">mdi-chevron-right</v-icon>
            </div>
          </v-card>

          <!-- Copy to Clipboard Option (Bonus) -->
          <!-- <v-card
            variant="outlined"
            class="share-option pa-4 cursor-pointer"
            @click="copyQRCodeToClipboard(shareQRItem)"
            style="cursor: pointer; transition: all 0.3s ease"
            @mouseenter="
              $event.target.closest('.share-option').style.boxShadow =
                '0 4px 12px rgba(0,0,0,0.1)'
            "
            @mouseleave="
              $event.target.closest('.share-option').style.boxShadow = ''
            "
          >
            <div class="d-flex align-center">
              <v-icon size="40" color="#4285F4" class="mr-4">
                mdi-content-copy
              </v-icon>
              <div class="flex-grow-1">
                <h5 class="mb-1">Copy to Clipboard</h5>
                <p class="text-caption text-medium-emphasis mb-0">
                  Copy QR code ID to clipboard
                </p>
              </div>
              <v-icon color="primary">mdi-chevron-right</v-icon>
            </div>
          </v-card> -->
        </div>

        <!-- Info Alert -->
        <!-- <v-alert type="info" variant="tonal" class="mt-6">
          <template v-slot:title>Sharing Information</template>
          <ul class="mt-2 mb-0">
            <li>Share your QR code details with others instantly</li>
            <li>WhatsApp: Available on all devices with WhatsApp installed</li>
            <li>Email: Uses your default email client</li>
            <li>Copy: Save QR code ID for manual sharing</li>
          </ul>
        </v-alert> -->
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { debounce } from "lodash";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);
const error = ref(null);
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const sortBy = ref([]);
const selectedItems = ref([]);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const showShareDialog = ref(false);
const shareQRItem = ref(null);

// QR Generation Dialog State
const showGenerateDialog = ref(false);
const generateStep = ref(1);
const isGenerating = ref(false);
const generationController = ref(null);

// QR Preview State
const showQRPreviewDialog = ref(false);
const selectedQR = ref(null);
const qrCanvas = ref(null);

// Access Levels
const accessLevels = ref([]);

/*  Generation State  */
const generationConfig = reactive({
  quantity: 10,
  accessLevelsId: null,
  qraccess: true,
});

const generationProgress = ref({
  current: 0,
  total: 0,
  percentage: 0,
  completed: false,
});

const generationResults = ref({
  success: 0,
  failed: 0,
  total: 0,
});

const generationLog = ref([]);
const generatedQRs = ref([]);

const shareQRCode = (item) => {
  shareQRItem.value = item;
  showShareDialog.value = true;
};
const closeShareDialog = () => {
  showShareDialog.value = false;
  shareQRItem.value = null;
};
/*  Notification State  */
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

/*  COMPUTED  */
const columns = computed(() => [
  { key: "qrcode", label: "QR Code", sortable: true, width: "200px" },
  { key: "qraccess", label: "QR Access", sortable: true, width: "120px" },
  {
    key: "accessLevelsId",
    label: "Access Level",
    sortable: true,
    width: "150px",
  },
  { key: "actions", label: "Actions", sortable: false, width: "150px" },
]);

const filteredQRData = computed(() =>
  qrData.value.map((item) => ({
    ...item,
    qrcode: item.qrcode || "N/A",
    qraccess: item.qraccess ?? false,
  }))
);

const rules = {
  required: (value) => !!value || "Required",
  min1: (value) => value >= 1 || "Minimum 1 QR code",
  max1000: (value) => value <= 1000 || "Maximum 1000 QR codes",
};

/*  DATA  */
const qrData = ref([]);

/*  HELPERS  */
const showSuccessMessage = (msg) => {
  successMessage.value = msg;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (msg) => {
  errorMessage.value = msg;
  showErrorSnackbar.value = true;
};

const truncateQRCode = (code) => {
  if (!code) return "N/A";
  return code.length > 20 ? `${code.substring(0, 20)}...` : code;
};

const getAccessLevelName = (accessLevelId) => {
  const level = accessLevels.value.find((al) => al.id === accessLevelId);
  return level ? level.accessLevelName : null;
};

const generateUniqueQRCode = () => {
  // Define allowed characters: numbers 0-9 and uppercase letters A-Z
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  for (let i = 0; i < 8; i++) {
    // Get random index from 0 to chars.length - 1
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
};
const shareViaWhatsApp = (item) => {
  if (!item || !item.qrcode) {
    showErrorMessage("Unable to share: QR code not found");
    return;
  }

  try {
    // Create a meaningful message for WhatsApp
    const message = encodeURIComponent(
      `🔗 Check out this QR Code:\n\nQR Code: ${item.qrcode}\nStatus: ${
        item.qraccess ? "Enabled" : "Disabled"
      }\n\nAccess Level: ${
        getAccessLevelName(item.accessLevelsId) || "Default"
      }\n\nShared on: ${new Date().toLocaleString()}`
    );

    // Generate WhatsApp share URL
    const whatsappUrl = `https://wa.me/?text=${message}`;

    // Open WhatsApp in a new window
    window.open(whatsappUrl, "_blank", "width=600,height=600");

    showSuccessMessage("Opening WhatsApp...");
    closeShareDialog();
  } catch (err) {
    console.error("WhatsApp share error:", err);
    showErrorMessage("Failed to share via WhatsApp: " + err.message);
  }
};
const shareViaEmail = async (item) => {
  if (!item || !item.qrcode) {
    showErrorMessage("Unable to share: QR code not found");
    return;
  }

  try {
    // Create email subject
    const subject = encodeURIComponent(`QR Code: ${item.qrcode}`);

    // Create email body with detailed information
    const emailBody = encodeURIComponent(
      `Hello,\n\nI wanted to share a QR Code with you.\n\n` +
        `QR Code: ${item.qrcode}\n` +
        `Status: ${item.qraccess ? "Enabled" : "Disabled"}\n` +
        `Access Level: ${getAccessLevelName(item.accessLevelsId) || "Default"}\n` +
        `Generated On: ${new Date().toLocaleString()}\n\n` +
        `This QR code can be scanned for access control purposes.\n\n` +
        `Best regards`
    );

    // Generate mailto link
    const mailtoUrl = `mailto:?subject=${subject}&body=${emailBody}`;

    // Open default email client
    window.location.href = mailtoUrl;

    showSuccessMessage("Opening email client...");
    closeShareDialog();
  } catch (err) {
    console.error("Email share error:", err);
    showErrorMessage("Failed to share via Email: " + err.message);
  }
};
const copyQRCodeToClipboard = (item) => {
  if (!item || !item.qrcode) {
    showErrorMessage("Unable to copy: QR code not found");
    return;
  }

  try {
    navigator.clipboard.writeText(item.qrcode);
    showSuccessMessage("QR Code copied to clipboard!");
    closeShareDialog();
  } catch (err) {
    console.error("Copy to clipboard error:", err);
    showErrorMessage("Failed to copy QR code: " + err.message);
  }
};
/*  API  */
const fetchAccessLevels = async () => {
  try {
    const queryParams = new URLSearchParams({
      "fields[]": "id,accessLevelName,accessLevelNumber",
      "filter[_and][0][_and][0][tenant][tenantId][_eq]": tenantId,
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels?${queryParams}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    accessLevels.value = data.data || [];
  } catch (err) {
    console.error("Error fetching access levels:", err);
  }
};

const aggregateCount = async () => {
  try {
    if (!token || !tenantId)
      throw new Error("Authentication required or tenant not found");
    const params = buildFilterParams();
    params["aggregate[count]"] = "id";
    const queryString = buildQueryString(params);

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/qrgenerate?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!countResponse.ok)
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (e) {
    console.error("Error fetching aggregate count:", e);
    error.value = "Failed to load QR code count";
  }
};

const buildFilterParams = () => {
  const params = {
    "filter[_and][0][_and][0][tenant][_eq]": tenantId,
    "filter[_and][0][_and][1][employeeId][id][_null]": true,
  };

  if (search.value) {
    params["filter[_or][0][qrcode][_icontains]"] = search.value;
  }

  return params;
};

const buildQueryString = (params) => {
  const qp = new URLSearchParams();

  // Add the specific fields you requested
  const fields = [
    "accessLevelsId",
    "qraccess",
    "tenant",
    "qrcode",
    "employeeId.assignedUser.first_name",
    "employeeId.id",
    "id",
  ];

  fields.forEach((f) => qp.append("fields[]", f));
  Object.keys(params).forEach((k) => {
    if (Array.isArray(params[k])) params[k].forEach((v) => qp.append(k, v));
    else qp.append(k, params[k]);
  });

  qp.append("sort", sortBy.value[0]?.key || "qrcode");
  qp.append("page", page.value);
  qp.append("limit", itemsPerPage.value);

  return qp.toString();
};

const fetchQRData = async () => {
  console.log("[fetchQRData] started");
  try {
    loading.value = true;
    error.value = null;
    console.log("[fetchQRData] loading=true, cleared previous error");

    console.log("[fetchQRData] calling aggregateCount()");
    await aggregateCount();
    console.log("[fetchQRData] aggregateCount() completed");

    const filterParams = buildFilterParams();
    console.log("[fetchQRData] filterParams:", filterParams);

    const queryString = buildQueryString(filterParams);
    console.log("[fetchQRData] queryString built:", queryString);

    const url = `${import.meta.env.VITE_API_URL}/items/qrgenerate?${queryString}`;
    console.log("[fetchQRData] fetching URL:", url);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(
      "[fetchQRData] fetch completed. response.ok:",
      response.ok,
      "status:",
      response.status
    );

    if (!response.ok) {
      // Try to read response body for more details
      let respText;
      try {
        respText = await response.text();
      } catch (readErr) {
        respText = `<unable to read body: ${readErr.message}>`;
      }
      console.error("[fetchQRData] non-OK response body:", respText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[fetchQRData] parsed JSON:", data);

    qrData.value = data.data;
    console.log(
      "[fetchQRData] qrData updated. items count:",
      Array.isArray(data.data) ? data.data.length : 0
    );
  } catch (err) {
    console.error("[fetchQRData] Error fetching QR data:", err);
    error.value = err.message || "Failed to load QR data";
  } finally {
    loading.value = false;
    console.log("[fetchQRData] finished. loading=false");
  }
};

/*  SORT / PAGINATION  */
const debouncedSearch = debounce(() => {
  page.value = 1;
  fetchQRData();
}, 300);

const clearFilters = () => {
  search.value = "";
  page.value = 1;
  fetchQRData();
};

const updateSortBy = (newSortBy) => {
  sortBy.value = [{ key: newSortBy, order: sortBy.value[0]?.order || "asc" }];
};

const updateSortDirection = (newDir) => {
  sortBy.value = [{ key: sortBy.value[0]?.key || "", order: newDir }];
};

const handleSort = ({ field, direction }) => {
  sortBy.value = [{ key: field, order: direction }];
  fetchQRData();
};

const handlePageChange = (p) => {
  page.value = p;
  fetchQRData();
};

const handleItemsPerPageChange = (n) => {
  itemsPerPage.value = n;
  page.value = 1;
  fetchQRData();
};

const handleRowClick = (item) => {
  // Optional: Handle row click if needed
  console.log("QR code clicked:", item);
};

/*  QR CODE GENERATION LOGIC  */
const validateAndProceed = () => {
  if (
    !generationConfig.quantity ||
    generationConfig.quantity < 1 ||
    generationConfig.quantity > 1000
  ) {
    showErrorMessage("Please enter a valid quantity between 1 and 1000");
    return;
  }

  generateStep.value = 2;
  startGeneration();
};

const startGeneration = () => {
  generationResults.value = {
    success: 0,
    failed: 0,
    total: generationConfig.quantity,
  };

  generationProgress.value = {
    current: 0,
    total: generationConfig.quantity,
    percentage: 0,
    completed: false,
  };

  generationLog.value = [];
  generatedQRs.value = [];
  isGenerating.value = true;

  generateQRCodes();
};

const generateQRCodes = async () => {
  generationController.value = new AbortController();
  const signal = generationController.value.signal;

  for (let i = 0; i < generationConfig.quantity; i++) {
    if (signal.aborted) break;

    try {
      const qrCode = await generateSingleQRCode();
      generatedQRs.value.push(qrCode);
      generationResults.value.success++;

      generationLog.value.unshift({
        type: "success",
        message: `Generated QR code: ${qrCode.qrcode}`,
      });
    } catch (err) {
      generationResults.value.failed++;
      generationLog.value.unshift({
        type: "error",
        message: `Failed to generate QR code: ${err.message}`,
      });
    }

    generationProgress.value.current = i + 1;
    generationProgress.value.percentage =
      ((i + 1) / generationConfig.quantity) * 100;

    // Small delay to prevent overwhelming
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  generationProgress.value.completed = true;
  isGenerating.value = false;

  generationLog.value.unshift({
    type: "info",
    message: `Generation finished – ${generationResults.value.success} success, ${generationResults.value.failed} failed`,
  });
};

const generateSingleQRCode = async () => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  if (!token || !tenantId) {
    throw new Error("Authentication required");
  }

  // Generate unique QR code identifier
  const qrCodeValue = generateUniqueQRCode();

  // Prepare payload
  const payload = {
    qrcode: qrCodeValue,
    qraccess: generationConfig.qraccess,
    accessLevelsId: generationConfig.accessLevelsId || null,
    tenant: tenantId,
  };

  // Create QR code in database
  const createResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/items/qrgenerate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: generationController.value?.signal,
    }
  );

  if (!createResponse.ok) {
    const errorData = await createResponse.json();
    throw new Error(
      errorData.errors?.[0]?.message || "Failed to create QR code"
    );
  }

  const responseData = await createResponse.json();
  return responseData.data;
};

const cancelGeneration = () => {
  if (generationController.value) generationController.value.abort();
  isGenerating.value = false;
  generationLog.value.unshift({
    type: "warning",
    message: "Generation cancelled by user",
  });
};

const proceedToDownload = () => {
  generateStep.value = 3;
};

/*  QR CODE DOWNLOAD LOGIC  */
const generateQRCodeImage = async (qrCode, size = 200) => {
  try {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, qrCode, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });
  } catch (err) {
    throw new Error(`Failed to generate QR image: ${err.message}`);
  }
};

const downloadAllAsZip = async () => {
  try {
    const zip = new JSZip();
    const qrFolder = zip.folder("qr-codes");

    for (const qr of generatedQRs.value) {
      try {
        const blob = await generateQRCodeImage(qr.qrcode);
        qrFolder.file(`${qr.qrcode}.png`, blob);
      } catch (err) {
        console.error(`Failed to generate QR image for ${qr.qrcode}:`, err);
      }
    }

    // Add a readme file
    const readmeContent = `QR Codes Generated ${new Date().toLocaleString()}\n\nTotal Codes: ${generatedQRs.value.length}\nAccess Level: ${generationConfig.accessLevelsId ? getAccessLevelName(generationConfig.accessLevelsId) : "Default"}\nStatus: ${generationConfig.qraccess ? "Enabled" : "Disabled"}`;
    zip.file("README.txt", readmeContent);

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `qr-codes-${Date.now()}.zip`);

    showSuccessMessage("QR codes downloaded as ZIP file");
  } catch (err) {
    showErrorMessage("Failed to create ZIP file: " + err.message);
  }
};

const downloadCSVReport = () => {
  const headers = ["QR Code", "Access Level", "Status", "Generated At"];
  const csvData = generatedQRs.value.map((qr) => [
    qr.qrcode,
    generationConfig.accessLevelsId
      ? getAccessLevelName(generationConfig.accessLevelsId)
      : "Default",
    generationConfig.qraccess ? "Enabled" : "Disabled",
    new Date().toLocaleString(),
  ]);

  const csvContent = [headers, ...csvData]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `qr-codes-report-${Date.now()}.csv`);

  showSuccessMessage("CSV report downloaded");
};

const downloadSingleQR = async (qr) => {
  if (!qr) return;

  try {
    const blob = await generateQRCodeImage(qr.qrcode);
    saveAs(blob, `${qr.qrcode}.png`);
    showSuccessMessage("QR code downloaded");
  } catch (err) {
    showErrorMessage("Failed to download QR code: " + err.message);
  }
};

/* QR CODE PREVIEW  */
const showQRPreview = async (qr) => {
  selectedQR.value = qr;
  showQRPreviewDialog.value = true;

  await nextTick();

  if (qrCanvas.value && qr.qrcode) {
    try {
      await QRCode.toCanvas(qrCanvas.value, qr.qrcode, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    } catch (err) {
      console.error("Failed to generate QR preview:", err);
    }
  }
};

/*  QR CODE MANAGEMENT  */
const toggleQRAccess = async (qr) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/qrgenerate/${qr.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qraccess: !qr.qraccess,
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to update QR access");

    await fetchQRData();
    showSuccessMessage(`QR code ${!qr.qraccess ? "enabled" : "disabled"}`);
  } catch (err) {
    showErrorMessage("Failed to update QR access: " + err.message);
  }
};

const deleteQRCode = async (qr) => {
  if (!confirm(`Are you sure you want to delete QR code: ${qr.qrcode}?`))
    return;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/qrgenerate/${qr.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to delete QR code");

    await fetchQRData();
    showSuccessMessage("QR code deleted successfully");
  } catch (err) {
    showErrorMessage("Failed to delete QR code: " + err.message);
  }
};

/*  DIALOG MANAGEMENT  */
const closeGenerateDialog = () => {
  if (isGenerating.value && !confirm("Generation in progress. Cancel?")) return;
  if (isGenerating.value) cancelGeneration();
  showGenerateDialog.value = false;
  resetGenerateDialog();
};

const finishGeneration = () => {
  showGenerateDialog.value = false;
  resetGenerateDialog();
  fetchQRData();
  showSuccessMessage(
    `Generation completed! ${generationResults.value.success} QR codes generated.`
  );
};

const resetGenerateDialog = () => {
  generateStep.value = 1;
  generationConfig.quantity = 10;
  generationConfig.accessLevelsId = null;
  generationConfig.qraccess = true;
  generationProgress.value = {
    current: 0,
    total: 0,
    percentage: 0,
    completed: false,
  };
  generationResults.value = { success: 0, failed: 0, total: 0 };
  generationLog.value = [];
  generatedQRs.value = [];
  isGenerating.value = false;
  generationController.value = null;
};

/*  LOG HELPERS  */
const getLogClass = (t) => `log-${t}`;
const getLogColor = (t) =>
  ({ success: "success", error: "error", warning: "warning", info: "info" })[
    t
  ] || "grey";
const getLogIcon = (t) =>
  ({
    success: "mdi-check-circle",
    error: "mdi-alert-circle",
    warning: "mdi-alert",
    info: "mdi-information",
  })[t] || "mdi-circle";

/*  LIFECYCLE */
onMounted(async () => {
  await Promise.all([fetchQRData(), fetchAccessLevels()]);
});

watch(search, () => debouncedSearch());
</script>

<style scoped>
.qr-management-container {
  display: flex;
  height: 100vh;
  position: relative;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.main-content.full-width {
  margin-left: 0;
}

.generate-btn {
  margin-right: 12px;
}

/* QR Code Cell */
.qr-code-cell {
  display: flex;
  align-items: center;
}

.qr-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.qr-preview:hover {
  background-color: #f5f5f5;
}

.qr-text {
  font-size: 0.875rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

/* Generate Dialog Styles */
.generate-dialog {
  border-radius: 12px;
}

.generate-steps {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  gap: 48px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.step.active .step-number {
  background: #1976d2;
  color: white;
}

.step-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.config-actions {
  display: flex;
  justify-content: center;
}

.progress-section {
  max-width: 600px;
  margin: 0 auto;
}

.stats-row {
  margin: 0 -8px;
}

.stats-row .col {
  padding: 8px;
}

.generation-log {
  max-height: 300px;
  overflow: hidden;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
}

.log-success {
  border-left: 4px solid #4caf50;
}

.log-error {
  border-left: 4px solid #f44336;
}

.log-warning {
  border-left: 4px solid #ff9800;
}

.log-info {
  border-left: 4px solid #2196f3;
}

.generation-actions {
  display: flex;
  justify-content: center;
}

/* Download Section */
.download-option {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.download-option:hover {
  border-color: #1976d2;
}

.download-actions {
  display: flex;
  justify-content: center;
}

/* QR Preview */
.qr-preview-container {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.qr-canvas {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.qr-info {
  text-align: left;
}

/* Responsive - FIXED MEDIA QUERY */
@media (max-width: 768px) {
  .qr-management-container {
    flex-direction: column;
    align-items: center;
  }

  .main-content {
    margin-left: 0 !important;
  }

  .generate-steps {
    gap: 24px;
  }

  .step-label {
    font-size: 10px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .stats-row .col {
    margin-bottom: 8px;
  }
}
</style>

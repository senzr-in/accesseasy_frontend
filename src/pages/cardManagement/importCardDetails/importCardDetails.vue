<template>
  <div class="card-management-container">
    <!-- Main Content -->
    <div class="main-content full-width">
      <DataTableWrapper
        v-model:searchQuery="search"
        :showSearch="true"
        :searchPlaceholder="'Search Card Details'"
        :isEmpty="filteredCardManagementData.length === 0 && !search"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
        <!-- Import Button (updated to BaseButton) -->
        <template #toolbar-actions>
          <BaseButton
            variant="primary"
            @click="showAddCardDialog = true"
            prepend-icon="mdi-plus"
            class="add-card-btn mr-2"
          >
            Add Card
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="showImportDialog = true"
            prepend-icon="mdi-file-import"
            class="import-btn"
          >
            Import Cards
          </BaseButton>
        </template>

        <!-- Table content states -->
        <div v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="cardManagementData.length || 10"
            :columns="columns.length"
          />
        </div>

        <div v-else-if="error">
          <ErrorState
            title="Unable to load card details"
            :message="error"
            @retry="fetchCardManagementData"
          />
        </div>

        <div v-else-if="filteredCardManagementData.length === 0">
          <EmptyState
            title="No card details found"
            message="Try adjusting your filters or search term"
            :primaryAction="{ text: 'Clear Filters' }"
            @primaryAction="clearFilters"
          />
        </div>

        <div v-else>
          <DataTable
            :items="filteredCardManagementData"
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
            <!-- RFID Card Column -->
            <template #cell-rfidCard="{ item }">
              <span>{{ item.rfidCard || "N/A" }}</span>
            </template>

            <!-- Type Column -->
            <template #cell-type="{ item }">
              <v-chip
                :color="getTypeColor(item.type)"
                size="small"
                label
                variant="tonal"
              >
                {{ item.type }}
              </v-chip>
            </template>

            <!-- Card Access Column -->
            <template #cell-cardAccess="{ item }">
              <v-chip
                :color="item.cardAccess ? 'success' : 'error'"
                size="small"
                label
              >
                {{ item.cardAccess ? "Enable" : "Disable" }}
              </v-chip>
            </template>

            <!-- Access Level Array Column -->
            <!-- <template #cell-cardAccessLevelArray="{ item }">
              <span>{{ item.cardAccessLevelArray || "N/A" }}</span>
            </template> -->

            <!-- Access Level Hex Column -->
            <!-- <template #cell-cardAccessLevelHex="{ item }">
              <span>{{ item.cardAccessLevelHex || "N/A" }}</span>
            </template> -->
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
    <v-dialog v-model="showAddCardDialog" max-width="600px" persistent>
      <v-card class="add-card-dialog">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-plus</v-icon>
          Add New Card
          <v-spacer></v-spacer>
          <BaseButton
            icon
            @click="closeAddCardDialog"
            :disabled="isAddingCard"
            variant="text"
          >
            <v-icon>mdi-close</v-icon>
          </BaseButton>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="addCardForm" v-model="addCardFormValid">
            <!-- Card Number Field -->
            <v-text-field
              v-model="newCard.cardNumber"
              label="Card Number *"
              variant="outlined"
              :rules="cardNumberRules"
              required
              class="mb-4"
            ></v-text-field>

            <!-- Access Level Number Field -->
            <v-select
              v-model="selectedAccessLevel"
              :items="accessLevels"
              label="Access Level"
              item-title="title"
              item-value="value"
              variant="outlined"
              :loading="accessLevelsLoading"
              clearable
              placeholder="Select access level (optional)"
              class="mb-4"
            ></v-select>
            <!-- Type Field -->
            <v-select
              v-model="newCard.type"
              label="Card Type *"
              :items="cardTypes"
              variant="outlined"
              :rules="typeRules"
              required
              class="mb-6"
            ></v-select>

            <div class="add-card-actions d-flex justify-end">
              <BaseButton
                variant="outlined"
                @click="closeAddCardDialog"
                class="mr-2"
                :disabled="isAddingCard"
              >
                CANCEL
              </BaseButton>
              <BaseButton
                color="primary"
                @click="saveSingleCard"
                :disabled="!addCardFormValid || isAddingCard"
                :loading="isAddingCard"
                prepend-icon="mdi-content-save"
              >
                SAVE CARD
              </BaseButton>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Import Cards Dialog -->
    <v-dialog v-model="showImportDialog" max-width="800px" persistent>
      <v-card class="import-dialog">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-file-import</v-icon>
          Import Cards from Excel
          <v-spacer></v-spacer>
          <BaseButton
            icon
            @click="closeImportDialog"
            :disabled="isImporting"
            variant="text"
          >
            <v-icon>mdi-close</v-icon>
          </BaseButton>
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Import Steps -->
          <div class="import-steps">
            <div class="step" :class="{ active: importStep === 1 }">
              <div class="step-number">1</div>
              <div class="step-label">Upload Excel File</div>
            </div>
            <div class="step" :class="{ active: importStep === 2 }">
              <div class="step-number">2</div>
              <div class="step-label">Preview Data</div>
            </div>
            <div class="step" :class="{ active: importStep === 3 }">
              <div class="step-number">3</div>
              <div class="step-label">Import Cards</div>
            </div>
          </div>

          <!-- Step 1: File Upload -->
          <div v-if="importStep === 1" class="upload-section">
            <div class="text-center pa-4">
              <v-icon size="64" color="primary" class="mb-4"
                >mdi-file-excel</v-icon
              >
              <h3 class="mb-2">Upload Excel File</h3>
              <p class="text-medium-emphasis mb-6">
                Upload an Excel file (.xlsx, .xls) containing card numbers
              </p>

              <!-- Download Template -->
              <BaseButton
                color="secondary"
                variant="outlined"
                class="mb-4"
                @click="downloadTemplate"
                prepend-icon="mdi-download"
              >
                Download Template
              </BaseButton>

              <v-file-input
                v-model="importFile"
                accept=".xlsx,.xls"
                label="Choose Excel file"
                variant="outlined"
                prepend-icon="mdi-paperclip"
                @update:model-value="handleFileSelect"
                :error-messages="fileError"
                hide-details
                class="mb-4"
              ></v-file-input>

              <div class="file-requirements">
                <h4 class="mb-2">File Requirements:</h4>
                <ul class="text-caption text-medium-emphasis">
                  <li>File must be in Excel format (.xlsx or .xls)</li>
                  <li>First column should contain card numbers</li>
                  <li>Second column should contain access level numbers</li>
                </ul>
              </div>

              <!-- Import button (appears only after file selected) -->
              <div class="mt-6" v-if="importFile">
                <BaseButton
                  color="primary"
                  size="large"
                  @click="startImportFromFile"
                  :disabled="isImporting"
                  prepend-icon="mdi-import"
                >
                  IMPORT CARDS
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Step 2: Data Preview -->
          <div v-else-if="importStep === 2" class="preview-section">
            <v-card variant="outlined">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-table-eye</v-icon>
                Preview Import Data
                <v-spacer></v-spacer>
                <span class="text-caption text-medium-emphasis">
                  {{ previewData.length }} cards found
                </span>
              </v-card-title>

              <v-card-text>
                <div class="preview-table-container">
                  <v-table density="comfortable" class="preview-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Card Number</th>
                        <th>Access Level Number</th>
                        <th>Access Level Name</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in previewData" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.cardNumber }}</td>
                        <td>{{ item.accessLevelNumber || "N/A" }}</td>
                        <td>{{ item.accessLevelName || "N/A" }}</td>
                        <td>
                          <v-chip size="small" variant="tonal">
                            {{ item.type }}
                          </v-chip>
                        </td>
                        <td>
                          <v-icon
                            :color="item.valid ? 'success' : 'error'"
                            size="small"
                          >
                            {{ item.valid ? "mdi-check" : "mdi-alert" }}
                          </v-icon>
                          <span class="ml-1">
                            {{ item.valid ? "Valid" : "Invalid" }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>

                <div class="preview-actions mt-4">
                  <BaseButton
                    variant="outlined"
                    @click="importStep = 1"
                    prepend-icon="mdi-arrow-left"
                    class="mr-2"
                  >
                    BACK
                  </BaseButton>
                  <BaseButton
                    color="primary"
                    @click="startImport"
                    :disabled="!hasValidCards"
                    prepend-icon="mdi-import"
                  >
                    START IMPORT
                  </BaseButton>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Step 3: Import Progress -->
          <div v-else-if="importStep === 3" class="import-section">
            <v-card variant="outlined">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-progress-upload</v-icon>
                Importing Cards...
                <v-spacer></v-spacer>
                <span class="text-caption">
                  {{ importProgress.current }}/{{ importProgress.total }}
                </span>
              </v-card-title>

              <v-card-text>
                <!-- Progress Bar -->
                <div class="progress-section mb-6">
                  <v-progress-linear
                    v-model="importProgress.percentage"
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
                    Processing: {{ currentImportingCard }}
                  </div>
                </div>

                <!-- Progress Stats -->
                <v-row class="stats-row">
                  <v-col cols="3">
                    <v-card
                      variant="flat"
                      color="success"
                      class="text-center pa-3"
                    >
                      <div class="text-h6">{{ importResults.success }}</div>
                      <div class="text-caption">Success</div>
                    </v-card>
                  </v-col>
                  <v-col cols="3">
                    <v-card
                      variant="flat"
                      color="error"
                      class="text-center pa-3"
                    >
                      <div class="text-h6">{{ importResults.failed }}</div>
                      <div class="text-caption">Failed</div>
                    </v-card>
                  </v-col>
                  <v-col cols="3">
                    <v-card
                      variant="flat"
                      color="warning"
                      class="text-center pa-3"
                    >
                      <div class="text-h6">{{ importResults.duplicate }}</div>
                      <div class="text-caption">Duplicate</div>
                    </v-card>
                  </v-col>
                  <v-col cols="3">
                    <v-card
                      variant="flat"
                      color="info"
                      class="text-center pa-3"
                    >
                      <div class="text-h6">{{ importResults.total }}</div>
                      <div class="text-caption">Total</div>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Import Log -->
                <div class="import-log mt-6">
                  <h4 class="mb-2">Import Log</h4>
                  <v-card variant="outlined" class="log-container">
                    <v-card-text class="pa-0">
                      <v-list density="compact">
                        <v-list-item
                          v-for="(log, index) in importLog"
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

                <div class="import-actions mt-4">
                  <BaseButton
                    v-if="importProgress.completed"
                    color="primary"
                    @click="finishImport"
                    prepend-icon="mdi-check"
                  >
                    FINISH
                  </BaseButton>
                  <BaseButton
                    v-else
                    color="error"
                    variant="outlined"
                    @click="cancelImport"
                    :disabled="!isImporting"
                    prepend-icon="mdi-cancel"
                  >
                    CANCEL IMPORT
                  </BaseButton>
                </div>
              </v-card-text>
            </v-card>
          </div>
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
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { convertToCardAccessHex } from "@/utils/helpers/convertToCardAccessHex.js";
import { debounce } from "lodash";
import { useRouter } from "vue-router";
import * as XLSX from "xlsx";

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

const showImportDialog = ref(false);
const importStep = ref(1);
const importFile = ref(null);
const fileError = ref("");
const previewData = ref([]);
const importProgress = ref({
  current: 0,
  total: 0,
  percentage: 0,
  completed: false,
});
const importResults = ref({
  success: 0,
  failed: 0,
  duplicate: 0,
  total: 0,
});
const importLog = ref([]);
const currentImportingCard = ref("");
const isImporting = ref(false);
const importController = ref(null);
const showAddCardDialog = ref(false);
const isAddingCard = ref(false);
const addCardForm = ref(null);
const addCardFormValid = ref(false);
const accessLevels = ref([]);
const accessLevelsLoading = ref(false);
const selectedAccessLevel = ref(null);
const newCard = reactive({
  cardNumber: "",
  // accessLevelNumber: "",
  // accessLevelName: "",
  type: "rfid",
});
// Form validation rules
const cardNumberRules = [
  (value) => !!value || "Card number is required",
  (value) => (value && value.length > 0) || "Card number is required",
];

const typeRules = [(value) => !!value || "Card type is required"];

const cardTypes = [
  { title: "RFID", value: "rfid" },
  { title: "Tag", value: "tag" },
];
/*  Notification State  */
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

/*  COMPUTED  */
const columns = computed(() => [
  { key: "rfidCard", label: "RFID Card", sortable: true, width: "150px" },
  { key: "type", label: "Type", sortable: true, width: "100px" },
  { key: "cardAccess", label: "Card Access", sortable: true, width: "120px" },
  // {
  //   key: "cardAccessLevelArray",
  //   label: "Access Level Array",
  //   sortable: false,
  //   width: "180px",
  // },
  // {
  //   key: "cardAccessLevelHex",
  //   label: "Access Level Hex",
  //   sortable: false,
  //   width: "150px",
  // },
]);

const hasValidCards = computed(() =>
  previewData.value.some((item) => item.valid)
);

const filteredCardManagementData = computed(() =>
  cardManagementData.value.map((item) => ({
    ...item,
    rfidCard: item.rfidCard || "N/A",
    type: item.type || "N/A",
    cardAccess: item.cardAccess ?? false,
    cardAccessLevelArray: item.cardAccessLevelArray || "N/A",
    cardAccessLevelHex: item.cardAccessLevelHex || "N/A",
  }))
);

/* DATA  */
const cardManagementData = ref([]);

/*  HELPERS */
const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case "rfid":
      return "primary";
    case "tag":
      return "info";
    default:
      return "grey";
  }
};

const showSuccessMessage = (msg) => {
  successMessage.value = msg;
  showSuccessSnackbar.value = true;
};
const showErrorMessage = (msg) => {
  errorMessage.value = msg;
  showErrorSnackbar.value = true;
};
const fetchAccessLevels = async () => {
  if (!token || !tenantId) return;

  accessLevelsLoading.value = true;
  try {
    const params = new URLSearchParams();
    params.append("fields[]", "id");
    params.append("fields[]", "accessLevelNumber");
    params.append("fields[]", "accessLevelName");
    params.append("fields[]", "accessType");
    params.append("fields[]", "tenant.tenantId");
    params.append("filter[_and][0][_and][0][tenant][tenantId][_eq]", tenantId);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Failed to load access levels");

    const result = await response.json();
    accessLevels.value = (result.data || [])
      .map((item) => ({
        title: `${item.accessLevelNumber} - ${item.accessLevelName}`,
        value: item.accessLevelNumber,
        name: item.accessLevelName,
        id: item.id,
      }))
      .sort((a, b) => a.value - b.value); // Sort by number
  } catch (err) {
    console.error("Error fetching access levels:", err);
    showErrorMessage("Failed to load access levels");
    accessLevels.value = [];
  } finally {
    accessLevelsLoading.value = false;
  }
};
/*  API  */
const aggregateCount = async () => {
  try {
    if (!token || !tenantId)
      throw new Error("Authentication required or tenant not found");
    const params = buildFilterParams();
    params["aggregate[count]"] = "id";
    const queryString = buildQueryString(params);
    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?${queryString}`,
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
    error.value = "Failed to load card count";
  }
};

const buildFilterParams = () => {
  const params = {
    "filter[_and][0][_and][0][tenant][tenantId][_eq]": tenantId,
  };
  if (search.value) {
    if (!isNaN(search.value)) {
      params["filter[_or][0][rfidCard][_eq]"] = search.value;
      params["filter[_or][1][cardAccessLevelArray][_icontains]"] = search.value;
    } else {
      params["filter[_or][0][type][_icontains]"] = search.value;
      params["filter[_or][1][cardAccessLevelArray][_icontains]"] = search.value;
    }
  }
  return params;
};

const buildQueryString = (params) => {
  const qp = new URLSearchParams();
  const fields = [
    "id",
    "tenant.tenantId",
    "cardAccessLevelArray",
    "cardAccessLevelHex",
    "rfidCard",
    "type",
    "cardAccess",
  ];
  fields.forEach((f) => qp.append("fields[]", f));
  Object.keys(params).forEach((k) => {
    if (Array.isArray(params[k])) params[k].forEach((v) => qp.append(k, v));
    else qp.append(k, params[k]);
  });
  qp.append("sort", sortBy.value[0]?.key || "rfidCard");
  qp.append("page", page.value);
  qp.append("limit", itemsPerPage.value);
  return qp.toString();
};

const fetchCardManagementData = async () => {
  try {
    loading.value = true;
    error.value = null;
    await aggregateCount();
    const queryString = buildQueryString(buildFilterParams());
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?${queryString}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    cardManagementData.value = data.data;
  } catch (err) {
    console.error("Error fetching card data:", err);
    error.value = err.message || "Failed to load card data";
  } finally {
    loading.value = false;
  }
};
const saveSingleCard = async () => {
  if (!addCardFormValid.value) return;

  isAddingCard.value = true;

  try {
    // Check duplicate
    const checkResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[rfidCard][_eq]=${newCard.cardNumber}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { data: existingCards } = await checkResponse.json();
    if (existingCards?.length) throw new Error("Card already exists");

    // Determine access level ID
    let accessLevelsId = 0;
    if (
      selectedAccessLevel.value !== null &&
      selectedAccessLevel.value !== undefined
    ) {
      const selected = accessLevels.value.find(
        (al) => al.value === selectedAccessLevel.value
      );
      if (selected) accessLevelsId = selected.value;
    }

    const payload = {
      rfidCard: newCard.cardNumber,
      type: newCard.type,
      cardAccess: true,
      accessLevelsId: accessLevelsId,
      cardAccessLevelArray: `${newCard.cardNumber}:1:${accessLevelsId}`,
      cardAccessLevelHex: convertToCardAccessHex(
        newCard.cardNumber,
        true,
        accessLevelsId
      ),
      tenant: tenantId,
    };

    const createResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to create card"
      );
    }

    showSuccessMessage(`Card "${newCard.cardNumber}" added successfully!`);
    closeAddCardDialog();
    fetchCardManagementData();
  } catch (err) {
    showErrorMessage(err.message || "Failed to add card");
  } finally {
    isAddingCard.value = false;
  }
};

const closeAddCardDialog = () => {
  showAddCardDialog.value = false;
  resetAddCardForm();
};

const resetAddCardForm = () => {
  newCard.cardNumber = "";
  newCard.type = "rfid";
  selectedAccessLevel.value = null; // Reset dropdown
  if (addCardForm.value) addCardForm.value.reset();
};
/*  SORT / PAGINATION  */
const debouncedSearch = debounce(() => {
  page.value = 1;
  fetchCardManagementData();
}, 300);

const clearFilters = () => {
  search.value = "";
  page.value = 1;
  fetchCardManagementData();
};

const updateSortBy = (newSortBy) => {
  sortBy.value = [{ key: newSortBy, order: sortBy.value[0]?.order || "asc" }];
};
const updateSortDirection = (newDir) => {
  sortBy.value = [{ key: sortBy.value[0]?.key || "", order: newDir }];
};
const handleSort = ({ field, direction }) => {
  sortBy.value = [{ key: field, order: direction }];
  fetchCardManagementData();
};
const handlePageChange = (p) => {
  page.value = p;
  fetchCardManagementData();
};
const handleItemsPerPageChange = (n) => {
  itemsPerPage.value = n;
  page.value = 1;
  fetchCardManagementData();
};

/*  IMPORT LOGIC */
const downloadTemplate = () => {
  // Create worksheet with wider columns for better header visibility
  const data = [
    ["Card Number", "Access Level Number", "Access Level Name"],
    ["1234567890", "1", "Main Entrance"],
    ["0987654321", "2", "Staff Area"],
    ["1122334455", "3", "Admin Section"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths for better visibility
  const colWidths = [
    { wch: 15 }, // Card Number - wider
    { wch: 20 }, // Access Level Number - wider
    { wch: 25 }, // Access Level Name - widest
  ];
  ws["!cols"] = colWidths;

  // Style the header row
  const headerRange = XLSX.utils.decode_range(ws["!ref"]);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[cellAddress]) {
      // Make header bold
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "D3D3D3" } }, // Light gray background
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Card Import Template");
  XLSX.writeFile(wb, "card-import-template.xlsx");
};

const handleFileSelect = async (file) => {
  fileError.value = "";
  if (!file) return;
  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (!validTypes.includes(file.type)) {
    fileError.value = "Please select a valid Excel file (.xlsx or .xls)";
    return;
  }
  try {
    await readExcelFile(file);
    importStep.value = 2; // go straight to preview
  } catch (e) {
    fileError.value = "Error reading file: " + e.message;
  }
};

const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        processExcelData(json);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

/* ---- No 10-digit rule & no 1000-card limit ---- */
const processExcelData = (raw) => {
  previewData.value = [];

  // Find column indices
  const headers = raw[0]?.map((h) => h?.toString().toLowerCase().trim()) || [];
  const cardNumberIndex = headers.findIndex(
    (h) => h.includes("card") && h.includes("number")
  );
  const accessLevelNumberIndex = headers.findIndex(
    (h) => h.includes("access") && h.includes("level") && h.includes("number")
  );
  const accessLevelNameIndex = headers.findIndex(
    (h) => h.includes("access") && h.includes("level") && h.includes("name")
  );
  // If no proper headers, assume first row is data
  const startRow = cardNumberIndex !== -1 ? 1 : 0;

  for (let i = startRow; i < raw.length; i++) {
    const row = raw[i];
    const cardNumber =
      cardNumberIndex !== -1
        ? String(row[cardNumberIndex] || "").trim()
        : String(row[0] || "").trim();

    const accessLevelNumber =
      accessLevelNumberIndex !== -1
        ? String(row[accessLevelNumberIndex] || "").trim()
        : "";
    const accessLevelName =
      accessLevelNameIndex !== -1
        ? String(row[accessLevelNameIndex] || "").trim()
        : "";
    if (cardNumber) {
      previewData.value.push({
        cardNumber,
        accessLevelNumber: accessLevelNumber || null,
        accessLevelName: accessLevelName || null,
        type: "rfid",
        valid: true,
        rowIndex: i + 1,
        error: null,
      });
    }
  }
};

/* ---- Import from Step 1 (after file chosen) ---- */
const startImportFromFile = () => {
  if (!importFile.value) return;
  const valid = previewData.value.filter((i) => i.valid);
  if (valid.length === 0) {
    showErrorMessage("No card numbers found in the file");
    return;
  }
  importStep.value = 3;
  startImport();
};

/* ---- Existing startImport (used from preview or from Step 1) ---- */
const startImport = () => {
  const cards = previewData.value.filter((i) => i.valid);
  if (cards.length === 0) {
    showErrorMessage("No valid cards to import");
    return;
  }

  importStep.value = 3;
  importResults.value = {
    success: 0,
    failed: 0,
    duplicate: 0,
    total: cards.length,
  };
  importProgress.value = {
    current: 0,
    total: cards.length,
    percentage: 0,
    completed: false,
  };
  importLog.value = [];
  isImporting.value = true;
  importCards(cards);
};

const importCards = async (cards) => {
  importController.value = new AbortController();
  const signal = importController.value.signal;

  importResults.value = {
    success: 0,
    failed: 0,
    duplicate: 0,
    total: cards.length,
  };

  for (let i = 0; i < cards.length; i++) {
    if (signal.aborted) break;

    const card = cards[i];
    currentImportingCard.value = card.cardNumber;

    try {
      await importSingleCard(card);
      importResults.value.success++;
      importLog.value.unshift({
        type: "success",
        message: `Successfully imported card: ${card.cardNumber}`,
      });
    } catch (e) {
      if (e.message.includes("already exists")) {
        importResults.value.duplicate++;
        importLog.value.unshift({
          type: "warning",
          message: `Card already exists: ${card.cardNumber}`,
        });
      } else {
        importResults.value.failed++;
        importLog.value.unshift({
          type: "error",
          message: `Failed ${card.cardNumber}: ${e.message}`,
        });
      }
    }

    importProgress.value.current = i + 1;
    importProgress.value.percentage = ((i + 1) / cards.length) * 100;

    // Small delay to prevent overwhelming the API
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  importProgress.value.completed = true;
  isImporting.value = false;

  // Final summary log
  importLog.value.unshift({
    type: "info",
    message: `Import finished – ${importResults.value.success} success, ${importResults.value.failed} failed, ${importResults.value.duplicate} duplicates`,
  });
};
const resolveAccessLevel = async (card) => {
  if (card.accessLevelName) {
    try {
      const token = authService.getToken();
      const tenantId = currentUserTenant.getTenantId();

      const queryParams = new URLSearchParams({
        "filter[_and][0][_and][0][tenant][tenantId][_eq]": tenantId,
        "filter[_and][0][_and][1][accessLevelName][_icontains]":
          card.accessLevelName,
        "fields[]": "id,accessLevelNumber,accessLevelName",
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/accesslevels?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: importController.value?.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch access level: ${response.status}`);
      }

      const { data: accessLevels } = await response.json();

      if (!accessLevels || accessLevels.length === 0) {
        throw new Error(`Access level not found: "${card.accessLevelName}"`);
      }

      // Use the first matching access level
      const accessLevel = accessLevels[0];
      return {
        accessLevelsId: accessLevel.accessLevelNumber,
        accessLevelName: accessLevel.accessLevelName,
      };
    } catch (error) {
      throw new Error(`Access level lookup failed: ${error.message}`);
    }
  }

  // If accessLevelNumber is provided, use it directly
  if (card.accessLevelNumber) {
    // ← fixed here (was cardData)
    const accessLevelsId = parseInt(card.accessLevelNumber);
    if (isNaN(accessLevelsId)) {
      throw new Error(
        `Invalid access level number: "${card.accessLevelNumber}"`
      );
    }
    return {
      accessLevelsId: accessLevelsId,
      accessLevelName: null,
    };
  }

  // No access level provided → default to 0
  return {
    accessLevelsId: 0,
    accessLevelName: null,
  };
};
const importSingleCard = async (card) => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  if (!token || !tenantId) {
    throw new Error("Authentication required");
  }

  // Check for duplicate card
  const checkResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[rfidCard][_eq]=${card.cardNumber}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: importController.value?.signal,
    }
  );

  if (!checkResponse.ok) {
    throw new Error("Failed to check card existence");
  }

  const { data: existingCards } = await checkResponse.json();
  if (existingCards?.length) {
    throw new Error("Card already exists");
  }

  // Resolve access level (either by name or number)
  const accessLevelInfo = await resolveAccessLevel(card);
  const accessLevelsId = accessLevelInfo.accessLevelsId;

  // Prepare payload
  const payload = {
    rfidCard: card.cardNumber,
    type: card.type,
    cardAccess: true,
    accessLevelsId: accessLevelsId,
    cardAccessLevelArray: `${card.cardNumber}:1:${accessLevelsId}`,
    cardAccessLevelHex: convertToCardAccessHex(
      card.cardNumber,
      true,
      accessLevelsId
    ),
    tenant: tenantId,
  };

  // Create card
  const createResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/items/cardManagement`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: importController.value?.signal,
    }
  );

  if (!createResponse.ok) {
    const errorData = await createResponse.json();
    throw new Error(errorData.errors?.[0]?.message || "Failed to create card");
  }

  return createResponse.json();
};

const cancelImport = () => {
  if (importController.value) importController.value.abort();
  isImporting.value = false;
  importLog.value.unshift({
    type: "warning",
    message: "Import cancelled by user",
  });
};

const finishImport = () => {
  const successCount = importResults.value.success;
  showImportDialog.value = false;
  resetImportDialog();
  fetchCardManagementData();

  if (successCount > 0) {
    showSuccessMessage(`Import completed! ${successCount} cards imported.`);
  } else {
    showSuccessMessage("Import completed!");
  }
};

const closeImportDialog = () => {
  if (isImporting.value && !confirm("Import in progress. Cancel?")) return;
  if (isImporting.value) cancelImport();
  showImportDialog.value = false;
  resetImportDialog();
};

const resetImportDialog = () => {
  importStep.value = 1;
  importFile.value = null;
  fileError.value = "";
  previewData.value = [];
  importProgress.value = {
    current: 0,
    total: 0,
    percentage: 0,
    completed: false,
  };
  importResults.value = { success: 0, failed: 0, duplicate: 0, total: 0 };
  importLog.value = [];
  currentImportingCard.value = "";
  isImporting.value = false;
  importController.value = null;
};

/* ---- Log helpers ---- */
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

onMounted(async () => await fetchCardManagementData());
watch(showAddCardDialog, (newVal) => {
  if (newVal) {
    fetchAccessLevels();
  }
});
watch(search, () => debouncedSearch());
</script>

<style scoped>
.card-management-container {
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

.import-btn {
  margin-right: 12px;
}

/* Import Dialog Styles */
.import-dialog {
  border-radius: 12px;
}

.import-steps {
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

.upload-section {
  text-align: center;
}

.file-requirements {
  text-align: left;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.file-requirements h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.file-requirements ul {
  margin: 0;
  padding-left: 20px;
}

.preview-table-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.preview-table {
  width: 100%;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.import-log {
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

.import-actions {
  display: flex;
  justify-content: center;
}

/* Make table rows clickable */
:deep(.data-table-row) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.data-table-row:hover) {
  background-color: #f8fafc;
}

/* Responsive */
@media (max-width: 768px) {
  .card-management-container {
    flex-direction: column;
  }

  .main-content {
    margin-left: 0 !important;
  }

  .import-steps {
    gap: 24px;
  }

  .step-label {
    font-size: 10px;
  }

  .preview-actions {
    flex-direction: column;
  }

  .stats-row .col {
    margin-bottom: 8px;
  }
}
</style>

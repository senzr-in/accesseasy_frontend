<template>
  <v-container fluid class="pa-4 pa-md-6 h-100">
    <v-row>
      <!-- Toast Container -->
      <ToastContainer ref="toastContainer" />
    </v-row>

    <v-row>
      <!-- Main Content - Holiday Table -->
      <v-col cols="12" class="h-100">
        <!-- All Holidays Table View - Main Content -->
        <DataTableWrapper
          :show-search="false"
          wrapper-class="holidays-table-wrapper"
          :is-loading="isLoading"
        >
          <!-- Toolbar Actions Slot -->
          <template #toolbar-actions>
            <div class="d-flex justify-space-between align-center w-100">
              <div class="d-flex align-center">
                <v-menu
                  v-model="yearMenu"
                  :close-on-content-click="false"
                  location="bottom"
                >
                  <template #activator="{ props }">
                    <div
                      v-bind="props"
                      class="dropdown-button d-flex align-center pa-2"
                      style="
                        border: 1px solid #e0e0e0;
                        border-radius: 4px;
                        cursor: pointer;
                        min-width: 100px;
                      "
                    >
                      <span>{{ selectedYear.toString() }}</span>
                      <v-icon icon="mdi-chevron-down" class="ml-2"></v-icon>
                    </div>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="year in availableYearsForSelection"
                      :key="year"
                      :value="year"
                      @click="handleYearSelect({ value: year })"
                    >
                      <v-list-item-title>{{ year }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <div class="stats-container ml-4">
                  <div class="stat-item total--text">
                    <span class="stat-value">{{ sortedHolidays.length }}</span>
                    <span class="stat-title">Holidays</span>
                  </div>
                </div>
              </div>
              <div class="d-flex button-group">
                <BaseButton
                  text="Add Holiday"
                  :left-icon="{
                    render: () => h(VIcon, { icon: 'mdi-plus', size: 16 }),
                  }"
                  variant="primary"
                  size="md"
                  @click="handleAddHolidayClick"
                  class="text-none rounded-lg"
                />
              </div>
            </div>
          </template>

          <!-- Table Content Slot -->
          <template v-if="!isLoading">
            <DataTable
              :items="sortedHolidays"
              :columns="holidayColumns"
              :sort-by="sortBy"
              :sort-direction="sortDirection"
              @update:sortBy="sortBy = $event"
              @update:sortDirection="sortDirection = $event"
              @sort="handleHolidaySort"
              @delete="showDeleteConfirm"
            >
              <!-- Date Cell -->
              <template #cell-date="{ item }">
                <div class="date-cell">
                  <div class="date-badge">
                    <div class="date-month">{{ getMonthShort(item.date) }}</div>
                    <div class="date-day">{{ getDayFromDate(item.date) }}</div>
                  </div>
                </div>
              </template>

              <!-- Event Name Cell -->
              <template #cell-event="{ item }">
                <div class="event-name-cell">
                  <span class="event-name-text">{{ item.event }}</span>
                </div>
              </template>

              <!-- Organizations Cell -->
              <template #cell-branches="{ item }">
                <div class="branch-chips">
                  <template v-if="item.branches && item.branches.length > 0">
                    <template v-if="item.branches.length === branches.length">
                      <v-chip
                        size="small"
                        color="primary"
                        variant="tonal"
                        class="mr-1 mb-1"
                        @click="showBranches(item)"
                      >
                        <v-icon
                          icon="mdi-map-marker"
                          size="12"
                          class="mr-1"
                        ></v-icon>
                        All Branches
                      </v-chip>
                    </template>
                    <template v-else>
                      <v-chip
                        size="small"
                        color="#059367"
                        variant="tonal"
                        class="mr-1 mb-1"
                      >
                        <v-icon
                          icon="mdi-map-marker"
                          size="12"
                          class="mr-1"
                        ></v-icon>
                        {{
                          item.branches[0].locationName || "Unknown Location"
                        }}
                      </v-chip>
                      <v-chip
                        v-if="item.branches.length > 1"
                        size="small"
                        color="grey"
                        variant="tonal"
                        class="mr-1 mb-1 view-more-chip"
                        @click="showBranches(item)"
                      >
                        + {{ item.branches.length - 1 }} more
                      </v-chip>
                    </template>
                  </template>
                  <v-chip
                    v-else
                    size="small"
                    color="grey"
                    variant="tonal"
                    class="mr-1 mb-1"
                  >
                    No Branches
                  </v-chip>
                </div>
              </template>

              <!-- Actions Cell -->
              <template #cell-actions="{ item }">
                <div class="action-section">
                  <ActionButton
                    text="Edit"
                    :icon="EditIcon"
                    variant="edit"
                    size="sm"
                    @click="handleEditHolidayClick(item)"
                    class="action-btn edit-btn"
                  />
                  <ActionButton
                    text="Delete"
                    :icon="TrashIcon"
                    variant="delete"
                    size="sm"
                    @click="showDeleteConfirm(item)"
                    class="action-btn delete-btn"
                  />
                </div>
              </template>
            </DataTable>
          </template>

          <!-- Skeleton Loader for Table -->
          <template v-else>
            <SkeletonLoading
              variant="data-table"
              :rows="5"
              :columns="4"
              animated
            />
          </template>

          <!-- Pagination Slot -->
          <template #pagination>
            <CustomPagination
              :page="currentPage"
              :items-per-page="itemsPerPage"
              :total-items="sortedHolidays.length"
              :is-searching="false"
              @update:page="handlePageChange"
              @update:items-per-page="handleItemsPerPageChange"
            />
          </template>
        </DataTableWrapper>

        <!-- Empty State -->
        <div
          v-if="!isLoading && !sortedHolidays.length"
          class="text-center py-8 empty-state"
        >
          <v-icon
            icon="mdi-calendar-blank-outline"
            size="64"
            color="grey-lighten-2"
            class="mb-3"
          ></v-icon>
          <div class="text-h6 text-medium-emphasis mb-2">No holidays yet</div>
          <div class="text-body-2 text-medium-emphasis">
            Add holidays for {{ selectedYear }} to get started
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Holiday Add/Edit Dialog -->
    <v-dialog v-model="showHolidayFormDialog" max-width="600px" persistent>
      <v-card class="dialog-card">
        <v-card-title class="pa-6 pb-4 dialog-header">
          <div class="d-flex align-center justify-space-between w-100">
            <h3 class="text-h6 font-weight-bold dialog-title">
              {{ isAddingHoliday ? "Add New Holiday" : "Edit Holiday" }}
            </h3>
            <v-btn
              icon="mdi-close"
              @click="cancelAction"
              variant="text"
              size="small"
              class="rounded-lg dialog-close-btn"
            ></v-btn>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0 dialog-content">
          <v-form ref="holidayForm" v-model="formValid">
            <v-text-field
              v-model="holidayNameModel"
              :label="isAddingHoliday ? 'Holiday Name' : 'Edit Holiday Name'"
              placeholder="Enter holiday name"
              variant="outlined"
              density="comfortable"
              class="mb-4 form-field pt-6"
              prepend-inner-icon="mdi-calendar-star"
              :rules="[(v) => !!v || 'Holiday name is required']"
            />

            <v-text-field
              v-model="selectedDate"
              :label="isAddingHoliday ? 'Date' : 'Edit Date'"
              type="date"
              variant="outlined"
              density="comfortable"
              class="mb-4 form-field"
              prepend-inner-icon="mdi-calendar"
              :rules="[(v) => !!v || 'Date is required']"
            />

            <!-- Branch Selection with Checkboxes -->
            <v-menu
              v-model="branchMenu"
              :close-on-content-click="false"
              location="bottom"
              max-height="300px"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  :model-value="selectedBranchesDisplay"
                  label="Select Branches"
                  placeholder="Choose branches"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4 form-field"
                  prepend-inner-icon="mdi-map-marker"
                  readonly
                  :rules="[
                    () =>
                      selectedBranches.length > 0 ||
                      'At least one branch is required',
                  ]"
                />
              </template>
              <v-card>
                <v-card-text class="pa-0">
                  <v-list density="compact">
                    <v-list-item>
                      <v-checkbox
                        v-model="selectAllBranches"
                        label="All Branches"
                        hide-details
                        density="compact"
                        @update:modelValue="toggleAllBranches"
                      />
                    </v-list-item>
                    <v-divider />
                    <v-list-item
                      v-for="branch in branches"
                      :key="branch.id"
                      :value="branch.id"
                    >
                      <v-checkbox
                        v-model="selectedBranches"
                        :label="branch.locationName"
                        :value="branch.id"
                        hide-details
                        density="compact"
                        @update:modelValue="updateSelectAll"
                      />
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-menu>

            <v-alert
              v-if="!selectedBranches.length"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              <template #prepend>
                <v-icon icon="mdi-information"></v-icon>
              </template>
              Please select at least one branch for this holiday
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-4 dialog-footer">
          <BaseButton
            text="Cancel"
            variant="danger"
            color="grey-darken-1"
            size="md"
            @click="cancelAction"
            class="footer-btn mr-3"
          />
          <BaseButton
            :text="isAddingHoliday ? 'Save Holiday' : 'Update Holiday'"
            :left-icon="{
              render: () => h(VIcon, { icon: 'mdi-check', size: 16 }),
            }"
            color="primary"
            size="md"
            @click="isAddingHoliday ? addHoliday() : updateHoliday()"
            :disabled="
              !formValid ||
              !holidayNameModel ||
              !selectedBranches.length ||
              !selectedDate
            "
            class="footer-btn primary-btn"
            variant="primary"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Assigned Branches Dialog -->
    <v-dialog v-model="showViewDialog" max-width="400px">
      <v-card>
        <v-card-title class="pa-6 pb-4 dialog-header">
          <div class="d-flex align-center justify-space-between w-100">
            <h3 class="text-h6 font-weight-bold dialog-title">
              Assigned Branches
            </h3>
            <v-btn
              icon="mdi-close"
              @click="showViewDialog = false"
              variant="text"
              size="small"
              class="rounded-lg dialog-close-btn"
            ></v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="branch in selectedHolidayForView?.branches"
              :key="branch.id"
            >
              <v-list-item-title>{{
                branch.locationName || "Unknown Location"
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-6 pt-4 dialog-footer">
          <v-spacer></v-spacer>
          <BaseButton
            text="Close"
            variant="danger"
            color="grey-darken-1"
            size="md"
            @click="showViewDialog = false"
            class="footer-btn"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDeleteModal
      :show="showDeleteDialog"
      title="Delete Holiday"
      confirmMessage="Are you sure you want to delete this holiday?"
      :itemLabel="'Holiday'"
      :itemName="holidayToDelete ? holidayToDelete.event : ''"
      description="This action cannot be undone and will remove the holiday from all associated organizations."
      cancelText="Cancel"
      confirmText="Delete"
      deletingText="Deleting..."
      :deleting="isDeleting"
      @close="closeDeleteDialog"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, h } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import ActionButton from "@/components/common/buttons/ActionButton.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";
import ConfirmDeleteModal from "@/components/common/modals/ConfirmDeleteModal.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import { VIcon } from "vuetify/components";
import { EditIcon, TrashIcon } from "lucide-vue-next";

const toastContainer = ref(null);
const showDeleteDialog = ref(false);
const holidayToDelete = ref(null);
const isDeleting = ref(false);
const isLoading = ref(true);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

const successMessage = ref("");
const errorMessage = ref("");
const formValid = ref(false);
const yearMenu = ref(false);
const branchMenu = ref(false); // New state for branch menu

// State for branches from locationManagement
const branches = ref([]);

// Table pagination state
const sortBy = ref("date");
const sortDirection = ref("asc");
const currentPage = ref(1);
const itemsPerPage = ref(25);

// State
const selectedYear = ref(new Date().getFullYear());
const selectedDate = ref(null);
const holidays = ref([]);
const selectedBranches = ref([]); // Changed default to empty array
const selectAllBranches = ref(false); // New state for "All Branches" checkbox
const isAddingHoliday = ref(false);
const newHolidayName = ref("");
const editingHoliday = ref(null);
const editedHolidayName = ref("");
const showHolidayFormDialog = ref(false);

// View Dialog State
const showViewDialog = ref(false);
const selectedHolidayForView = ref(null);

// Table columns definition
const holidayColumns = ref([
  { key: "date", label: "Date", sortable: false, width: "50px" },
  { key: "event", label: "Holiday Name", sortable: false, width: "200px" },
  {
    key: "branches",
    label: "Branch",
    sortable: false,
    width: "400px",
  },
  { key: "actions", label: "Actions", sortable: false, width: "100px" },
]);

// Computed Properties
const sortedHolidays = computed(() => {
  if (!Array.isArray(holidays.value)) return [];
  return [...holidays.value].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
});

const holidayNameModel = computed({
  get: () =>
    isAddingHoliday.value ? newHolidayName.value : editedHolidayName.value,
  set: (val) => {
    if (isAddingHoliday.value) {
      newHolidayName.value = val;
    } else {
      editedHolidayName.value = val;
    }
  },
});

const availableYearsForSelection = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = new Set();
  years.add(currentYear);
  for (let i = 1; i <= 5; i++) {
    years.add(currentYear - i);
    years.add(currentYear + i);
  }
  return Array.from(years).sort((a, b) => b - a);
});

const selectedBranchesDisplay = computed(() => {
  if (selectAllBranches.value) return "All Branches";
  if (selectedBranches.value.length === 0) return "";
  if (selectedBranches.value.length === branches.value.length)
    return "All Branches";
  const selected = branches.value
    .filter((branch) => selectedBranches.value.includes(branch.id))
    .map((branch) => branch.locationName);
  return selected.length > 2
    ? `${selected.slice(0, 2).join(", ")} (+${selected.length - 2} others)`
    : selected.join(", ");
});

// Toggle all branches
const toggleAllBranches = (value) => {
  if (value) {
    selectedBranches.value = branches.value.map((branch) => branch.id);
  } else {
    selectedBranches.value = [];
  }
};

// Update select all checkbox state
const updateSelectAll = () => {
  selectAllBranches.value =
    selectedBranches.value.length === branches.value.length;
};

// Fetch branches from locationManagement
const fetchBranches = async () => {
  try {
    const params = {
      "fields[]": [
        "orgLocation.orgName",
        "locSize",
        "locType",
        "locdetail",
        "locmark",
        "state",
        "id",
        "holidays",
      ],
      "filter[_and][0][_and][0][tenant][tenantId][_eq]": tenantId,
      "filter[_and][0][_and][1][locType][_eq]": "branch",
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key.startsWith("fields")) {
          return params[key].map((field) => `${key}=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch branches");
    }

    const data = await response.json();
    branches.value = (data.data || []).map((branch) => {
      let locationName = "Unknown Location";
      let orgName = branch.orgLocation?.orgName || "Unknown Organization";

      if (branch.locdetail) {
        if (typeof branch.locdetail === "object") {
          locationName = branch.locdetail.locationName || "Unknown Location";
        } else if (typeof branch.locdetail === "string") {
          try {
            const parsed = JSON.parse(branch.locdetail);
            locationName = parsed.locationName || "Unknown Location";
          } catch (e) {
            console.warn(
              `Failed to parse locdetail for branch ${branch.id}:`,
              branch.locdetail
            );
          }
        }
      }

      let holidays = branch.holidays;
      if (Array.isArray(branch.holidays)) {
        holidays = JSON.stringify(branch.holidays);
      } else if (branch.holidays && typeof branch.holidays !== "string") {
        console.warn(
          `Unexpected holidays format for branch ${branch.id}:`,
          branch.holidays
        );
        holidays = JSON.stringify([]);
      }

      return {
        ...branch,
        locationName,
        orgName,
        holidays,
      };
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    setErrorMessage("Failed to load branches. Please try again.");
    branches.value = [];
  }
};

// Fetch holidays
const fetchHolidays = async (year) => {
  try {
    isLoading.value = true;
    const branchIds = branches.value.map((branch) => branch.id);
    const holidaysByBranch = [];
    const tenantId = currentUserTenant.getTenantId();
    for (const branchId of branchIds) {
      const branch = branches.value.find((b) => b.id === branchId);
      let holidayIds = [];
      if (branch.holidays) {
        if (typeof branch.holidays === "string") {
          try {
            holidayIds = JSON.parse(branch.holidays);
            if (!Array.isArray(holidayIds)) {
              holidayIds = [];
            }
          } catch (e) {
            console.warn(
              `Invalid holidays JSON for branch ${branchId}:`,
              branch.holidays,
              e
            );
            holidayIds = [];
          }
        } else if (Array.isArray(branch.holidays)) {
          holidayIds = branch.holidays;
        } else {
          console.warn(
            `Unexpected holidays format for branch ${branchId}:`,
            branch.holidays
          );
          holidayIds = [];
        }
      }

      if (holidayIds.length === 0) {
        continue;
      }

      const params = {
        fields: ["id", "event", "date", "assignedYear"],
        "filter[id][_in]": holidayIds.join(","),
        "filter[assignedYear][_eq]": year,
        "filter[tenant][tenantId][_eq": tenantId,
      };

      const queryString = Object.keys(params)
        .map((key) => {
          if (key === "fields") {
            return params[key].map((field) => `fields[]=${field}`).join("&");
          }
          return `${key}=${params[key]}`;
        })
        .join("&");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/holiday?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch holidays for branch ${branchId}`);
        continue;
      }

      const holidayData = await response.json();
      const validHolidays = holidayData.data || [];

      holidaysByBranch.push(
        ...validHolidays.map((holiday) => ({
          ...holiday,
          branches: [
            {
              id: branch.id,
              locType: branch.locType,
              state: branch.state,
              locationName: branch.locationName,
            },
          ],
        }))
      );
    }

    const aggregatedHolidays = holidaysByBranch.reduce((acc, holiday) => {
      const existing = acc.find((h) => h.id === holiday.id);
      if (existing) {
        existing.branches.push(...holiday.branches);
      } else {
        acc.push(holiday);
      }
      return acc;
    }, []);

    holidays.value = aggregatedHolidays;
  } catch (error) {
    console.error("Error fetching holidays:", error);
    setErrorMessage("Failed to load holidays. Please try again.");
    holidays.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Update branch with holiday ID
const updateBranchWithHoliday = async (branchId, holidayId) => {
  try {
    const branch = branches.value.find((b) => b.id === branchId);
    if (!branch) {
      throw new Error(`Branch with ID ${branchId} not found`);
    }

    let currentHolidays = [];
    if (branch.holidays) {
      if (typeof branch.holidays === "string") {
        try {
          currentHolidays = JSON.parse(branch.holidays);
          if (!Array.isArray(currentHolidays)) {
            currentHolidays = [];
          }
        } catch (e) {
          console.warn(
            `Invalid holidays JSON for branch ${branchId}:`,
            branch.holidays,
            e
          );
          currentHolidays = [];
        }
      } else if (Array.isArray(branch.holidays)) {
        currentHolidays = branch.holidays;
      } else {
        console.warn(
          `Unexpected holidays format for branch ${branchId}:`,
          branch.holidays
        );
        currentHolidays = [];
      }
    }

    if (!currentHolidays.includes(holidayId)) {
      const updatedHolidays = [...currentHolidays, holidayId];

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/locationManagement/${branchId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            holidays: JSON.stringify(updatedHolidays),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update holidays for branch ${branchId}`);
      }

      branch.holidays = JSON.stringify(updatedHolidays);
    }
  } catch (error) {
    console.error(`Error updating branch ${branchId} with holiday:`, error);
    throw error;
  }
};

// Remove holiday from branches
const removeHolidayFromBranches = async (branchIds, holidayId) => {
  try {
    for (const branchId of branchIds) {
      const branch = branches.value.find((b) => b.id === branchId);
      if (!branch) {
        console.warn(`Branch with ID ${branchId} not found`);
        continue;
      }

      let currentHolidays = [];
      if (branch.holidays) {
        if (typeof branch.holidays === "string") {
          try {
            currentHolidays = JSON.parse(branch.holidays);
            if (!Array.isArray(currentHolidays)) {
              currentHolidays = [];
            }
          } catch (e) {
            console.warn(
              `Invalid holidays JSON for branch ${branchId}:`,
              branch.holidays,
              e
            );
            currentHolidays = [];
          }
        } else if (Array.isArray(branch.holidays)) {
          currentHolidays = branch.holidays;
        } else {
          console.warn(
            `Unexpected holidays format for branch ${branchId}:`,
            branch.holidays
          );
          currentHolidays = [];
        }
      }

      const updatedHolidays = currentHolidays.filter((id) => id !== holidayId);

      if (JSON.stringify(currentHolidays) !== JSON.stringify(updatedHolidays)) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/locationManagement/${branchId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              holidays: JSON.stringify(updatedHolidays),
            }),
          }
        );

        if (!response.ok) {
          console.warn(`Failed to remove holiday from branch ${branchId}`);
        } else {
          branch.holidays = JSON.stringify(updatedHolidays);
        }
      }
    }
  } catch (error) {
    console.error("Error removing holiday from branches:", error);
    throw error;
  }
};

// Date formatting
const formatDate = (date) => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  if (date instanceof Date && !isNaN(date)) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  console.warn("Invalid date provided to formatDate:", date);
  return "";
};

const getMonthShort = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
};

const getDayFromDate = (dateString) => {
  const date = new Date(dateString);
  return date.getDate();
};

// Message handling
const setSuccessMessage = (message) => {
  if (toastContainer.value) {
    toastContainer.value.success(message, 5000);
  }
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = "";
  }, 5000);
};

const setErrorMessage = (message) => {
  if (toastContainer.value) {
    toastContainer.value.error(message, 5000);
  }
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = "";
  }, 5000);
};

// Holiday Actions
const handleAddHolidayClick = () => {
  isAddingHoliday.value = true;
  editingHoliday.value = null;
  newHolidayName.value = "";
  selectedDate.value = null;
  selectedBranches.value = [];
  selectAllBranches.value = false;
  errorMessage.value = "";
  showHolidayFormDialog.value = true;
};

const handleEditHolidayClick = (holiday) => {
  isAddingHoliday.value = false;
  editingHoliday.value = holiday;
  editedHolidayName.value = holiday.event;
  selectedDate.value = formatDate(new Date(holiday.date));
  selectedBranches.value = holiday.branches.map((b) => b.id);
  selectAllBranches.value =
    selectedBranches.value.length === branches.value.length;
  errorMessage.value = "";
  showHolidayFormDialog.value = true;
};

const handleDeleteHoliday = async (holidayId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/holiday/${holidayId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete holiday");
    }

    const holiday = holidays.value.find((h) => h.id === holidayId);
    if (holiday && holiday.branches) {
      const branchIds = holiday.branches.map((b) => b.id);
      await removeHolidayFromBranches(branchIds, holidayId);
    }

    holidays.value = holidays.value.filter((h) => h.id !== holidayId);
    setSuccessMessage("Holiday deleted successfully!");
  } catch (error) {
    console.error("Error deleting holiday:", error);
    setErrorMessage("Failed to delete holiday. Please try again.");
  }
};

const addHoliday = async () => {
  if (
    !selectedDate.value ||
    !newHolidayName.value ||
    !selectedBranches.value.length
  ) {
    setErrorMessage(
      "Holiday name, date, and at least one branch are required."
    );
    return;
  }

  try {
    const payload = {
      date: formatDate(selectedDate.value),
      status: "assigned",
      event: newHolidayName.value,
      tenant: tenantId,
      assignedYear: selectedYear.value,
      uniqueId: `${tenantId}-${formatDate(selectedDate.value)}-${selectedYear.value}`,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/holiday`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add holiday");
    }

    const holidayData = await response.json();
    const holidayId = holidayData.data.id;

    const branchIdsToUpdate = selectedBranches.value;

    for (const branchId of branchIdsToUpdate) {
      await updateBranchWithHoliday(branchId, holidayId);
    }

    setSuccessMessage("Holiday added successfully!");
    cancelAction();
    await fetchHolidays(selectedYear.value);
  } catch (error) {
    console.error("Error adding holiday:", error);
    setErrorMessage("Failed to add holiday. Please try again.");
  }
};

const updateHoliday = async () => {
  if (
    !editingHoliday.value ||
    !editedHolidayName.value ||
    !selectedDate.value ||
    !selectedBranches.value.length
  ) {
    setErrorMessage(
      "Holiday name, date, and at least one branch are required."
    );
    return;
  }

  try {
    const payload = {
      event: editedHolidayName.value,
      date: formatDate(selectedDate.value),
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/holiday/${editingHoliday.value.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update holiday");
    }

    const oldBranchIds = editingHoliday.value.branches.map((b) => b.id);
    const newBranchIds = selectedBranches.value;

    const branchesToRemove = oldBranchIds.filter(
      (id) => !newBranchIds.includes(id)
    );
    if (branchesToRemove.length) {
      await removeHolidayFromBranches(
        branchesToRemove,
        editingHoliday.value.id
      );
    }

    const branchesToAdd = newBranchIds.filter(
      (id) => !oldBranchIds.includes(id)
    );
    for (const branchId of branchesToAdd) {
      await updateBranchWithHoliday(branchId, editingHoliday.value.id);
    }

    setSuccessMessage("Holiday updated successfully!");
    cancelAction();
    await fetchHolidays(selectedYear.value);
  } catch (error) {
    console.error("Error updating holiday:", error);
    setErrorMessage("Failed to update holiday. Please try again.");
  }
};

const cancelAction = () => {
  newHolidayName.value = "";
  selectedDate.value = null;
  selectedBranches.value = [];
  selectAllBranches.value = false;
  isAddingHoliday.value = false;
  editingHoliday.value = null;
  editedHolidayName.value = "";
  showHolidayFormDialog.value = false;
};

// Year selection
const handleYearSelect = (item) => {
  selectedYear.value = item.value;
};

// Delete confirmation handlers
const showDeleteConfirm = (holiday) => {
  holidayToDelete.value = holiday;
  showDeleteDialog.value = true;
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  holidayToDelete.value = null;
  isDeleting.value = false;
};

const confirmDelete = async () => {
  if (!holidayToDelete.value) return;
  isDeleting.value = true;

  try {
    await handleDeleteHoliday(holidayToDelete.value.id);
    closeDeleteDialog();
  } catch (error) {
    console.error("Error during delete confirmation:", error);
    setErrorMessage("Failed to delete holiday. Please try again.");
    isDeleting.value = false;
  }
};

// Show branches dialog
const showBranches = (item) => {
  selectedHolidayForView.value = item;
  showViewDialog.value = true;
};

// Lifecycle Hooks
onMounted(async () => {
  isLoading.value = true;
  await fetchBranches();
  await fetchHolidays(selectedYear.value);
  isLoading.value = false;
});

onUnmounted(() => {
  // Cleanup
});
</script>

<style scoped>
/* Existing styles remain unchanged */
.stats-container {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 8px 8px;
  border: 1px solid #000;
  margin-right: 10px;
}

.stat-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  gap: 5px;
}

.stat-item:not(:last-child)::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 1px;
  background-color: #dee2e6;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
  color: #1f2937;
}

.stat-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modern-action-card {
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.button-group {
  gap: 12px;
}

.holidays-table-wrapper {
  background: white;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.date-cell {
  display: flex;
  align-items: center;
}

.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #059367;
  color: white;
  border-radius: 12px;
  padding: 8px;
  min-width: 60px;
  text-align: center;
}

.date-month {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-day {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.event-name-cell {
  display: flex;
  align-items: center;
}

.event-name-text {
  font-size: 1rem;
  font-weight: 500;
  color: #1a1a1a;
}

.organization-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  max-width: 100%;
}

.organization-chips .v-chip {
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-section {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.action-btn {
  border-radius: 10px;
  text-transform: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

.empty-state {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 40px;
}

.dialog-card {
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.dialog-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.dialog-close-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.dialog-content {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-field {
  margin-bottom: 16px;
  padding: 0 24px;
}

.form-field :deep(.v-field) {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.date-input-container {
  position: relative;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 16px;
  background: white;
  outline: none;
  transition: border-color 0.2s ease;
}

.date-input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.date-icon {
  position: absolute;
  left: 16px;
  color: #666;
  cursor: pointer;
  user-select: none;
  z-index: 1;
}

.date-icon:hover {
  color: #1976d2;
}

.dialog-footer {
  background: #f8f9fa;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px 24px 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.footer-btn {
  min-width: 120px;
  border-radius: 12px;
  text-transform: none;
  font-weight: 600;
  height: 40px;
}

.primary-btn {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

@media (max-width: 960px) {
  .dialog-content {
    padding: 20px;
  }

  .dialog-footer {
    padding: 16px 20px 20px;
    flex-direction: column;
    gap: 8px;
  }

  .footer-btn {
    width: 100%;
  }

  .organization-chips {
    flex-direction: column;
    align-items: flex-start;
  }

  .organization-chips .v-chip {
    max-width: none;
  }
}

@media (max-width: 600px) {
  .button-group {
    flex-direction: column;
    gap: 8px;
  }

  .action-section {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .dialog-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
    padding: 20px;
  }

  .dialog-title {
    font-size: 1.5rem;
  }

  .date-input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .date-icon {
    position: static;
    align-self: flex-end;
    margin-top: 8px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.v-dialog .v-card) {
  border-radius: 0 !important;
}

:deep(.v-chip) {
  font-weight: 500;
}

:deep(.v-date-picker) {
  border-radius: 12px;
}

.view-more-chip {
  cursor: pointer;
}
</style>

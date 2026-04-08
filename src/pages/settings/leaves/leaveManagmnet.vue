<template>
  <v-container fluid class="leave-container">
    <!-- ToastContainer Component for Success/Error Messages -->
    <ToastContainer ref="toastContainer" />

    <!-- DataTableWrapper Component -->
    <DataTableWrapper
      :show-search="false"
      wrapper-class="leave-table-wrapper"
      :is-loading="isLoading"
    >
      <!-- Toolbar Actions Slot -->
      <template #toolbar-actions>
        <div class="header-section">
          <div class="year-selector">
            <v-menu
              v-model="yearMenu"
              :close-on-content-click="false"
              location="bottom"
              :offset="10"
              style="z-index: 1000"
            >
              <template #activator="{ props }">
                <div
                  v-bind="props"
                  class="year-dropdown d-flex align-center pa-2"
                  style="
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    cursor: pointer;
                    min-width: 120px;
                    background: #fff;
                  "
                >
                  <v-icon icon="mdi-calendar" size="16" class="mr-2"></v-icon>
                  <span>{{ selectedYear }}</span>
                  <v-icon icon="mdi-chevron-down" class="ml-2"></v-icon>
                </div>
              </template>
              <v-list>
                <v-list-item
                  v-for="year in yearOptions"
                  :key="year.value"
                  :value="year.value"
                  :disabled="year.disabled"
                  @click="handleYearSelect(year)"
                >
                  <v-list-item-title
                    style="text-align: center; font-weight: 500"
                  >
                    {{ year.label }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <BaseButton
              text="Add Leave"
              :left-icon="plusIcon"
              variant="primary"
              size="md"
              @click="openAddLeaveDialog"
              class="add-leave-btn"
            />
          </div>
        </div>
      </template>

      <!-- Table Content Slot -->
      <template v-if="!isLoading">
        <DataTable
          :items="leaves"
          :columns="columns"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          @update:sortBy="sortBy = $event"
          @update:sortDirection="sortDirection = $event"
          @sort="handleSort"
        >
          <!-- Leave Name Cell -->
          <template #cell-leaveName="{ item }">
            <div class="leave-name-cell">
              <div class="leave-name-wrapper">
                <span class="leave-name-text">
                  {{ formatLeaveTitle(item.leaveName) }}
                </span>
              </div>
            </div>
          </template>

          <!-- Annual Leaves Cell -->
          <template #cell-days="{ item }">
            <div class="leave-item">
              <span class="leave-value">{{ item.days }}</span>
            </div>
          </template>

          <!-- Monthly Limit Cell -->
          <template #cell-monthLimit="{ item }">
            <div class="leave-item">
              <span class="leave-value">{{ item.monthLimit }}</span>
            </div>
          </template>

          <!-- Carry Forward Cell -->
          <template #cell-carryForwardLimit="{ item }">
            <div class="leave-item">
              <span class="leave-value">{{
                item.isenabled ? item.carryForwardLimit : "N/A"
              }}</span>
            </div>
          </template>

          <!-- Clubbing Cell -->
          <template #cell-clubWithOther="{ item }">
            <v-chip
              size="small"
              :color="item.clubWithOther ? '#059367' : 'grey'"
              variant="tonal"
              class="clubbing-chip"
            >
              {{ item.clubWithOther ? "Allowed" : "Not Allowed" }}
            </v-chip>
          </template>

          <!-- Enabled Cell -->
          <template #cell-isEnabled="{ item }">
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="item.isEnabled"
                @change="toggleLeaveType(item)"
              />
              <span class="toggle-slider"></span>
            </label>
          </template>

          <!-- Actions Cell -->
          <template #cell-actions="{ item }">
            <div class="action-section">
              <ActionButton
                :icon="EditIcon"
                variant="edit"
                size="sm"
                text="Edit"
                :disabled="!item.isEnabled"
                @click="editLeave(item)"
              />
              <ActionButton
                :icon="TrashIcon"
                variant="delete"
                size="sm"
                text="Delete"
                :disabled="!item.isEnabled"
                @click="openConfirmDeleteDialog(item)"
              />
            </div>
          </template>
        </DataTable>
      </template>

      <!-- Skeleton Loader for Table -->
      <template v-else>
        <SkeletonLoading variant="data-table" :rows="5" :columns="7" animated />
      </template>

      <!-- Pagination Slot -->
      <template #pagination>
        <CustomPagination
          :page="currentPage"
          :items-per-page="itemsPerPage"
          :total-items="totalItems"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        />
      </template>
    </DataTableWrapper>

    <!-- Add Leave Dialog -->
    <v-dialog
      v-model="showAddLeaveDialog"
      max-width="500px"
      persistent
      class="leave-dialog"
    >
      <v-card class="dialog-card">
        <!-- Dialog Header -->
        <div class="dialog-header">
          <div class="dialog-header-content">
            <div class="dialog-title-section">
              <h2 class="dialog-title">Add New Leave Type</h2>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="closeAddLeaveDialog"
            class="dialog-close-btn"
          />
        </div>

        <!-- Dialog Content -->
        <div class="dialog-content">
          <v-form ref="addForm" v-model="validAdd">
            <div class="form-section">
              <div class="form-row">
                <label class="form-label">Leave Type Name:</label>
                <div class="form-input-wrapper">
                  <v-text-field
                    v-model="newLeaveTypeName"
                    label="Leave Type Name"
                    variant="outlined"
                    density="comfortable"
                    placeholder="e.g. Maternity Leave"
                    :rules="[
                      (v) => !!v || 'Leave type name is required',
                      (v) =>
                        validateLeaveName(v) ||
                        'This leave type already exists',
                    ]"
                    hide-details="auto"
                  />
                </div>
              </div>

              <div class="form-row">
                <label class="form-label">Annual Leaves:</label>
                <div class="form-input-wrapper">
                  <v-text-field
                    v-model="newLeaveConfig.days"
                    label="Number of days"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    min="0"
                    hide-details="auto"
                  />
                </div>
              </div>

              <div class="form-row">
                <label class="form-label">Monthly Limit:</label>
                <div class="form-input-wrapper">
                  <v-text-field
                    v-model="newLeaveConfig.monthLimit"
                    label="Monthly limit"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    min="0"
                    step="0.5"
                    hide-details="auto"
                  />
                </div>
              </div>

              <div class="form-row switch-row">
                <label class="form-label">Clubbing:</label>
                <div class="switch-input-group">
                  <label class="switch">
                    <input
                      type="checkbox"
                      v-model="newLeaveConfig.clubWithOtherLeaves"
                    />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              <div class="form-row switch-row">
                <label class="form-label"> Yearly Carry Forward:</label>
                <div class="switch-input-group">
                  <label class="switch">
                    <input type="checkbox" v-model="newLeaveConfig.isenabled" />
                    <span class="slider"></span>
                  </label>
                  <v-text-field
                    v-model="newLeaveConfig.carryForwardLimit"
                    label="Limit"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    min="0"
                    :disabled="!newLeaveConfig.isenabled"
                    class="limit-input"
                    hide-details="auto"
                  />
                </div>
              </div>
            </div>
          </v-form>
        </div>

        <!-- Dialog Footer -->
        <div class="dialog-footer">
          <BaseButton
            text="Cancel"
            variant="danger"
            size="md"
            rounded="md"
            @click="closeAddLeaveDialog"
            class="footer-btn"
          />
          <BaseButton
            text="Save Leave"
            variant="primary"
            size="md"
            rounded="md"
            :disabled="!validAdd"
            :left-icon="{
              render() {
                return h(VIcon, { icon: 'mdi-check', size: 18 });
              },
            }"
            @click="saveNewLeaveType"
            class="footer-btn primary-btn"
          />
        </div>
      </v-card>
    </v-dialog>

    <!-- Edit Leave Dialog -->
    <v-dialog
      v-model="showDialog"
      max-width="500px"
      persistent
      class="leave-dialog"
    >
      <v-card class="dialog-card">
        <!-- Dialog Header -->
        <div class="dialog-header">
          <div class="dialog-header-content">
            <div class="dialog-title-section">
              <h2 class="dialog-title">
                {{ formatLeaveTitle(editingLeave.leaveName) }}
              </h2>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="closeDialog"
            class="dialog-close-btn"
          />
        </div>

        <!-- Dialog Content -->
        <div class="dialog-content">
          <v-form ref="editForm" v-model="validEdit">
            <div class="form-section">
              <div class="form-row">
                <label class="form-label">Annual Leaves:</label>
                <div class="form-input-wrapper">
                  <v-text-field
                    v-model="editingLeave.days"
                    label="Number of days"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    min="0"
                    :disabled="!editingLeave.isEnabled"
                    @input="validateMonthLimit"
                    hide-details="auto"
                  />
                </div>
              </div>

              <div class="form-row">
                <label class="form-label">Monthly Limit:</label>
                <div class="form-input-wrapper">
                  <v-text-field
                    v-model="editingLeave.monthLimit"
                    label="Monthly limit"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    min="0"
                    step="0.5"
                    :max="editingLeave.days"
                    :disabled="!editingLeave.isEnabled"
                    @input="validateMonthLimit"
                    hide-details="auto"
                  />
                  <span v-if="showMonthLimitError" class="error-message">
                    Month limit cannot exceed Allowed Leaves
                  </span>
                </div>
              </div>

              <div class="form-row switch-row">
                <label class="form-label">Carry Forward:</label>
                <div class="switch-input-group">
                  <label class="switch">
                    <input
                      type="checkbox"
                      v-model="editingLeave.isenabled"
                      :disabled="!editingLeave.isEnabled"
                    />
                    <span class="slider"></span>
                  </label>
                  <v-text-field
                    v-model="editingLeave.carryForwardLimit"
                    label="Limit"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    min="0"
                    :disabled="
                      !editingLeave.isenabled || !editingLeave.isEnabled
                    "
                    class="limit-input"
                    hide-details="auto"
                  />
                </div>
              </div>

              <div class="form-row switch-row">
                <label class="form-label">Clubbing:</label>
                <div class="switch-input-group">
                  <label class="switch">
                    <input
                      type="checkbox"
                      v-model="editingLeave.clubWithOtherLeaves"
                      @change="handleClubbingChange"
                      :disabled="!editingLeave.isEnabled"
                    />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </v-form>
        </div>

        <!-- Dialog Footer -->
        <div class="dialog-footer">
          <BaseButton
            text="Cancel"
            variant="danger"
            size="md"
            rounded="md"
            @click="closeDialog"
            class="footer-btn"
          />
          <BaseButton
            text="Update Leave"
            variant="primary"
            size="md"
            rounded="md"
            :disabled="!validEdit || showMonthLimitError"
            :left-icon="{
              render() {
                return h(VIcon, { icon: 'mdi-check', size: 18 });
              },
            }"
            @click="handleSubmit"
            class="footer-btn primary-btn"
          />
        </div>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <ConfirmDeleteModal
      :show="showConfirmDeleteDialog"
      title="Delete Leave Type"
      :confirmMessage="'Are you sure you want to delete this leave type?'"
      :itemLabel="'Leave Type'"
      :itemName="leaveToDelete?.leaveName || ''"
      description="This action cannot be undone and will remove the leave type from all associated records."
      cancelText="Cancel"
      confirmText="Delete"
      deletingText="Deleting..."
      :deleting="isDeleting"
      @close="closeConfirmDeleteDialog"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { onMounted, reactive, ref, watch, computed, h, onUnmounted } from "vue";
import DataTable from "@/components/common/table/DataTable.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import ActionButton from "@/components/common/buttons/ActionButton.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";
import ConfirmDeleteModal from "@/components/common/modals/ConfirmDeleteModal.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import { VIcon } from "vuetify/components";
import { EditIcon, TrashIcon } from "lucide-vue-next";

const url = `${import.meta.env.VITE_API_URL}/items/leaveSetting`;
const token = authService.getToken();
const tenant = ref(null);
const leaves = ref([]);
const showDialog = ref(false);
const showAddLeaveDialog = ref(false);
const selectedYear = ref(new Date().getFullYear().toString());
const isLoading = ref(true);
const showMonthLimitError = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const newLeaveTypeName = ref("");
const sortBy = ref("leaveName");
const sortDirection = ref("asc");
const currentPage = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const validAdd = ref(false);
const validEdit = ref(false);
const addForm = ref(null);
const editForm = ref(null);
const yearMenu = ref(false);
const toastContainer = ref(null);
const successTimeout = ref(null);
const errorTimeout = ref(null);
const showConfirmDeleteDialog = ref(false);
const leaveToDelete = ref(null);
const isDeleting = ref(false);

const yearOptions = computed(() => {
  const currentYear = parseInt(selectedYear.value);
  const years = [];

  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push({
      label: i.toString(),
      value: i.toString(),
      disabled: false,
    });
  }

  return years;
});

const plusIcon = computed(() => {
  return {
    render() {
      return h(VIcon, { icon: "mdi-plus", size: 16 });
    },
  };
});

const columns = ref([
  {
    key: "leaveName",
    label: "Leave Type",
    sortable: false,
    width: "200px",
  },
  {
    key: "days",
    label: "Annual Leaves",
    sortable: false,
    width: "80px",
  },
  {
    key: "monthLimit",
    label: "Monthly Limit",
    sortable: false,
    width: "80px",
  },
  {
    key: "carryForwardLimit",
    label: "Carry Forward",
    sortable: false,
    width: "100px",
  },
  {
    key: "clubWithOther",
    label: "Clubbing",
    sortable: false,
    width: "200px",
  },
  {
    key: "isEnabled",
    label: "Enabled",
    sortable: false,
    width: "80px",
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    width: "100px",
  },
]);

const newLeaveConfig = reactive({
  days: 0,
  isenabled: false,
  carryForwardLimit: 0,
  monthLimit: 0,
  clubWithOtherLeaves: false,
  condition: [],
  isEnabled: true,
});

const editingLeave = reactive({
  id: null,
  leaveName: "",
  days: 0,
  isenabled: false,
  carryForwardLimit: 0,
  monthLimit: 0,
  condition: [],
  clubWithOtherLeaves: false,
  isEnabled: true,
  isCustom: false,
});

// Show success/error messages
const showSuccessMessage = (message) => {
  if (toastContainer.value) {
    toastContainer.value.success(message, 5000);
  }
  if (successTimeout.value) {
    clearTimeout(successTimeout.value);
  }
  successMessage.value = message;
  successTimeout.value = setTimeout(() => {
    successMessage.value = "";
  }, 5000);
};

const showErrorMessage = (message) => {
  if (toastContainer.value) {
    toastContainer.value.error(message, 5000);
  }
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value);
  }
  errorMessage.value = message;
  errorTimeout.value = setTimeout(() => {
    errorMessage.value = "";
  }, 5000);
};

// Validate month limit
const validateMonthLimit = () => {
  const days = parseInt(editingLeave.days) || 0;
  const monthLimit = parseInt(editingLeave.monthLimit) || 0;

  if (monthLimit < 0) {
    editingLeave.monthLimit = 0;
    showMonthLimitError.value = false;
    return;
  }

  showMonthLimitError.value = monthLimit > days;
};

// Get current user tenant
const user = async () => {
  const userData = await currentUserTenant.fetchLoginUserDetails();
  tenant.value = userData.tenant.tenantId;
};

// Watch for year changes
watch(selectedYear, async (newYear) => {
  currentPage.value = 1;
  await fetchData();
});

// Watch for page changes
watch([currentPage, itemsPerPage], async () => {
  await fetchData();
});

// Dialog management
const openAddLeaveDialog = () => {
  newLeaveTypeName.value = "";
  Object.assign(newLeaveConfig, {
    days: 0,
    isenabled: false,
    carryForwardLimit: 0,
    monthLimit: 0,
    clubWithOtherLeaves: false,
    condition: [],
    isEnabled: true,
  });
  showAddLeaveDialog.value = true;
};

const closeAddLeaveDialog = () => {
  showAddLeaveDialog.value = false;
  newLeaveTypeName.value = "";
  if (addForm.value) {
    addForm.value.reset();
  }
};

// Open Confirm Delete Dialog
const openConfirmDeleteDialog = (leave) => {
  if (!leave || !leave.isEnabled) return;
  leaveToDelete.value = leave;
  showConfirmDeleteDialog.value = true;
};

// Close Confirm Delete Dialog
const closeConfirmDeleteDialog = () => {
  showConfirmDeleteDialog.value = false;
  leaveToDelete.value = null;
};

// Confirm Delete Action
const confirmDelete = async () => {
  if (!leaveToDelete.value) return;

  try {
    isDeleting.value = true;
    await deleteLeave(leaveToDelete.value);
    closeConfirmDeleteDialog();
  } catch (error) {
    console.error("Error during deletion:", error);
    showErrorMessage(error.message);
  } finally {
    isDeleting.value = false;
  }
};

// Delete leave type
const deleteLeave = async (leave) => {
  if (!leave || !leave.isEnabled) return;

  try {
    isLoading.value = true;

    const deleteResponse = await fetch(`${url}/${leave.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!deleteResponse.ok)
      throw new Error(`Failed to delete ${leave.leaveName}`);

    await updateAllUsersForLeaveDeletion(leave.leaveName);
    await fetchData();
    showSuccessMessage(`${leave.leaveName} deleted successfully`);
  } catch (error) {
    console.error("Error deleting leave type:", error);
    showErrorMessage(error.message);
    throw error;
  } finally {
    isLoading.value = false;
  }
};

const normalizeLeaveName = (name) => {
  if (!name || typeof name !== "string") return "";
  return name.replace(/\s+/g, "").toLowerCase().trim();
};

const updateAllUsersForLeaveDeletion = async (leaveName, retries = 3) => {
  try {
    isLoading.value = true;
    const trimmedLeaveName = leaveName.trim();
    const normalizedLeaveName = normalizeLeaveName(trimmedLeaveName);
    const possibleLeaveNames = [
      trimmedLeaveName,
      normalizedLeaveName,
      trimmedLeaveName.replace(/\s+/g, ""),
    ].filter((name, index, self) => name && self.indexOf(name) === index);
    const batchSize = 50;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      let attempt = 0;
      let success = false;
      let usersList = [];

      while (attempt < retries && !success) {
        try {
          const usersResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,leaves.id,leaves.leaveBalance,leaves.CarryForwardleave,leaves.leaveTaken,leaves.monthLimit,leaves.assignedLeave&filter[assignedUser][tenant][tenantId][_eq]=${tenant.value}&limit=${batchSize}&page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!usersResponse.ok)
            throw new Error(`Failed to fetch users on page ${page}`);
          const usersData = await usersResponse.json();
          usersList = usersData.data || [];
          success = true;
        } catch (error) {
          attempt++;
          if (attempt >= retries) throw error;
          console.warn(
            `Retrying fetch users (attempt ${attempt + 1}/${retries})...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (usersList.length === 0) {
        hasMore = false;
        break;
      }

      const updatePayloads = usersList
        .map((user) => {
          if (!user.leaves || !user.leaves.id) {
            console.warn(`Skipping user ${user.id}: No valid leave record`);
            return null;
          }
          const leaveRecord = user.leaves;
          const leaveBalance = parseLeaveData(leaveRecord.leaveBalance);
          const carryForward = parseLeaveData(leaveRecord.CarryForwardleave);
          const leaveTaken = parseLeaveData(leaveRecord.leaveTaken);
          const monthLimit = parseLeaveData(leaveRecord.monthLimit);
          let assignedLeave = Array.isArray(leaveRecord.assignedLeave)
            ? [...leaveRecord.assignedLeave]
            : [];

          possibleLeaveNames.forEach((name) => {
            delete leaveBalance[name];
            delete carryForward[name];
            delete leaveTaken[`t${name}`];
            delete monthLimit[name];
            assignedLeave = assignedLeave.filter((l) => l !== name);
          });

          return {
            id: leaveRecord.id,
            leaveBalance,
            CarryForwardleave: carryForward,
            leaveTaken,
            monthLimit,
            assignedLeave,
          };
        })
        .filter((payload) => payload !== null);

      if (updatePayloads.length > 0) {
        attempt = 0;
        success = false;
        while (attempt < retries && !success) {
          try {
            const batchResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/items/leave`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updatePayloads),
              },
            );

            if (!batchResponse.ok)
              throw new Error(`Failed to update batch ${page}`);
            success = true;
          } catch (error) {
            attempt++;
            if (attempt >= retries) throw error;
            console.warn(
              `Retrying batch update ${page} (attempt ${attempt + 1}/${retries})...`,
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      page++;
    }

    console.log(
      `Removed ${leaveName} and its variations from all user records`,
    );
    showSuccessMessage(`Successfully removed ${leaveName} from all users`);
  } catch (error) {
    console.error("Error updating user leave records after deletion:", error);
    showErrorMessage("Failed to update all user leave records");
    throw error;
  } finally {
    isLoading.value = false;
  }
};

const validateLeaveName = (name) => {
  if (!name || typeof name !== "string") {
    return false;
  }

  const normalizedName = normalizeLeaveName(name);
  if (normalizedName.length === 0) {
    return false;
  }

  const existingNames = leaves.value.map((leave) =>
    normalizeLeaveName(leave.leaveName || ""),
  );

  if (existingNames.includes(normalizedName)) {
    return false;
  }

  return true;
};

// Save new leave type
const saveNewLeaveType = async () => {
  const { valid } = await addForm.value.validate();
  if (!valid) {
    showErrorMessage("Please fill in all required fields correctly.");
    return;
  }

  const normalizedLeaveName = normalizeLeaveName(newLeaveTypeName.value);

  if (!validateLeaveName(newLeaveTypeName.value)) {
    if (!normalizedLeaveName) {
      showErrorMessage("Please enter a valid leave type name");
    } else {
      showErrorMessage("This leave type already exists");
    }
    return;
  }

  try {
    isLoading.value = true;

    const days = Number(newLeaveConfig.days) || 0;
    const carryForwardLimit = Number(newLeaveConfig.carryForwardLimit) || 0;
    const monthLimit = Number(newLeaveConfig.monthLimit) || 0;
    const isenabled = newLeaveConfig.isenabled;

    const condition = [];
    if (newLeaveConfig.clubWithOtherLeaves) {
      condition.push("clubWithOtherLeaves");
    }

    const payload = {
      tenant: tenant.value,
      yearOfPolicy: selectedYear.value,
      leaveName: normalizedLeaveName,
      leaveConfig: {
        days: days,
        isenabled: isenabled,
        limit: carryForwardLimit,
        monthLimit: monthLimit,
        condition: condition,
        isEnabled: newLeaveConfig.isEnabled,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to create new leave type");

    showSuccessMessage("New leave type created successfully");
    closeAddLeaveDialog();
    await fetchData();
    await updateAllUsersForLeaveType(normalizedLeaveName, {
      days: days,
      carryForwardLimit: carryForwardLimit,
      monthLimit: monthLimit,
      isenabled: isenabled,
    });
  } catch (error) {
    console.error("Error creating new leave type:", error);
    showErrorMessage(error.message);
  } finally {
    isLoading.value = false;
  }
};

// Update all users for a specific leave type
const updateAllUsersForLeaveType = async (leaveName, leaveConfig) => {
  try {
    isLoading.value = true;
    const trimmedLeaveName = leaveName.trim();
    const normalizedLeaveName = normalizeLeaveName(trimmedLeaveName);
    const possibleOldNames = [trimmedLeaveName, normalizedLeaveName].filter(
      (name, index, self) => self.indexOf(name) === index,
    );
    const batchSize = 50;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const usersResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,leaves.id,leaves.leaveBalance,leaves.CarryForwardleave,leaves.leaveTaken,leaves.monthLimit,leaves.assignedLeave&filter[assignedUser][tenant][tenantId][_eq]=${tenant.value}&limit=${batchSize}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!usersResponse.ok) throw new Error("Failed to fetch users");

      const usersData = await usersResponse.json();
      const usersList = usersData.data || [];

      if (usersList.length === 0) {
        hasMore = false;
        break;
      }

      const updatePayloads = usersList
        .filter((user) => user.leaves && user.leaves.id)
        .map((user) => {
          const leaveRecord = user.leaves;
          const leaveBalance = parseLeaveData(leaveRecord.leaveBalance);
          const carryForward = parseLeaveData(leaveRecord.CarryForwardleave);
          const leaveTaken = parseLeaveData(leaveRecord.leaveTaken);
          const monthLimit = parseLeaveData(leaveRecord.monthLimit);
          let assignedLeave = Array.isArray(leaveRecord.assignedLeave)
            ? [...leaveRecord.assignedLeave]
            : [];

          // Remove old variations before updating
          possibleOldNames.forEach((name) => {
            if (name !== normalizedLeaveName) {
              delete leaveBalance[name];
              delete carryForward[name];
              delete leaveTaken[`t${name}`];
              delete monthLimit[name];
              assignedLeave = assignedLeave.filter((l) => l !== name);
            }
          });

          leaveBalance[normalizedLeaveName] = Number(leaveConfig.days) || 0;
          carryForward[normalizedLeaveName] =
            Number(leaveConfig.carryForwardLimit) || 0;
          leaveTaken[`t${normalizedLeaveName}`] = 0;
          monthLimit[normalizedLeaveName] = Number(leaveConfig.monthLimit) || 0;

          if (!assignedLeave.includes(normalizedLeaveName)) {
            assignedLeave.push(normalizedLeaveName);
          }

          return {
            id: leaveRecord.id,
            leaveBalance,
            CarryForwardleave: carryForward,
            leaveTaken,
            monthLimit,
            assignedLeave,
          };
        });

      if (updatePayloads.length > 0) {
        const batchResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/leave`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePayloads),
          },
        );

        if (!batchResponse.ok) {
          throw new Error(`Failed to update batch ${page}`);
        }
      }

      page++;
    }

    showSuccessMessage(`Updated ${leaveName} for all users successfully`);
  } catch (error) {
    console.error("Error updating user leave records:", error);
    showErrorMessage("Failed to update user leave records");
  } finally {
    isLoading.value = false;
  }
};

// Helper function to parse leave data
const parseLeaveData = (data) => {
  if (!data) return {};

  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;

    if (Array.isArray(parsed)) {
      const result = {};
      parsed.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          Object.assign(result, item);
        } else {
          result[index] = Number(item) || 0;
        }
      });
      return Object.fromEntries(
        Object.entries(result).map(([key, value]) => [key, Number(value) || 0]),
      );
    }

    return Object.fromEntries(
      Object.entries(
        typeof parsed === "object" && parsed !== null ? parsed : {},
      ).map(([key, value]) => [key, Number(value) || 0]),
    );
  } catch (e) {
    console.error("Error parsing leave data:", e);
    return {};
  }
};

// Toggle leave type enabled/disabled
const toggleLeaveType = async (leave) => {
  try {
    isLoading.value = true;

    const condition = [];
    if (leave.clubWithOther) {
      condition.push("clubWithOtherLeaves");
    }

    const normalizedLeaveName = normalizeLeaveName(leave.leaveName);

    const payload = {
      tenant: tenant.value,
      yearOfPolicy: selectedYear.value,
      leaveName: normalizedLeaveName,
      leaveConfig: {
        days: Number(leave.days) || 0,
        isenabled: leave.isenabled,
        limit: Number(leave.carryForwardLimit) || 0,
        monthLimit: Number(leave.monthLimit) || 0,
        condition: condition,
        isEnabled: leave.isEnabled,
      },
    };

    const response = await fetch(`${url}/${leave.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok)
      throw new Error(`Failed to update ${leave.leaveName} status`);

    await updateAllUsersForLeaveToggle({
      ...leave,
      leaveName: normalizedLeaveName,
    });
    showSuccessMessage(
      `${leave.leaveName} ${leave.isEnabled ? "enabled" : "disabled"} successfully`,
    );
  } catch (error) {
    console.error("Error toggling leave status:", error);
    showErrorMessage(error.message);
    leave.isEnabled = !leave.isEnabled;
  } finally {
    isLoading.value = false;
  }
};

// Update all users when a leave type is toggled
const updateAllUsersForLeaveToggle = async (leave) => {
  try {
    isLoading.value = true;
    const trimmedLeaveName = leave.leaveName.trim();
    const normalizedLeaveName = normalizeLeaveName(trimmedLeaveName);
    const possibleOldNames = [trimmedLeaveName, normalizedLeaveName].filter(
      (name, index, self) => self.indexOf(name) === index,
    );
    const batchSize = 50;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const usersResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,leaves.id,leaves.leaveBalance,leaves.CarryForwardleave,leaves.leaveTaken,leaves.monthLimit,leaves.assignedLeave&filter[assignedUser][tenant][tenantId][_eq]=${tenant.value}&limit=${batchSize}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!usersResponse.ok) throw new Error("Failed to fetch users");

      const usersData = await usersResponse.json();
      const usersList = usersData.data || [];

      if (usersList.length === 0) {
        hasMore = false;
        break;
      }

      const updatePayloads = usersList
        .filter((user) => user.leaves && user.leaves.id)
        .map((user) => {
          const leaveRecord = user.leaves;
          const leaveBalance = parseLeaveData(leaveRecord.leaveBalance);
          const carryForward = parseLeaveData(leaveRecord.CarryForwardleave);
          const leaveTaken = parseLeaveData(leaveRecord.leaveTaken);
          const monthLimit = parseLeaveData(leaveRecord.monthLimit);
          let assignedLeave = Array.isArray(leaveRecord.assignedLeave)
            ? [...leaveRecord.assignedLeave]
            : [];

          possibleOldNames.forEach((name) => {
            if (name !== normalizedLeaveName) {
              delete leaveBalance[name];
              delete carryForward[name];
              delete leaveTaken[`t${name}`];
              delete monthLimit[name];
              assignedLeave = assignedLeave.filter((l) => l !== name);
            }
          });

          if (leave.isEnabled) {
            leaveBalance[normalizedLeaveName] = Number(leave.days) || 0;
            carryForward[normalizedLeaveName] =
              Number(leave.carryForwardLimit) || 0;
            leaveTaken[`t${normalizedLeaveName}`] = 0;
            monthLimit[normalizedLeaveName] = Number(leave.monthLimit) || 0;

            if (!assignedLeave.includes(normalizedLeaveName)) {
              assignedLeave.push(normalizedLeaveName);
            }
          } else {
            delete leaveBalance[normalizedLeaveName];
            delete carryForward[normalizedLeaveName];
            delete leaveTaken[`t${normalizedLeaveName}`];
            delete monthLimit[normalizedLeaveName];

            assignedLeave = assignedLeave.filter(
              (l) => l !== normalizedLeaveName,
            );
          }

          return {
            id: leaveRecord.id,
            leaveBalance,
            CarryForwardleave: carryForward,
            leaveTaken,
            monthLimit,
            assignedLeave,
          };
        });

      if (updatePayloads.length > 0) {
        const batchResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/leave`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePayloads),
          },
        );

        if (!batchResponse.ok) {
          throw new Error(`Failed to update batch ${page}`);
        }
      }

      page++;
    }

    console.log(`Updated all user records for leave ${leave.leaveName}`);
  } catch (error) {
    console.error("Error updating user leave records:", error);
    throw error;
  } finally {
    isLoading.value = false;
  }
};

// Cleanup all duplicate leave types with spaces
const cleanAllDuplicateLeaves = async () => {
  try {
    isLoading.value = true;
    const batchSize = 100;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const usersResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?fields=id,leaves.id,leaves.leaveBalance,leaves.CarryForwardleave,leaves.leaveTaken,leaves.monthLimit,leaves.assignedLeave&filter[assignedUser][tenant][tenantId][_eq]=${tenant.value}&limit=${batchSize}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!usersResponse.ok)
        throw new Error(`Failed to fetch users on page ${page}`);
      const usersData = await usersResponse.json();
      const usersList = usersData.data || [];

      if (usersList.length === 0) {
        hasMore = false;
        break;
      }

      const updatePayloads = usersList
        .map((user) => {
          if (!user.leaves || !user.leaves.id) {
            console.warn(`Skipping user ${user.id}: No valid leave record`);
            return null;
          }
          const leaveRecord = user.leaves;
          const leaveBalance = parseLeaveData(leaveRecord.leaveBalance);
          const carryForward = parseLeaveData(leaveRecord.CarryForwardleave);
          const leaveTaken = parseLeaveData(leaveRecord.leaveTaken);
          const monthLimit = parseLeaveData(leaveRecord.monthLimit);
          let assignedLeave = Array.isArray(leaveRecord.assignedLeave)
            ? [...leaveRecord.assignedLeave]
            : [];

          // Group all variations of the same leave type
          const groupDuplicates = (keys) => {
            const groups = new Map();

            keys.forEach((key) => {
              const normalized = normalizeLeaveName(key);
              if (!groups.has(normalized)) {
                groups.set(normalized, []);
              }
              groups.get(normalized).push(key);
            });

            return groups;
          };

          // Get all unique keys across all objects
          const allKeys = new Set([
            ...Object.keys(leaveBalance),
            ...Object.keys(carryForward),
            ...Object.keys(leaveTaken).map((k) => k.replace(/^t/, "")),
            ...Object.keys(monthLimit),
            ...assignedLeave,
          ]);

          const duplicateGroups = groupDuplicates([...allKeys]);
          let hasChanges = false;

          // Process each group of duplicates
          duplicateGroups.forEach((variants, normalizedName) => {
            if (variants.length > 1) {
              hasChanges = true;

              // Merge leaveBalance
              let totalBalance = 0;
              variants.forEach((variant) => {
                if (leaveBalance[variant] !== undefined) {
                  totalBalance += Number(leaveBalance[variant] || 0);
                  if (variant !== normalizedName) {
                    delete leaveBalance[variant];
                  }
                }
              });
              if (
                totalBalance > 0 ||
                leaveBalance[normalizedName] !== undefined
              ) {
                leaveBalance[normalizedName] = totalBalance;
              }

              // Merge carryForward
              let totalCarryForward = 0;
              variants.forEach((variant) => {
                if (carryForward[variant] !== undefined) {
                  totalCarryForward += Number(carryForward[variant] || 0);
                  if (variant !== normalizedName) {
                    delete carryForward[variant];
                  }
                }
              });
              if (
                totalCarryForward > 0 ||
                carryForward[normalizedName] !== undefined
              ) {
                carryForward[normalizedName] = totalCarryForward;
              }

              // Merge leaveTaken
              let totalTaken = 0;
              variants.forEach((variant) => {
                const takenKey = `t${variant}`;
                if (leaveTaken[takenKey] !== undefined) {
                  totalTaken += Number(leaveTaken[takenKey] || 0);
                  if (variant !== normalizedName) {
                    delete leaveTaken[takenKey];
                  }
                }
              });
              if (
                totalTaken > 0 ||
                leaveTaken[`t${normalizedName}`] !== undefined
              ) {
                leaveTaken[`t${normalizedName}`] = totalTaken;
              }

              // Merge monthLimit
              let totalMonthLimit = 0;
              variants.forEach((variant) => {
                if (monthLimit[variant] !== undefined) {
                  totalMonthLimit += Number(monthLimit[variant] || 0);
                  if (variant !== normalizedName) {
                    delete monthLimit[variant];
                  }
                }
              });
              if (
                totalMonthLimit > 0 ||
                monthLimit[normalizedName] !== undefined
              ) {
                monthLimit[normalizedName] = totalMonthLimit;
              }

              // Update assignedLeave array
              assignedLeave = assignedLeave.map((leave) => {
                const normalized = normalizeLeaveName(leave);
                return variants.includes(leave) ? normalizedName : leave;
              });
            }
          });

          // Remove duplicates from assignedLeave array
          assignedLeave = [...new Set(assignedLeave)];

          // Only return payload if changes were made
          if (!hasChanges) return null;

          return {
            id: leaveRecord.id,
            leaveBalance,
            CarryForwardleave: carryForward,
            leaveTaken,
            monthLimit,
            assignedLeave,
          };
        })
        .filter((payload) => payload !== null);

      if (updatePayloads.length > 0) {
        const batchResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePayloads),
          },
        );

        if (!batchResponse.ok)
          throw new Error(`Failed to update batch ${page}`);
      }

      page++;
    }

    showSuccessMessage(`Successfully cleaned up all duplicate leave types`);
  } catch (error) {
    console.error("Error cleaning up duplicate leave types:", error);
    showErrorMessage("Failed to clean up duplicate leave types");
  } finally {
    isLoading.value = false;
  }
};

// Fetch leave settings data
const fetchData = async () => {
  if (!tenant.value) {
    console.log("⛔ No tenant selected, fetchData aborted.");
    leaves.value = [];
    totalItems.value = 0;
    isLoading.value = false;
    return;
  }

  console.log("🚀 Fetching leave settings for tenant:", tenant.value);

  isLoading.value = true;
  console.log("⏳ Loading started...");

  try {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", itemsPerPage.value);
    queryParams.append("page", currentPage.value);
    queryParams.append("filter[tenant][tenantId][_eq]", tenant.value);
    queryParams.append("filter[year(yearOfPolicy)][_eq]", selectedYear.value);
    queryParams.append("meta", "total_count,filter_count");

    console.log("📌 Query Params:", queryParams.toString());

    const requestUrl = `${url}?${queryParams.toString()}`;
    console.log("🌐 API Request URL:", requestUrl);

    const response = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📥 API Response Status:", response.status);

    if (!response.ok) {
      throw new Error("Failed to fetch leave settings");
    }

    const data = await response.json();
    console.log("✅ Raw API Data:", data);

    if (data.data && Array.isArray(data.data)) {
      leaves.value = data.data.map((item, index) => {
        console.log(`🔄 Processing item ${index + 1}:`, item);

        return {
          id: item.id,
          leaveName: normalizeLeaveName(item.leaveName), // Normalize leave names on fetch
          days: Number(item.leaveConfig.days) || 0,
          monthLimit: Number(item.leaveConfig.monthLimit) || 0,
          isenabled: item.leaveConfig.isenabled || false,
          carryForwardLimit: Number(item.leaveConfig.limit) || 0,
          clubWithOther:
            item.leaveConfig.condition?.includes("clubWithOtherLeaves") ||
            false,
          condition: item.leaveConfig.condition || [],
          isEnabled: item.leaveConfig.isEnabled !== false,
          isCustom: true,
        };
      });

      totalItems.value =
        data.meta?.filter_count || data.meta?.total_count || data.data.length;
      console.log("📈 Total Items for tenant:", totalItems.value);
    } else {
      leaves.value = [];
      totalItems.value = 0;
      console.log("⚠️ No leave settings found for this tenant/year.");
    }
  } catch (error) {
    console.error("❌ Error fetching leave settings:", error);
    leaves.value = [];
    totalItems.value = 0;
    showErrorMessage("Failed to fetch leave settings. Please try again.");
  } finally {
    isLoading.value = false;
    console.log("✅ Loading finished.");
  }
};

// Handle page change
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchData();
};

// Handle items per page change
const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
  fetchData();
};

// Handle sorting
const handleSort = ({ field, direction }) => {
  leaves.value.sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    if (field === "carryForwardLimit" && !a.isenabled) aValue = 0;
    if (field === "carryForwardLimit" && !b.isenabled) bValue = 0;

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

// Handle clubbing change
const handleClubbingChange = () => {
  if (editingLeave.clubWithOtherLeaves) {
    if (!editingLeave.condition.includes("clubWithOtherLeaves")) {
      editingLeave.condition.push("clubWithOtherLeaves");
    }
  } else {
    editingLeave.condition = editingLeave.condition.filter(
      (c) => c !== "clubWithOtherLeaves",
    );
  }
};

// Edit leave
const editLeave = (leave) => {
  if (!leave || !leave.isEnabled) return;

  Object.assign(editingLeave, {
    ...leave,
    condition: leave.condition || [],
    clubWithOtherLeaves: leave.clubWithOther || false,
    isEnabled: leave.isEnabled,
  });
  showDialog.value = true;
};

// Handle form submission
const handleSubmit = async () => {
  const { valid } = await editForm.value.validate();
  if (!valid || showMonthLimitError.value) {
    showErrorMessage("Please fill in all required fields correctly.");
    return;
  }

  try {
    isLoading.value = true;
    const condition = [];
    if (editingLeave.clubWithOtherLeaves) {
      condition.push("clubWithOtherLeaves");
    }

    const normalizedLeaveName = normalizeLeaveName(editingLeave.leaveName);

    const payload = {
      tenant: tenant.value,
      yearOfPolicy: selectedYear.value,
      leaveName: normalizedLeaveName,
      leaveConfig: {
        days: Number(editingLeave.days) || 0,
        isenabled: editingLeave.isenabled,
        limit: Number(editingLeave.carryForwardLimit) || 0,
        monthLimit: Number(editingLeave.monthLimit) || 0,
        condition: condition,
        isEnabled: editingLeave.isEnabled,
      },
    };

    const response = await fetch(`${url}/${editingLeave.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to update leave policy");

    await updateAllUsersForLeaveType(normalizedLeaveName, {
      days: Number(editingLeave.days) || 0,
      carryForwardLimit: Number(editingLeave.carryForwardLimit) || 0,
      monthLimit: Number(editingLeave.monthLimit) || 0,
      isenabled: editingLeave.isenabled,
    });

    await fetchData();
    showDialog.value = false;
    showSuccessMessage("Leave policy updated successfully");
  } catch (error) {
    console.error("Error saving leave policy:", error);
    showErrorMessage(error.message);
  } finally {
    isLoading.value = false;
  }
};

// Close dialog
const closeDialog = () => {
  showDialog.value = false;
  if (editForm.value) {
    editForm.value.reset();
  }
};

const handleYearSelect = (item) => {
  if (item.value !== selectedYear.value) {
    selectedYear.value = item.value;
    currentPage.value = 1;
  }
};

// Format leave title
const formatLeaveTitle = (type) => {
  return type;
};

// Cleanup timeouts on unmount
onUnmounted(() => {
  if (successTimeout.value) clearTimeout(successTimeout.value);
  if (errorTimeout.value) clearTimeout(errorTimeout.value);
});

// Initialize component
onMounted(async () => {
  await user();
  // await cleanAllDuplicateLeaves(); // Run cleanup on mount
  await fetchData();
});
</script>

<style scoped>
.leave-table-wrapper:focus-within {
  outline: none !important;
  outline-offset: 0 !important;
}
.leave-container {
  width: 100%;
}

.custom-snackbar {
  font-weight: 500;
}

.leave-table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.main-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
}

.year-dropdown {
  min-width: 120px;
}
.year-dropdown:hover {
  background: #f5f5f5;
}

.year-dropdown .v-list {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.year-dropdown .v-list-item {
  justify-content: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.year-dropdown .v-list-item:last-child {
  border-bottom: none;
}

.year-dropdown .v-list-item:hover:not(.v-list-item--disabled) {
  background-color: #f8fafc;
}

.year-dropdown .v-list-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* Ensure the dropdown has proper spacing */
.year-dropdown .dropdown-container {
  display: inline-block;
}

.add-leave-btn {
  font-weight: 500;
}

.leave-name-cell {
  display: flex;
  align-items: center;
}

.leave-name-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.leave-name-text {
  font-size: 1rem;
  font-weight: 500;
  color: #1a1a1a;
}

.leave-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

.leave-value {
  color: #1a1a1a;
  font-weight: 600;
}

.clubbing-chip {
  font-weight: 500;
  font-size: 0.75rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #059367;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.action-section {
  display: flex;
  gap: 12px;
}

.leave-dialog .v-overlay__content {
  margin: 24px;
}

.dialog-card {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 15px;
  border-bottom: 3px solid #059367;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.dialog-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.dialog-icon.primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.dialog-icon.warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.dialog-title-section {
  flex: 1;
}

.dialog-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
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
  padding: 32px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

.form-label {
  min-width: 120px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  padding-top: 8px;
  text-align: left;
}

.form-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-field {
  margin-bottom: 16px;
}

.form-field :deep(.v-field) {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.form-field :deep(.v-field--focused) {
  border-color: #1976d2;
}

.switch-row {
  align-items: center;
}

.switch-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #059367;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.limit-input {
  max-width: 120px;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.dialog-footer {
  background: #f8f9fa;
  padding: 24px 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.footer-btn {
  min-width: 140px;
  border-radius: 12px;
  text-transform: none;
  font-weight: 600;
  height: 48px;
}

.primary-btn {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

@media (max-width: 960px) {
  .header-section {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .form-label {
    min-width: auto;
    padding-top: 0;
  }

  .switch-row {
    flex-direction: row;
    align-items: center;
  }

  .switch-input-group {
    justify-content: flex-start;
  }

  .dialog-content {
    padding: 24px;
  }

  .dialog-footer {
    padding: 20px 24px;
    flex-direction: column;
    gap: 12px;
  }

  .footer-btn {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .leave-container {
    padding: 16px;
  }

  .leave-name-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .leave-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .action-section {
    flex-direction: column;
  }

  .dialog-header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .dialog-title {
    font-size: 1.5rem;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-row {
  animation: slideInUp 0.3s ease-out;
}

.add-leave-btn:focus,
.footer-btn:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.leave-table-wrapper:focus-within {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

@media (prefers-contrast: high) {
  .leave-table-wrapper {
    border: 2px solid #000;
  }
}

@media (prefers-reduced-motion: reduce) {
  .table-row,
  .add-leave-btn {
    transition: none;
  }

  .table-row:hover,
  .add-leave-btn:hover {
    transform: none;
  }
}
</style>

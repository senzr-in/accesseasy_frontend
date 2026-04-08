<template>
  <v-container fluid class="shifts-container">
    <!-- ToastContainer Component -->
    <ToastContainer ref="toastContainer" />

    <!-- DataTableWrapper Component -->
    <DataTableWrapper
      :show-search="false"
      wrapper-class="shifts-table-wrapper"
      :is-loading="isLoading"
    >
      <!-- Toolbar Actions Slot -->
      <template #toolbar-actions>
        <BaseButton
          text="Add New Shift"
          :left-icon="plusIcon"
          variant="primary"
          size="md"
          @click="openAddDialog"
          class="add-shift-btn"
        />
      </template>

      <!-- Table Content Slot -->
      <template v-if="!isLoading">
        <DataTable
          :items="shifts"
          :columns="columns"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          @update:sortBy="sortBy = $event"
          @update:sortDirection="sortDirection = $event"
          @sort="handleSort"
        >
          <!-- Shift Name Cell -->
          <template #cell-name="{ item }">
            <div class="shift-name-cell">
              <div class="shift-name-wrapper">
                <span class="shift-name-text">
                  {{ item.name }}
                  <v-chip
                    v-if="item.name === 'GeneralShift'"
                    size="x-small"
                    color="grey-lighten-1"
                    variant="flat"
                    class="default-badge"
                  >
                    Default
                  </v-chip>
                </span>
              </div>
            </div>
          </template>

          <!-- Shift Type Cell -->
          <template #cell-type="{ item }">
            <v-chip
              size="small"
              :color="getShiftColor(item.name)"
              variant="tonal"
              class="shift-type-badge"
            >
              {{ getShiftTypeLabel(item.name) }}
            </v-chip>
          </template>

          <!-- Start Time Cell -->
          <template #cell-startTime="{ item }">
            <div class="time-item">
              <span class="time-value">{{ formatTime(item.startTime) }}</span>
            </div>
          </template>

          <!-- End Time Cell -->
          <template #cell-endTime="{ item }">
            <div class="time-item">
              <span class="time-value">{{ formatTime(item.endTime) }}</span>
            </div>
          </template>

          <!-- Duration Cell -->
          <template #cell-duration="{ item }">
            <v-chip
              class="duration-chip"
              size="small"
              color="primary"
              variant="outlined"
            >
              <v-icon start size="14">mdi-timer-outline</v-icon>
              {{ getDuration(item.startTime, item.endTime) }}h
            </v-chip>
          </template>

          <!-- Actions Cell -->
          <template #cell-actions="{ item }">
            <div class="action-section">
              <ActionButton
                text="Edit"
                :icon="EditIcon"
                variant="edit"
                size="sm"
                class="action-btn edit-btn"
                @click="openEditDialog(item)"
              />
              <!-- Uncomment if you want to enable delete functionality -->
              <!-- <ActionButton
                v-if="item.name !== 'GeneralShift'"
                text="Delete"
                :icon="TrashIcon"
                variant="delete"
                size="small"
                class="action-btn delete-btn"
                @click="deleteShift(item.id)"
              /> -->
            </div>
          </template>
        </DataTable>
      </template>

      <!-- Skeleton Loader for Table -->
      <template v-else>
        <SkeletonLoading
          variant="data-table"
          :rows="5"
          :columns="5"
          animated
        />
      </template>

      <!-- Pagination Slot -->
      <template #pagination>
        <CustomPagination
          :page="currentPage"
          :items-per-page="itemsPerPage"
          :total-items="totalItems"
          :is-loading="isLoading"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        />
      </template>
    </DataTableWrapper>

    <!-- Add Shift Dialog -->
    <v-dialog
      v-model="showAddDialog"
      max-width="600px"
      persistent
      class="shift-dialog"
    >
      <v-card class="dialog-card">
        <!-- Dialog Header -->
        <div class="dialog-header">
          <div class="dialog-header-content">
            <div class="dialog-title-section">
              <h2 class="dialog-title">Create New Shift</h2>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="closeAddDialog"
            class="dialog-close-btn"
          />
        </div>

        <!-- Dialog Content -->
        <div class="dialog-content">
          <v-form ref="addForm" v-model="validAdd">
            <!-- Shift Name Section -->
            <div class="form-section">
              <v-text-field
                v-model="newShift.name"
                label="Shift Name"
                variant="outlined"
                density="comfortable"
                :rules="[
                  (v) => !!v || 'Shift name is required',
                  (v) =>
                    !isShiftNameTaken(v) || 'This shift name already exists',
                ]"
                placeholder="e.g. Morning Shift, Weekend Shift"
                class="form-field"
                prepend-inner-icon="mdi-pencil"
                hide-details="auto"
              />
            </div>

            <!-- Time Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon class="section-icon">mdi-clock-outline</v-icon>
                <h3 class="section-title">Working Hours</h3>
              </div>

              <div class="time-inputs-grid">
                <div class="time-input-group">
                  <v-text-field
                    v-model="newShift.startTime"
                    label="Start Time"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v) => !!v || 'Start time is required']"
                    class="form-field time-field"
                  />
                  <div class="time-display">
                    {{ formatTimeWithAMPM(newShift.startTime) }}
                  </div>
                </div>

                <div class="time-input-group">
                  <v-text-field
                    v-model="newShift.endTime"
                    label="End Time"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v) => !!v || 'End time is required']"
                    class="form-field time-field"
                  />
                  <div class="time-display">
                    {{ formatTimeWithAMPM(newShift.endTime) }}
                  </div>
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
            color="grey-darken-1"
            size="md"
            @click="closeAddDialog"
            class="footer-btn"
          />
          <BaseButton
            text="Create Shift"
            :left-icon="{
              render: () => h(VIcon, { icon: 'mdi-check', size: 18 }),
            }"
            variant="primary"
            size="md"
            @click="addShift"
            :disabled="!validAdd"
            class="footer-btn primary-btn"
          />
        </div>
      </v-card>
    </v-dialog>

    <!-- Edit Shift Dialog -->
    <v-dialog
      v-model="showEditDialog"
      max-width="600px"
      persistent
      class="shift-dialog"
    >
      <v-card class="dialog-card">
        <!-- Dialog Header -->
        <div class="dialog-header">
          <div class="dialog-header-content">
            <div class="dialog-title-section">
              <h2 class="dialog-title">Edit Shift</h2>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="closeEditDialog"
            class="dialog-close-btn"
          />
        </div>

        <!-- Dialog Content -->
        <div class="dialog-content">
          <v-form ref="editForm" v-model="validEdit">
            <!-- Shift Name Section -->
            <div class="form-section">
              <v-text-field
                v-model="editedShift.name"
                label="Shift Name"
                variant="outlined"
                density="comfortable"
                :rules="[
                  (v) => !!v || 'Name is required',
                  (v) =>
                    !isShiftNameTakenForEdit(v) ||
                    'This shift name already exists',
                ]"
                placeholder="e.g. Morning Shift, Weekend Shift"
                class="form-field"
                :disabled="editedShift.name === 'GeneralShift'"
              />
            </div>

            <!-- Time Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon class="section-icon">mdi-clock-outline</v-icon>
                <h3 class="section-title">Working Hours</h3>
              </div>

              <div class="time-inputs-grid">
                <div class="time-input-group">
                  <v-text-field
                    v-model="editedShift.startTime"
                    label="Start Time"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v) => !!v || 'Start time is required']"
                    class="form-field time-field"
                  />
                  <div class="time-display">
                    {{ formatTimeWithAMPM(editedShift.startTime) }}
                  </div>
                </div>

                <div class="time-input-group">
                  <v-text-field
                    v-model="editedShift.endTime"
                    label="End Time"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v) => !!v || 'End time is required']"
                    class="form-field time-field"
                  />
                  <div class="time-display">
                    {{ formatTimeWithAMPM(editedShift.endTime) }}
                  </div>
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
            color="grey-darken-1"
            size="md"
            @click="closeEditDialog"
            class="footer-btn"
          />
          <BaseButton
            text="Save Changes"
            :left-icon="{
              render: () => h(VIcon, { icon: 'mdi-check', size: 18 }),
            }"
            variant="primary"
            size="md"
            @click="saveChanges"
            :disabled="!validEdit"
            class="footer-btn primary-btn"
          />
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { onMounted, ref, watch, computed, h } from "vue";
import DataTable from "@/components/common/table/DataTable.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { VIcon } from "vuetify/components";
import { EditIcon, TrashIcon } from "lucide-vue-next";
import ActionButton from "@/components/common/buttons/ActionButton.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";

const toastContainer = ref(null);
const token = authService.getToken();
const tenant = ref(null);
const shifts = ref([]);
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const validAdd = ref(false);
const validEdit = ref(false);
const addForm = ref(null);
const editForm = ref(null);
const sortBy = ref("name");
const sortDirection = ref("asc");
const currentPage = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const isLoading = ref(false);

// Define columns for DataTable
const columns = ref([
  {
    key: "name",
    label: "Shift",
    sortable: false,
    width: "250px",
  },
  {
    key: "startTime",
    label: "Start Time",
    sortable: false,
    width: "100px",
  },
  {
    key: "endTime",
    label: "End Time",
    sortable: false,
    width: "100px",
  },
  {
    key: "duration",
    label: "Duration",
    sortable: false,
    width: "100px",
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    width: "80px",
  },
]);

// Updated SHIFT_NAMES to include "GeneralShift" as a non-deletable default
const SHIFT_NAMES = [
  "Day",
  "Day 1",
  "Evening",
  "Night",
  "Week Off",
  "GeneralShift",
];

// Duration options for breaks
const durationOptions = [
  { title: "5 minutes", value: 5 },
  { title: "10 minutes", value: 10 },
  { title: "15 minutes", value: 15 },
  { title: "30 minutes", value: 30 },
  { title: "45 minutes", value: 45 },
  { title: "60 minutes", value: 60 },
];

const newShift = ref({
  name: "",
  startTime: "",
  endTime: "",
  breakTypes: [
    {
      breakType: "",
      startTime: "",
      endTime: "",
      duration: 30,
    },
  ],
});

const editedShift = ref({
  id: null,
  name: "",
  startTime: "",
  endTime: "",
  breakTypes: [
    {
      breakType: "",
      startTime: "",
      endTime: "",
      duration: 30,
    },
  ],
});

// Computed property to create a VIcon component for mdi-plus
const plusIcon = computed(() => {
  return {
    render() {
      return h(VIcon, { icon: "mdi-plus", size: 16 });
    },
  };
});

// Validation for custom shift names in add dialog
const isShiftNameTaken = (name) => {
  if (!name) return false;
  return shifts.value.some((s) => s.name.toLowerCase() === name.toLowerCase());
};

// Validation for custom shift names in edit dialog
const isShiftNameTakenForEdit = (name) => {
  if (!name) return false;
  return shifts.value.some(
    (s) =>
      s.name.toLowerCase() === name.toLowerCase() &&
      s.id !== editedShift.value.id,
  );
};

// Function to calculate end time based on start time and duration
const calculateEndTime = (startTime, durationMinutes) => {
  if (!startTime || !durationMinutes) return "";
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMins = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
};

// Update break end time for add dialog
const updateBreakEndTime = (index) => {
  const breakItem = newShift.value.breakTypes[index];
  if (breakItem.startTime && breakItem.duration) {
    breakItem.endTime = calculateEndTime(
      breakItem.startTime,
      breakItem.duration,
    );
  }
};

// Update break end time for edit dialog
const updateBreakEndTimeEdit = (index) => {
  const breakItem = editedShift.value.breakTypes[index];
  if (breakItem.startTime && breakItem.duration) {
    breakItem.endTime = calculateEndTime(
      breakItem.startTime,
      breakItem.duration,
    );
  }
};

// Function to show success message
const showSuccessMessage = (message, duration = 3000) => {
  if (toastContainer.value) {
    toastContainer.value.success(message, duration);
  } else {
    console.log("✅", message);
  }
};

// Function to show error message
const showErrorMessage = (message, duration = 5000) => {
  if (toastContainer.value) {
    toastContainer.value.error(message, duration);
  } else {
    console.error("❌", message);
  }
};

// Format time with AM/PM
const formatTimeWithAMPM = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${minutes} ${ampm}`;
};

// Format time for display (railway format with AM/PM)
const formatTime = (time) => {
  if (!time) return "";
  const timeOnly = time.slice(0, 5); // Get HH:MM from HH:MM:SS
  return `${timeOnly} ${formatTimeWithAMPM(timeOnly).split(" ")[1]}`;
};

// Break management functions
const addBreak = () => {
  newShift.value.breakTypes.push({
    breakType: "",
    startTime: "",
    endTime: "",
    duration: 30,
  });
};

const removeBreak = (index) => {
  if (newShift.value.breakTypes.length > 1) {
    newShift.value.breakTypes.splice(index, 1);
  }
};

const addBreakToEdit = () => {
  editedShift.value.breakTypes.push({
    breakType: "",
    startTime: "",
    endTime: "",
    duration: 30,
  });
};

const removeBreakFromEdit = (index) => {
  if (editedShift.value.breakTypes.length > 1) {
    editedShift.value.breakTypes.splice(index, 1);
  }
};

const user = async () => {
  const userData = await currentUserTenant.fetchLoginUserDetails();
  tenant.value = userData.tenant;
};

const fetchShifts = async () => {
  try {
    isLoading.value = true;
    console.log("👉 Fetch Shifts function started");

    const queryParams = new URLSearchParams();
    const tenantId = currentUserTenant.getTenantId();
    console.log("✅ Tenant ID:", tenantId);

    queryParams.append("limit", itemsPerPage.value);
    queryParams.append("page", currentPage.value);
    queryParams.append("fields[]", "id");
    queryParams.append("fields[]", "entryTime");
    queryParams.append("fields[]", "exitTime");
    queryParams.append("fields[]", "shift");
    queryParams.append("fields[]", "status");
    queryParams.append("fields[]", "tenant");
    queryParams.append("fields[]", "break");
    queryParams.append("fields[]", "breakTypes");
    queryParams.append("fields[]", "tenant.tenantId");
    queryParams.append("filter[tenant][tenantId][_eq]", tenantId);
    queryParams.append("meta", "total_count,filter_count");

    console.log("🔍 Query Params:", queryParams.toString());
    console.log(
      "🔍 Full URL:",
      `${import.meta.env.VITE_API_URL}/items/shifts?${queryParams.toString()}`,
    );

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/shifts?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("📡 Fetch response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📦 Raw API Data:", JSON.stringify(data, null, 2));

    console.log("  - data.total:", data.total);
    console.log("  - data.data.length:", data.data?.length);

    if (data.data && Array.isArray(data.data)) {
      totalItems.value = data.data.length;
      console.log("📊 Using data.length as fallback:", totalItems.value);
    } else {
      totalItems.value = 0;
      console.log("📊 No count found, using 0");
    }

    console.log("📊 Final Total Items set to:", totalItems.value);

    console.log("🔍 Tenant verification for returned shifts:");
    data.data.forEach((shift, index) => {
      console.log(
        `  Shift ${index + 1}: ID=${shift.id}, TenantID=${shift.tenant?.tenantId}, Name=${shift.shift}`,
      );
    });

    shifts.value = data.data.map((shift, index) => {
      console.log(`🔹 Processing shift [${index}] :`, shift);

      let breakTypesData = [];
      try {
        if (shift.breakTypes) {
          if (typeof shift.breakTypes === "string") {
            console.log("📝 breakTypes (string):", shift.breakTypes);
            breakTypesData = JSON.parse(shift.breakTypes);
          } else if (typeof shift.breakTypes === "object") {
            console.log("📝 breakTypes (object):", shift.breakTypes);
            breakTypesData = shift.breakTypes;
          }
        }
      } catch (e) {
        console.error("❌ Error parsing breakTypes:", e);
      }

      if (!breakTypesData || !breakTypesData.length) {
        console.warn("⚠️ No breakTypes found, using default");
        breakTypesData = [
          {
            breakType: "Default Break",
            startTime: "12:00",
            endTime: "12:30",
            duration: 30,
          },
        ];
      }

      breakTypesData = breakTypesData.map((breakItem, idx) => {
        console.log(`⏱️ Break item [${idx}] before duration fix:`, breakItem);
        return {
          ...breakItem,
          duration: breakItem.duration || 30,
        };
      });

      const shiftObj = {
        id: shift.id,
        name: shift.shift,
        startTime: shift.entryTime.slice(0, 5),
        endTime: shift.exitTime.slice(0, 5),
        breakTypes: breakTypesData,
        status: shift.status,
        tenantId: shift.tenant?.tenantId,
      };

      console.log("✅ Final shift object:", shiftObj);
      return shiftObj;
    });

    console.log("🎯 Final Shifts Value:", shifts.value);
    console.log("🎯 Final Total Items:", totalItems.value);
    console.log("🎯 Current Page:", currentPage.value);
    console.log("🎯 Items Per Page:", itemsPerPage.value);
  } catch (error) {
    console.error("❌ Error fetching shifts:", error);
    showErrorMessage("Failed to fetch shifts. Please try again.");
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchShifts();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
  fetchShifts();
};

const openAddDialog = () => {
  showAddDialog.value = true;
  newShift.value = {
    name: "",
    startTime: "",
    endTime: "",
    breakTypes: [
      {
        breakType: "",
        startTime: "",
        endTime: "",
        duration: 30,
      },
    ],
  };
};

const closeAddDialog = () => {
  showAddDialog.value = false;
  if (addForm.value) {
    addForm.value.reset();
  }
};

const openEditDialog = (shift) => {
  editedShift.value = {
    ...shift,
    breakTypes: shift.breakTypes.map((breakItem) => ({
      ...breakItem,
      duration: breakItem.duration || 30,
    })),
  };
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  if (editForm.value) {
    editForm.value.reset();
  }
};

const addShift = async () => {
  try {
    isLoading.value = true;
    const { valid } = await addForm.value.validate();
    if (!valid) {
      showErrorMessage("Please fill in all required fields correctly.");
      return;
    }

    const shiftNameToCheck = newShift.value.name;
    if (isShiftNameTaken(shiftNameToCheck)) {
      showErrorMessage(
        `Shift name "${shiftNameToCheck}" already exists. Please choose a different name.`,
      );
      return;
    }

    if (shifts.value.length >= 5) {
      showErrorMessage("Maximum 5 shifts allowed");
      return;
    }

    const tenantId = currentUserTenant.getTenantId();

    const formatTime = (time) => {
      if (/^\d{1,2}$/.test(time)) {
        return `${time.padStart(2, "0")}:00:00`;
      }
      if (/^\d{1,2}:\d{2}$/.test(time)) {
        return `${time}:00`;
      }
      return time;
    };

    const breakTime = "00:30:00";

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/shifts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shift: newShift.value.name,
          entryTime: formatTime(newShift.value.startTime),
          exitTime: formatTime(newShift.value.endTime),
          break: breakTime,
          breakTypes: JSON.stringify(newShift.value.breakTypes),
          status: "assigned",
          tenant: tenantId,
        }),
      },
    );

    if (response.ok) {
      await fetchShifts();
      closeAddDialog();
      showSuccessMessage("Shift added successfully");
    } else {
      const errorData = await response.json();
      console.error("Server error:", errorData);
      showErrorMessage(
        `Failed to add shift: ${errorData.message || "Unknown error"}`,
      );
    }
  } catch (error) {
    console.error("Error adding shift:", error);
    showErrorMessage(
      `An error occurred while saving the shift data: ${error.message}`,
    );
  } finally {
    isLoading.value = false;
  }
};

const deleteShift = async (shiftId) => {
  try {
    isLoading.value = true;
    const shiftToDelete = shifts.value.find((s) => s.id === shiftId);
    if (shiftToDelete && SHIFT_NAMES.includes(shiftToDelete.name)) {
      showErrorMessage(`Cannot delete default shift: "${shiftToDelete.name}"`);
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/shifts/${shiftId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      await fetchShifts();
      showSuccessMessage("Shift deleted successfully");
    } else {
      console.error("Failed to delete shift");
      showErrorMessage("Failed to delete shift.");
    }
  } catch (error) {
    console.error("Error deleting shift:", error);
    showErrorMessage(
      `An error occurred while deleting the shift: ${error.message}`,
    );
  } finally {
    isLoading.value = false;
  }
};

const saveChanges = async () => {
  try {
    isLoading.value = true;
    const { valid } = await editForm.value.validate();
    if (!valid) {
      showErrorMessage("Please fill in all required fields correctly.");
      return;
    }

    const shiftNameToCheck = editedShift.value.name;
    if (isShiftNameTakenForEdit(shiftNameToCheck)) {
      showErrorMessage(
        `Shift name "${shiftNameToCheck}" already exists. Please choose a different name.`,
      );
      return;
    }

    const breakTime = "00:30:00";

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/shifts/${editedShift.value.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shift: editedShift.value.name,
          entryTime: editedShift.value.startTime + ":00",
          exitTime: editedShift.value.endTime + ":00",
          break: breakTime,
          breakTypes: JSON.stringify(editedShift.value.breakTypes),
        }),
      },
    );

    if (response.ok) {
      await fetchShifts();
      closeEditDialog();
      showSuccessMessage("Shift updated successfully");
    } else {
      const errorData = await response.json();
      console.error("Server error:", errorData);
      showErrorMessage(
        `Failed to update shift: ${errorData.message || "Unknown error"}`,
      );
    }
  } catch (error) {
    console.error("Error updating shift:", error);
    showErrorMessage(
      `An error occurred while updating the shift: ${error.message}`,
    );
  } finally {
    isLoading.value = false;
  }
};

const getShiftIcon = (shiftName) => {
  const icons = {
    Night: "mdi-weather-night",
    Morning: "mdi-weather-sunny",
    Evening: "mdi-weather-sunset",
    "Week Off": "mdi-calendar-remove",
    General: "mdi-clock-outline",
  };
  const normalizedName = shiftName.toLowerCase();
  if (normalizedName.includes("night")) return icons.Night;
  if (normalizedName.includes("morning")) return icons.Morning;
  if (normalizedName.includes("evening")) return icons.Evening;
  if (normalizedName.includes("week off")) return icons["Week Off"];
  return icons.General;
};

const getShiftIconClass = (shiftName) => {
  const classes = {
    Night: "shift-icon-night",
    Morning: "shift-icon-morning",
    Evening: "shift-icon-evening",
    "Week Off": "shift-icon-weekoff",
    General: "shift-icon-general",
  };
  const normalizedName = shiftName.toLowerCase();
  if (normalizedName.includes("night")) return classes.Night;
  if (normalizedName.includes("morning")) return classes.Morning;
  if (normalizedName.includes("evening")) return classes.Evening;
  if (normalizedName.includes("week off")) return classes["Week Off"];
  return classes.General;
};

const getShiftColor = (shiftName) => {
  const colors = {
    Night: "deep-purple",
    Morning: "orange",
    Evening: "blue",
    "Week Off": "grey",
    General: "primary",
  };
  const normalizedName = shiftName.toLowerCase();
  if (normalizedName.includes("night")) return colors.Night;
  if (normalizedName.includes("morning")) return colors.Morning;
  if (normalizedName.includes("evening")) return colors.Evening;
  if (normalizedName.includes("week off")) return colors["Week Off"];
  return colors.General;
};

const getShiftCardClass = (shiftName) => {
  const normalizedName = shiftName.toLowerCase();
  if (normalizedName.includes("night")) return "shift-card-night";
  if (normalizedName.includes("morning")) return "shift-card-morning";
  if (normalizedName.includes("evening")) return "shift-card-evening";
  if (normalizedName.includes("week off")) return "shift-card-weekoff";
  return "shift-card-general";
};

const getShiftTypeLabel = (shiftName) => {
  const normalizedName = shiftName.toLowerCase();
  if (normalizedName.includes("night")) return "Night Shift";
  if (normalizedName.includes("morning")) return "Morning Shift";
  if (normalizedName.includes("evening")) return "Evening Shift";
  if (normalizedName.includes("week off")) return "Week Off";
  return "Regular Shift";
};

const getDuration = (start, end) => {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  let duration = endHour - startHour;
  let durationMinutes = endMinute - startMinute;
  if (durationMinutes < 0) {
    duration--;
    durationMinutes += 60;
  }
  if (duration < 0) duration += 24;
  return duration + durationMinutes / 60;
};

const handleSort = ({ field, direction }) => {
  shifts.value.sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    if (field === "duration") {
      aValue = getDuration(a.startTime, a.endTime);
      bValue = getDuration(b.startTime, b.endTime);
    }

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

watch(
  () => newShift.value.startTime,
  (newStartTime) => {
    if (newStartTime) {
      const [hours, minutes] = newStartTime.split(":").map(Number);
      let endHours = hours + 9;
      if (endHours >= 24) endHours -= 24;
      newShift.value.endTime = `${String(endHours).padStart(2, "0")}:${String(
        minutes,
      ).padStart(2, "0")}`;
    }
  },
);

watch(
  () => editedShift.value.startTime,
  (newStartTime) => {
    if (newStartTime) {
      const [hours, minutes] = newStartTime.split(":").map(Number);
      let endHours = hours + 9;
      if (endHours >= 24) endHours -= 24;
      editedShift.value.endTime = `${String(endHours).padStart(
        2,
        "0",
      )}:${String(minutes).padStart(2, "0")}`;
    }
  },
);

onMounted(() => {
  user();
  fetchShifts();
});
</script>

<style scoped>
.shifts-table-wrapper:focus-within {
  outline: none !important;
  outline-offset: 0 !important;
}
.shifts-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 8px;
  position: relative;
  z-index: 1;
}

.shifts-table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.shift-name-cell {
  display: flex;
  align-items: center;
}

.shift-name-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shift-name-text {
  font-size: 1rem;
  font-weight: 500;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.default-badge {
  font-size: 0.75rem;
  font-weight: 500;
}

.shift-type-badge {
  font-weight: 500;
  font-size: 0.75rem;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

.time-value {
  color: #1a1a1a;
  font-weight: 600;
}

.duration-chip {
  font-weight: 500;
}

.action-section {
  display: flex;
  gap: 12px;
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

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
}

.shift-dialog .v-overlay__content {
  margin: 16px;
}

.dialog-card {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dialog-title-section {
  flex: 1;
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

.form-section {
  margin-bottom: 24px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-icon {
  color: #1976d2;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.form-field {
  margin-bottom: 12px;
}
.form-field :deep(.v-field) {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.time-inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.time-input-group {
  display: flex;
  flex-direction: column;
}

.time-display {
  font-size: 0.875rem;
  color: #1976d2;
  font-weight: 600;
  text-align: center;
  margin-top: 6px;
  padding: 4px 8px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 6px;
}

.dialog-footer {
  background: #f8f9fa;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
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

@media (max-width: 1200px) {
  .shifts-table-wrapper {
    font-size: 0.85rem;
  }
}

@media (max-width: 960px) {
  .time-inputs-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .dialog-header {
    padding: 20px;
  }

  .dialog-content {
    padding: 20px;
  }

  .dialog-footer {
    padding: 16px 20px;
    flex-direction: column;
    gap: 8px;
  }

  .footer-btn {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .shifts-container {
    padding: 12px;
  }

  .shift-name-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .time-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .action-section {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .dialog-header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .dialog-title {
    font-size: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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

.add-shift-btn:focus,
.action-btn:focus,
.footer-btn:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.shifts-table-wrapper:focus-within {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

@media (prefers-contrast: high) {
  .shifts-table-wrapper {
    border: 2px solid #000;
  }
}

@media (prefers-reduced-motion: reduce) {
  .table-row,
  .add-shift-btn,
  .action-btn {
    transition: none;
  }

  .table-row:hover {
    transform: none;
  }

  .add-shift-btn:hover,
  .edit-btn:hover,
  .delete-btn:hover {
    transform: none;
  }
}
</style>

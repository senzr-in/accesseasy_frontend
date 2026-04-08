<template>
  <div class="leave-policy">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="#059367"
          ></v-progress-circular>
          <p>Loading leave details...</p>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else class="pa-4">
      <div class="d-flex justify-space-between align-center mb-4">
        <h3></h3>
        <div class="d-flex gap-2">
          <BaseButton
            v-if="!isEditMode"
            variant="secondary"
            text="Edit"
            @click="enableEditMode"
          />
          <template v-else>
            <BaseButton
              variant="secondary"
              text="Cancel"
              @click="cancelEditMode"
            />
            <BaseButton
              variant="primary"
              text="Update"
              :disabled="!hasChanges"
              @click="updateLeavePolicy"
            />
          </template>
        </div>
      </div>
      <br />
      <DataTable
        :items="enabledLeaves"
        :columns="columns"
        :selectedItems="selectedItems"
        :showSelection="false"
        :sortBy="sortBy"
        :sortDirection="sortDirection"
        :expandable="false"
        itemKey="leaveName"
        @update:sortBy="sortBy = $event"
        @update:sortDirection="sortDirection = $event"
        @sort="handleSort"
      >
        <!-- Custom Cell Content for leaveName -->
        <template #cell-leaveName="{ item }">
          <!-- <v-icon :color="getLeaveColor(item.leaveName)" size="18" class="mr-2">
            {{ getLeaveIcon(item.leaveName).icon }}
          </v-icon> -->
          {{ formatLeaveType(item.leaveName) }}
        </template>

        <!-- Custom Cell Content for days -->
        <template #cell-days="{ item }">
          <v-text-field
            v-if="item.isEditing"
            v-model.number="item.leaveConfig.days"
            type="number"
            min="0"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 80px"
            @blur="finishEditing(item)"
            :disabled="!item.isAssigned"
          />
          <span v-else>{{ item.leaveConfig?.days || 0 }}</span>
        </template>

        <!-- Custom Cell Content for monthLimit -->
        <template #cell-monthLimit="{ item }">
          {{ item.leaveConfig?.monthLimit || 0 }}
        </template>

        <!-- Custom Cell Content for limit -->
        <template #cell-limit="{ item }">
          {{ item.leaveConfig?.limit || 0 }}
        </template>

        <!-- Custom Cell Content for leaveBalance -->
        <template #cell-leaveBalance="{ item }">
          {{ item.leaveBalance || 0 }}
        </template>

        <!-- Custom Cell Content for leaveTaken -->
        <template #cell-leaveTaken="{ item }">
          {{ item.leaveTaken || 0 }}
        </template>

        <!-- Custom Cell Content for isAssigned -->
        <template #cell-isAssigned="{ item }">
          <v-switch
            v-model="item.isAssigned"
            color="#059367"
            track-color="red"
            true-icon="mdi-check"
            false-icon="mdi-close"
            inset
            hide-details
            :readonly="!isEditMode"
            @change="handleLeaveToggle(item)"
          />
        </template>

        <!-- Custom Cell Content for edit -->
        <!-- <template #cell-edit="{ item }">
          <v-btn
            v-if="!item.isEditing"
            icon
            size="x-small"
            @click="startEditing(item)"
            :disabled="!item.isAssigned || !isEditMode"
          >
            <v-icon size="16">mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            v-else
            icon
            size="x-small"
            color="red"
            @click="cancelEditing(item)"
          >
            <v-icon size="16">mdi-close</v-icon>
          </v-btn>
        </template> -->
      </DataTable>
    </v-container>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";

const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employeeData"]);
const hasLoaded = ref(false);
const loading = ref(true);
const enabledLeaves = ref([]);
const originalLeaves = ref([]);
const hasChanges = ref(false);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const sortBy = ref("leaveName");
const sortDirection = ref("asc");
const selectedItems = ref([]);
const isEditMode = ref(false);

const columns = ref([
  { key: "leaveName", label: "Leave Type", width: "20px" },
  { key: "days", label: "Days", width: "20px" },
  { key: "monthLimit", label: "Month Limit", width: "20px" },
  { key: "limit", label: "Carry Forward", width: "20px" },
  { key: "leaveBalance", label: "Balance", width: "20px" },
  { key: "leaveTaken", label: "Taken", width: "20px" },
  { key: "isAssigned", label: "Enable the leave", width: "20px" },
  // { key: "edit", label: "Edit" },
]);

const getLeaveColor = (leaveName) => {
  return leaveName === "Annual" ? "blue" : "green";
};

const getLeaveIcon = (leaveName) => {
  return { icon: leaveName === "Annual" ? "mdi-calendar" : "mdi-medical-bag" };
};

const formatLeaveType = (leaveName) => {
  return leaveName.replace(/([A-Z])/g, " $1").trim();
};

const enableEditMode = () => {
  isEditMode.value = true;
};

const cancelEditMode = () => {
  // Revert all changes
  enabledLeaves.value = JSON.parse(JSON.stringify(originalLeaves.value));
  // Close all editing fields
  enabledLeaves.value.forEach((leave) => {
    leave.isEditing = false;
  });
  isEditMode.value = false;
  hasChanges.value = false;
};

const handleLeaveToggle = (leave) => {
  if (!isEditMode.value) return;

  if (!leave.isAssigned && leave.isEditing) {
    leave.isEditing = false;
  }
  markAsChanged();
};

const startEditing = (leave) => {
  if (leave.isAssigned && isEditMode.value) {
    leave.isEditing = true;
  }
};

const cancelEditing = (leave) => {
  const original = originalLeaves.value.find(
    (l) => l.leaveName === leave.leaveName,
  );
  if (original) {
    leave.leaveConfig.days = original.leaveConfig.days;
  }
  leave.isEditing = false;
};

const finishEditing = (leave) => {
  if (typeof leave.leaveConfig.days === "string") {
    leave.leaveConfig.days = parseInt(leave.leaveConfig.days) || 0;
  }
  leave.isEditing = false;
  markAsChanged();
};

const markAsChanged = () => {
  hasChanges.value = true;
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const handleSort = ({ field, direction }) => {
  enabledLeaves.value.sort((a, b) => {
    let aValue, bValue;
    if (field === "days" || field === "monthLimit" || field === "limit") {
      aValue = a.leaveConfig[field] || 0;
      bValue = b.leaveConfig[field] || 0;
    } else if (field === "leaveBalance" || field === "leaveTaken") {
      aValue = a[field] || 0;
      bValue = b[field] || 0;
    } else if (field === "isAssigned") {
      aValue = a[field] ? 1 : 0;
      bValue = b[field] ? 1 : 0;
    } else {
      aValue = a[field] || "";
      bValue = b[field] || "";
    }
    if (direction === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

const fetchLeavePolicies = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const currentYear = new Date().getFullYear();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveSetting?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][year(yearOfPolicy)][_eq]=${currentYear}&fields=id,leaveName,leaveConfig`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch leave policies");
    }
    const data = await response.json();
    enabledLeaves.value = data.data
      .filter((leave) => leave.leaveConfig?.isEnabled)
      .map((leave) => ({
        ...leave,
        isAssigned: false,
        isEditing: false,
        leaveConfig: {
          ...leave.leaveConfig,
          days: Number(leave.leaveConfig?.days) || 0,
          limit: Number(leave.leaveConfig?.limit) || 0,
          monthLimit: Number(leave.leaveConfig?.monthLimit) || 0,
        },
        leaveBalance: 0,
        leaveTaken: 0,
      }));
  } catch (error) {
    console.error("Error fetching leave policies:", error);
    enabledLeaves.value = [];
    showErrorMessage("Failed to fetch leave policies");
  }
};

let leaveId = null;

const getLeavePolicy = async () => {
  try {
    const token = authService.getToken();
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=leaves.id&fields[]=leaves.leaveBalance&fields[]=leaves.leaveTaken&fields[]=leaves.assignedLeave&filter[assignedUser][tenant][tenantId][_eq]=${tenantId}&filter[id][_eq]=${props.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to fetch leave policy",
      );
    }
    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].leaves) {
      const leavesData = data.data[0].leaves;
      leaveId = leavesData.id;
      enabledLeaves.value = enabledLeaves.value.map((leave) => {
        const normalizedLeaveName = leave.leaveName
          .toLowerCase()
          .replace(/\s+/g, "");
        const balanceKey = Object.keys(leavesData.leaveBalance || {}).find(
          (key) =>
            key.toLowerCase().replace(/\s+/g, "") === normalizedLeaveName,
        );
        const takenKey = Object.keys(leavesData.leaveTaken || {}).find(
          (key) =>
            key.toLowerCase().replace("t", "").replace(/\s+/g, "") ===
            normalizedLeaveName,
        );
        const isAssigned = leavesData.assignedLeave
          ? leavesData.assignedLeave.includes(leave.leaveName)
          : false;
        return {
          ...leave,
          isAssigned,
          leaveBalance: balanceKey
            ? Number(leavesData.leaveBalance[balanceKey]) || 0
            : 0,
          leaveTaken: takenKey
            ? Number(leavesData.leaveTaken[takenKey]) || 0
            : 0,
          leaveConfig: {
            ...leave.leaveConfig,
            days: balanceKey
              ? Number(leavesData.leaveBalance[balanceKey]) || 0
              : Number(leave.leaveConfig.days) || 0,
            limit: Number(leave.leaveConfig.limit) || 0,
            monthLimit: Number(leave.leaveConfig.monthLimit) || 0,
          },
        };
      });
      originalLeaves.value = JSON.parse(JSON.stringify(enabledLeaves.value));
      hasChanges.value = false;
    } else {
      throw new Error("Leaves data not found in response");
    }
  } catch (error) {
    console.error("Error fetching leave policy:", error);
    showErrorMessage("Failed to fetch leave policy. Please try again.");
    throw error;
  } finally {
    loading.value = false;
    hasLoaded.value = true;
  }
};

const constructLeavesPayload = () => {
  const leavesPayload = {
    leaveBalance: {},
    CarryForwardleave: {},
    leaveTaken: {},
    monthLimit: {},
    assignedLeave: [],
  };
  enabledLeaves.value.forEach((leave) => {
    const leaveType = leave.leaveName.toLowerCase().replace(/\s+/g, "");
    leavesPayload.leaveBalance[leaveType] =
      Number(leave.leaveConfig?.days) || 0;
    leavesPayload.CarryForwardleave[leaveType] =
      Number(leave.leaveConfig?.limit) || 0;
    leavesPayload.monthLimit[leaveType] =
      Number(leave.leaveConfig?.monthLimit) || 0;
    leavesPayload.leaveTaken[`t${leaveType}`] =
      leavesPayload.leaveTaken[`t${leaveType}`] || 0;
    if (leave.isAssigned) {
      leavesPayload.assignedLeave.push(leave.leaveName);
    }
  });
  return leavesPayload;
};

const updateLeavePolicy = async () => {
  try {
    const token = authService.getToken();
    const leavesPayload = constructLeavesPayload();
    if (!leaveId) {
      throw new Error("Leave ID not found. Please fetch leave policy first.");
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leave/${leaveId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leavesPayload),
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to update leave policy",
      );
    }
    originalLeaves.value = JSON.parse(JSON.stringify(enabledLeaves.value));
    hasChanges.value = false;
    isEditMode.value = false;
    emit("update:employeeData", {
      ...props.employeeData,
      leaves: leavesPayload,
    });
    showSuccessMessage("Leave policy updated successfully!");
  } catch (error) {
    console.error("Error in updateLeavePolicy:", error);
    showErrorMessage("Failed to update leave policy. Please try again.");
  }
};

const hasChangesComputed = computed(() => {
  return (
    JSON.stringify(enabledLeaves.value) !== JSON.stringify(originalLeaves.value)
  );
});

onMounted(async () => {
  await fetchLeavePolicies();
  await getLeavePolicy();
  watch(
    enabledLeaves,
    () => {
      hasChanges.value = hasChangesComputed.value;
    },
    { deep: true },
  );
});
</script>

<style scoped>
.leave-policy {
  border-radius: 8px;
}
.days-input {
  max-width: 100px;
}
.disabled-row {
  background-color: #ececec !important;
  color: #666;
}
.gap-2 {
  gap: 8px;
}
</style>

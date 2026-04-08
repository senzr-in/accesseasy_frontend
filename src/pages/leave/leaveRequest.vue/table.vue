<template>
  <div class="employee-container">
    <!-- Main Content with Table -->
    <div class="main-content" :class="{ 'with-drawer': showAddForm }">
      <DataTableWrapper
        :searchQuery="search"
        @update:searchQuery="handleSearchUpdate"
        :showSearch="true"
        :hasError="showError"
        wrapperClass="employee-table-wrapper"
      >
        <!-- Toolbar Actions Slot -->
        <template #toolbar-actions>
          <div class="header-actions">
            <BaseButton
              variant="primary"
              size="md"
              text="Request"
              :leftIcon="Plus"
              @click="toggleAddForm"
            />
          </div>
        </template>

        <!-- Table Content -->
        <template #default>
          <SkeletonLoading
            v-if="loading"
            variant="data-table"
            :rows="6"
            :columns="columns.length"
            :animated="true"
          />
          <DataTable
            v-else
            :items="items"
            :columns="columns"
            :selected-items="selected"
            :show-selection="true"
            :row-clickable="false"
            @update:selected-items="selected = $event"
          >
            <!-- Custom Cell Content -->
            <template #cell-date_created="{ item }">
              {{ formatDate(item.date_created) }}
            </template>
            <template #cell-status="{ item }">
              <div class="d-flex align-center">
                <span class="status-chip" :class="getStatusClass(item.status)">
                  <v-icon
                    size="small"
                    class="me-1"
                    :color="getIconColor(item.status)"
                  >
                    {{ getStatusIcon(item.status) }}
                  </v-icon>
                  {{ formatStatus(item.status) }}
                </span>
                <BaseButton
                  v-if="item.status === 'pending'"
                  variant="danger"
                  size="sm"
                  text="Cancel"
                  @click.stop="cancelRequest(item.id)"
                />
              </div>
            </template>
            <template #empty>
              <div class="d-flex flex-column align-center pa-4">
                <v-icon size="large" color="grey" class="mb-2"
                  >mdi-calendar-blank</v-icon
                >
                <div class="text-subtitle-1 text-medium-emphasis">
                  No leave requests found
                </div>
                <div
                  v-if="noLeaveTypesEnabled"
                  class="text-caption text-medium-emphasis mt-2"
                >
                  You don't have access to any leave types. Please contact your
                  administrator.
                </div>
                <div v-else class="text-caption text-medium-emphasis mt-2">
                  No leave requests available. Create a new request to get
                  started.
                </div>
              </div>
            </template>
          </DataTable>
        </template>

        <!-- Pagination Slot -->
        <template #pagination>
          <CustomPagination
            v-model:page="page"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            :is-searching="!!search"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>

      <!-- Drawer for Add Form -->
      <v-navigation-drawer
        v-model="showAddForm"
        location="right"
        width="400"
        temporary
        class="form-drawer"
      >
        <add-form
          v-if="showAddForm"
          @closeAddPage="toggleAddForm"
          @leaveApplied="handleLeaveApplied"
        />
      </v-navigation-drawer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import AddForm from "./add.vue";
import { Plus } from "lucide-vue-next";

const selected = ref([]);
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showError = ref(false);
const errorMessage = ref("");
const totalItems = ref(0);
const page = ref(1);
const itemsPerPage = ref(25);
const noLeaveTypesEnabled = ref(false);
const showAddForm = ref(false);

const leaveConfig = ref({
  enabledLeaveTypes: [],
});
const leaveBalance = ref({});
const leaveTaken = ref({});
const monthLimits = ref({});
const cumulativeLimits = ref({});
const personalModuleData = ref(null);
const userRole = currentUserTenant.getRole();
const isAdmin = computed(() => userRole === "Admin");
const isEmployee = computed(() => userRole === "Employee");

const columns = [
  { key: "date_created", label: "Applied On", width: 150, sortable: false },
  { key: "leaveType", label: "Type", width: 120, sortable: false },
  { key: "fromDate", label: "From", width: 120, sortable: false },
  { key: "toDate", label: "To", width: 120, sortable: false },
  { key: "reason", label: "Reason", width: 200, sortable: false },
  { key: "status", label: "Status", width: 250, sortable: false },
];

const totalMonthLimit = computed(() => {
  if (
    !leaveConfig.value.enabledLeaveTypes ||
    leaveConfig.value.enabledLeaveTypes.length === 0
  ) {
    return 0;
  }

  return leaveConfig.value.enabledLeaveTypes.reduce((total, leaveType) => {
    const normalizedLeaveType = leaveType.toLowerCase().replace(/\s+/g, "");
    const monthLimit = monthLimits.value[normalizedLeaveType] || 0;
    const cumulativeAvailable =
      cumulativeLimits.value[normalizedLeaveType] || 0;
    return total + monthLimit + cumulativeAvailable;
  }, 0);
});

const totalTaken = computed(() => {
  if (
    !leaveConfig.value.enabledLeaveTypes ||
    leaveConfig.value.enabledLeaveTypes.length === 0
  ) {
    return 0;
  }

  return leaveConfig.value.enabledLeaveTypes.reduce((total, leaveType) => {
    const normalizedLeaveType = leaveType.toLowerCase().replace(/\s+/g, "");
    const taken = leaveTaken.value[`t${normalizedLeaveType}`] || 0;
    return total + taken;
  }, 0);
});

const totalRemaining = computed(() => {
  return totalMonthLimit.value - totalTaken.value > 0
    ? totalMonthLimit.value - totalTaken.value
    : 0;
});

const formatDate = (date) => {
  if (!date) return "";
  const newDate = new Date(date);
  return newDate.toISOString().split("T")[0];
};

const formatStatus = (status) => {
  const statusMap = {
    pending: "Requested",
    approved: "Approved",
    declined: "Rejected",
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    pending: "status-requested",
    approved: "status-approved",
    declined: "status-rejected",
  };
  return classes[status] || "";
};

const getStatusIcon = (status) => {
  const icons = {
    pending: "mdi-clock-outline",
    approved: "mdi-check-circle",
    declined: "mdi-close-circle",
  };
  return icons[status] || "mdi-help-circle";
};

const getIconColor = (status) => {
  const colors = {
    pending: "#ff9800",
    approved: "#4caf50",
    declined: "#f44336",
  };
  return colors[status] || "#757575";
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value;
};

const handleLeaveApplied = () => {
  page.value = 1;
  fetchData();
  fetchLeaveBalance();
};

let searchTimeout = null;
const handleSearchUpdate = (value) => {
  search.value = value;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchData();
  }, 300);
};

const aggregateCount = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    const currentTenantId = currentUserTenant.getTenantId();

    const filterParams = {
      "aggregate[count]": "id",
      "filter[_and][0][requestedBy][assignedUser][id][_eq]": userDetails.id,
    };

    const queryString = Object.keys(filterParams)
      .map((key) => `${key}=${encodeURIComponent(filterParams[key])}`)
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?${queryString}&limit=-1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const countData = await response.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;

    console.log("dascasc", totalItems);
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalItems.value = 0;
    showError.value = true;
    errorMessage.value = "Failed to fetch total leave requests.";
  }
};

const fetchData = async () => {
  const token = getToken();
  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }

  loading.value = true;
  try {
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    const tenantId = currentUserTenant.getTenantId();

    const params = new URLSearchParams({
      fields: [
        "id",
        "requestedBy.assignedUser.first_name",
        "requestedBy.id",
        "requestedBy.assignedUser.role.name",
        "requestedBy",
        "leaveType",
        "date_created",
        "fromDate",
        "toDate",
        "reason",
        "status",
        "tenant.tenantId",
        "tenant.tenantName",
      ].join(","),
      sort: "-date_created",
      page: page.value,
      limit: itemsPerPage.value,
    });

    params.append("sort[]", "-status");
    params.append(
      "filter[_and][0][requestedBy][assignedUser][id][_eq]",
      userDetails.id,
    );

    if (search.value) {
      params.append("filter[_and][3][_or][0][reason][_contains]", search.value);
      params.append(
        "filter[_and][3][_or][1][leaveType][_contains]",
        search.value,
      );
      params.append("filter[_and][3][_or][2][status][_contains]", search.value);
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    items.value = Array.isArray(data.data) ? data.data : [];
    await aggregateCount(); // Ensure totalItems is updated after fetching data
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    showError.value = true;
    errorMessage.value = "Failed to load leave requests.";
    items.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchData();
};

const calculateDays = (fromDate, toDate, isHalfDay) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return isHalfDay ? diffDays * 0.5 : diffDays;
};

const cancelRequest = async (id) => {
  try {
    const token = getToken();

    const leaveDetailsResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!leaveDetailsResponse.ok) {
      throw new Error("Failed to fetch leave request details");
    }

    const leaveDetails = await leaveDetailsResponse.json();
    const { leaveType, fromDate, toDate, halfDay, requestedBy } =
      leaveDetails.data;

    const numberOfDays = calculateDays(fromDate, toDate, halfDay);

    const deleteResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!deleteResponse.ok) {
      throw new Error("Failed to cancel request");
    }

    items.value = items.value.filter((item) => item.id !== id);
    await aggregateCount(); // Update totalItems after deletion

    const personalModuleResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=leaves.id&fields[]=leaves.CarryForwardleave&fields[]=leaves.leaveBalance&fields[]=leaves.leaveTaken&fields[]=leaves.monthLimit&fields[]=leaves.assignedLeave&filter[_and][0][id][_eq]=${requestedBy}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!personalModuleResponse.ok) {
      throw new Error(`HTTP error! Status: ${personalModuleResponse.status}`);
    }

    const personalModuleData = await personalModuleResponse.json();
    const personalModuleInfo = personalModuleData.data?.[0];

    if (!personalModuleInfo) {
      throw new Error("Personal module not found");
    }

    if (!personalModuleInfo.leaves) {
      throw new Error("Leave data not found in personal module");
    }

    if (leaveType.toLowerCase().replace(/\s+/g, "") === "unpaidleave") {
      await fetchLeaveBalance();
      return;
    }

    const personalLeaveData = personalModuleInfo.leaves;
    const normalizedLeaveType = leaveType.toLowerCase().replace(/\s+/g, "");
    const balanceKey = normalizedLeaveType;
    const takenKey = `t${normalizedLeaveType}`;

    const updatedLeaveTaken = { ...personalLeaveData.leaveTaken };
    updatedLeaveTaken[takenKey] = Math.max(
      0,
      (updatedLeaveTaken[takenKey] || 0) - numberOfDays,
    );

    const updatedLeaveBalance = { ...personalLeaveData.leaveBalance };
    updatedLeaveBalance[balanceKey] =
      (updatedLeaveBalance[balanceKey] || 0) + numberOfDays;

    const updateResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leave/${personalLeaveData.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveTaken: updatedLeaveTaken,
        }),
      },
    );

    if (!updateResponse.ok) {
      throw new Error("Failed to update leave balance");
    }

    await fetchLeaveBalance();
  } catch (error) {
    console.error("Error cancelling request:", error);
    showError.value = true;
    errorMessage.value = "Failed to cancel request and update leave balance.";
  }
};

const fetchLeaveBalance = async () => {
  try {
    const token = getToken();
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    const userId = userDetails.id;

    const personalModuleResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=id,assignedUser.dateOfJoining,leaves.id,leaves.CarryForwardleave,leaves.monthLimit,leaves.leaveBalance,leaves.leaveTaken,leaves.assignedLeave&filter[_and][0][assignedUser][id][_eq]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!personalModuleResponse.ok) {
      throw new Error(`HTTP error! Status: ${personalModuleResponse.status}`);
    }

    const personalModuleDataResponse = await personalModuleResponse.json();
    personalModuleData.value = personalModuleDataResponse.data?.[0];

    if (!personalModuleData.value) {
      throw new Error("Personal module not found");
    }

    const assignedLeaves = personalModuleData.value.leaves?.assignedLeave || [];

    if (!assignedLeaves || assignedLeaves.length === 0) {
      noLeaveTypesEnabled.value = true;
      return;
    }

    leaveConfig.value.enabledLeaveTypes = assignedLeaves.map((leave) =>
      leave.toLowerCase().replace(/\s+/g, ""),
    );
    noLeaveTypesEnabled.value = assignedLeaves.length === 0;

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
    }

    // await calculateCumulativeLimits(
    //   userDetails,
    //   assignedLeaves,
    //   personalModuleData.value.assignedUser.dateOfJoining,
    // );
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    showError.value = true;
    errorMessage.value = "Failed to load leave balance.";
  }
};

// const calculateCumulativeLimits = async (
//   userDetails,
//   assignedLeaves,
//   dateOfJoining,
// ) => {
//   try {
//     const token = getToken();
//     const userId = userDetails.id;
//     const tenantId = currentUserTenant.getTenantId();

//     const joinDate = new Date(dateOfJoining);
//     if (!dateOfJoining || isNaN(joinDate.getTime())) {
//       console.warn("⚠️ Invalid or missing join date:", dateOfJoining);
//       showError.value = true;
//       errorMessage.value = "Joining date is missing or invalid.";
//       return;
//     }

//     const currentDate = new Date();

//     const leaveNamesFilter = assignedLeaves
//       .map((leave) => encodeURIComponent(leave))
//       .join(",");
//     const leaveSettingUrl =
//       `${import.meta.env.VITE_API_URL}/items/leaveSetting?` +
//       `fields[]=leaveName,date_created&` +
//       `filter[_and][0][leaveName][_in]=${leaveNamesFilter}&` +
//       `filter[_and][1][tenant][tenantId][_eq]=${tenantId}`;

//     const leaveSettingResponse = await fetch(leaveSettingUrl, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!leaveSettingResponse.ok) {
//       console.warn(
//         `⚠️ Failed to fetch leave settings: ${leaveSettingResponse.status}`,
//       );
//       showError.value = true;
//       errorMessage.value = "Failed to fetch leave settings.";
//       return;
//     }

//     const leaveSettingData = await leaveSettingResponse.json();
//     const leaveSettingsMap = new Map(
//       leaveSettingData.data.map((setting) => [
//         setting.leaveName,
//         new Date(setting.date_created),
//       ]),
//     );

//     for (const leaveName of assignedLeaves) {
//       const normalizedKey = leaveName.toLowerCase().replace(/\s+/g, "");

//       const leaveCreationDate = leaveSettingsMap.get(leaveName);
//       if (!leaveCreationDate || isNaN(leaveCreationDate.getTime())) {
//         console.warn(`⚠️ Invalid or missing creation date for ${leaveName}`);
//         continue;
//       }

//       const startDate = new Date(
//         Math.max(joinDate.getTime(), leaveCreationDate.getTime()),
//       );
//       startDate.setDate(1);
//       startDate.setMonth(startDate.getMonth() + 1);

//       const monthsToProcess = [];
//       let currentMonth = new Date(startDate);
//       while (currentMonth <= currentDate && !isNaN(currentMonth.getTime())) {
//         monthsToProcess.push(new Date(currentMonth));
//         currentMonth.setMonth(currentMonth.getMonth() + 1);
//       }

//       if (monthLimits.value[normalizedKey] > 0) {
//         let totalCumulative = 0;

//         for (const month of monthsToProcess) {
//           if (isNaN(month.getTime())) {
//             console.warn(`⚠️ Skipping invalid month: ${month}`);
//             continue;
//           }

//           const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
//           const monthEnd = new Date(
//             month.getFullYear(),
//             month.getMonth() + 1,
//             0,
//           );

//           if (isNaN(monthStart.getTime()) || isNaN(monthEnd.getTime())) {
//             console.warn(`⚠️ Invalid monthStart or monthEnd for ${leaveName}`);
//             continue;
//           }

//           const response = await fetch(
//             `${import.meta.env.VITE_API_URL}/items/leaveRequest?` +
//               `filter[_and][0][requestedBy][assignedUser][id][_eq]=${userId}&` +
//               `filter[_and][1][status][_in]=approved,pending&` +
//               `filter[_and][2][leaveType][_eq]=${encodeURIComponent(leaveName)}&` +
//               `filter[_and][3][fromDate][_gte]=${monthStart.toISOString().split("T")[0]}&` +
//               `filter[_and][4][fromDate][_lte]=${monthEnd.toISOString().split("T")[0]}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             },
//           );

//           if (!response.ok) {
//             console.warn(`⚠️ Failed to fetch leave requests for ${leaveName}`);
//             continue;
//           }

//           const leaveData = await response.json();
//           let monthUsed = 0;
//           for (const leave of leaveData.data || []) {
//             monthUsed += calculateDays(
//               leave.fromDate,
//               leave.toDate,
//               leave.halfDay,
//             );
//           }

//           const monthLimit = monthLimits.value[normalizedKey];
//           if (monthUsed < monthLimit) {
//             totalCumulative += monthLimit - monthUsed;
//           }
//         }

//         cumulativeLimits.value[normalizedKey] = totalCumulative;
//       }
//     }
//   } catch (error) {
//     console.error("❌ Error calculating cumulative limits:", error);
//     showError.value = true;
//     errorMessage.value = "Failed to calculate cumulative limits.";
//   }
// };

watch([search, page, itemsPerPage], async () => {
  await fetchData();
});

onMounted(async () => {
  await fetchData();
  await fetchLeaveBalance();
});
</script>

<style scoped>
.d-flex.align-center {
  gap: 10px;
}
.employee-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  overflow: auto;
  transition: all 0.3s ease;
}

.main-content.with-drawer {
  margin-right: 400px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 10px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
}

:deep(.resizable-header) {
  position: relative;
  background: #f5f5f5;
  padding: 0 16px;
  height: 48px;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  user-select: none;
}

.status-requested {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-approved {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-rejected {
  background-color: #ffebee;
  color: #c62828;
}

.form-drawer {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  top: 0 !important;
  overflow-y: auto;
}

:deep(.v-navigation-drawer__scrim) {
  background: transparent !important;
}

@media (max-width: 960px) {
  .main-content.with-drawer {
    margin-right: 0;
  }

  /* .form-drawer {
    width: 100% !important;
  } */

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
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

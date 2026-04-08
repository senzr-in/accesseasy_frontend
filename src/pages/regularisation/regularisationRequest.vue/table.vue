<template>
  <div class="employee-container">
    <!-- Main Content with Table -->
    <div class="main-content" :class="{ 'with-drawer': showAddForm }">
      <v-alert
        v-if="noAttendanceData"
        type="info"
        variant="tonal"
        class="mb-4"
        title="No Attendance Data Available"
        text="No regularization requests found for the selected period. Please contact your administrator."
      >
      </v-alert>

      <DataTableWrapper
        :searchQuery="search"
        @update:searchQuery="handleSearchUpdate"
        :showSearch="false"
        :isEmpty="items.length === 0"
        :hasError="showError"
        wrapperClass="employee-table-wrapper"
      >
        <!-- Toolbar Actions Slot -->
        <template #toolbar-actions>
          <div class="header-actions">
            <!-- <BaseButton
              variant="primary"
              size="md"
              text="Leave Request"
              :leftIcon="Plus"
              @click="showAddForm = true"
            /> -->
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
            <template #cell-date="{ item }">
              {{ formatDate(item.date) }}
            </template>
            <template #cell-action="{ item }">
              {{ item.action }}
            </template>
            <template #cell-actions="{ item }">
              <ActionButton
                text="Edit"
                :icon="EditIcon"
                variant="edit"
                size="sm"
                @click="toggleAddForm(item)"
                class="action-btn edit-btn"
              />
              <ActionButton
                v-if="item.status === 'pending'"
                variant="danger"
                size="sm"
                text="Cancel"
                @click.stop="cancelRequest(item.id)"
                class="action-btn cancel-btn"
              />
            </template>
            <template #empty>
              <div class="d-flex flex-column align-center pa-4">
                <v-icon size="large" color="grey" class="mb-2"
                  >mdi-calendar-blank</v-icon
                >
                <div class="text-subtitle-1 text-medium-emphasis">
                  No regularization requests found
                </div>
                <div
                  v-if="noAttendanceData"
                  class="text-caption text-medium-emphasis mt-2"
                >
                  No attendance data available. Please contact your
                  administrator.
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
          :selected-item="selectedItem"
          @closeAddPage="toggleAddForm"
          @regularizationApplied="handleRegularizationApplied"
        />
      </v-navigation-drawer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import ActionButton from "@/components/common/buttons/ActionButton.vue";
import AddForm from "./add.vue";
import { Plus, EditIcon } from "lucide-vue-next";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
const selected = ref([]);
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showError = ref(false);
const errorMessage = ref("");
const totalItems = ref(0);
const page = ref(1);
const itemsPerPage = ref(25);
const noAttendanceData = ref(false);
const showAddForm = ref(false);
const cycleType = ref(null);
const cycleStartDate = ref(null);
const cycleEndDate = ref(null);
const selectedItem = ref(null);

const columns = [
  { key: "date", label: "Date", width: 150, sortable: false },
  { key: "status", label: "Action", width: 120, sortable: false },
  { key: "inTime", label: "In Time", width: 120, sortable: false },
  { key: "outTime", label: "Out Time", width: 120, sortable: false },
  { key: "actions", label: "Actions", width: 100, sortable: false },
];

const formatDate = (date) => {
  if (!date) return "";
  const newDate = new Date(date);
  return newDate.toISOString().split("T")[0];
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const toggleAddForm = (item = null) => {
  selectedItem.value = item;
  showAddForm.value = !showAddForm.value;
};

const handleRegularizationApplied = () => {
  fetchData();
};

const cancelRequest = async (id) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendance/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to cancel request");
    }

    items.value = items.value.filter((item) => item.id !== id);
    await aggregateCount();
  } catch (error) {
    console.error("Error cancelling request:", error);
    showError.value = true;
    errorMessage.value = "Failed to cancel request.";
  }
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
      "filter[_and][0][employeeId][assignedUser][id][_eq]": userDetails.id,
      "filter[_and][1][tenant][tenantId][_eq]": currentTenantId,
      "filter[_and][2][status][_eq]": "In",
    };

    if (cycleStartDate.value && cycleEndDate.value) {
      filterParams["filter[_and][3][date][_between][0]"] = cycleStartDate.value;
      filterParams["filter[_and][3][date][_between][1]"] = cycleEndDate.value;
    }

    if (search.value) {
      filterParams["filter[_or][0][reason][_contains]"] = search.value;
      filterParams["filter[_or][1][status][_contains]"] = search.value;
    }

    filterParams["aggregate[countDistinct]"] = "id";

    const queryString = Object.keys(filterParams)
      .map((key) => `${key}=${encodeURIComponent(filterParams[key])}`)
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendance?${queryString}`,
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
    const count = countData?.data?.[0]?.count?.id || 0;
    totalItems.value = Number(count);
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalItems.value = 0;
  }
};

const fetchAttendanceCycle = async (userId) => {
  console.log("Starting fetchAttendanceCycle for userId:", userId);

  try {
    const token = getToken();
    console.log("Token fetched:", token);

    if (!token) {
      throw new Error("Authentication required");
    }

    console.log("Fetching cycleType from personalModule...");
    const personalModuleResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=id,assignedUser.first_name,cycleType&filter[_and][0][assignedUser][id][_eq]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(
      "personalModuleResponse status:",
      personalModuleResponse.status,
    );

    if (!personalModuleResponse.ok) {
      throw new Error(`HTTP error! Status: ${personalModuleResponse.status}`);
    }

    const personalModuleData = await personalModuleResponse.json();
    console.log("personalModuleData:", personalModuleData);

    const personalModule = personalModuleData.data?.[0];
    console.log("personalModule fetched:", personalModule);

    if (!personalModule || !personalModule.cycleType) {
      throw new Error("No cycle type found for user");
    }

    cycleType.value = personalModule.cycleType;
    console.log("User cycleType set:", cycleType.value);

    // Fetch attendance cycle details
    const tenantId = currentUserTenant.getTenantId();
    console.log("Tenant ID:", tenantId);

    console.log("Fetching attendance cycle data...");
    const attendanceCycleResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[tenant][_eq]=${tenantId}&fields[]=id,startDate,endDate,fixedCycle,multi_attendance_cycle.cycles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(
      "attendanceCycleResponse status:",
      attendanceCycleResponse.status,
    );

    if (!attendanceCycleResponse.ok) {
      throw new Error(`HTTP error! Status: ${attendanceCycleResponse.status}`);
    }

    const attendanceCycleData = await attendanceCycleResponse.json();
    console.log("attendanceCycleData:", attendanceCycleData);

    const attendanceCycle = attendanceCycleData.data?.[0];
    console.log("Attendance cycle fetched:", attendanceCycle);

    if (!attendanceCycle || !attendanceCycle.multi_attendance_cycle?.cycles) {
      throw new Error("No attendance cycle data found");
    }

    const cycle = attendanceCycle.multi_attendance_cycle.cycles.find(
      (c) => c.cycleId === parseInt(cycleType.value),
    );
    console.log("Matched cycle:", cycle);

    if (!cycle) {
      throw new Error("Cycle not found for cycleType");
    }

    const currentYear = new Date().getFullYear();
    // Adjust month to 1-12 instead of 0-11
    const currentMonth = new Date().getMonth() + 1;
    console.log("Current year:", currentYear, "Current month:", currentMonth);

    let cycleStartDateValue, cycleEndDateValue;

    if (attendanceCycle.fixedCycle) {
      // Fixed cycle: Use first and last day of the current month
      cycleStartDateValue = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const endDate = new Date(currentYear, currentMonth, 0);
      cycleEndDateValue = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    } else {
      // Non-fixed cycle: Use cycle start and end dates
      const attendanceMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const attendanceYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const startDateMonth = attendanceMonth === 1 ? 12 : attendanceMonth - 1;
      const startDateYear =
        attendanceMonth === 1 ? attendanceYear - 1 : attendanceYear;

      const cycleStartDay = parseInt(cycle.startDate) || 21;
      const cycleEndDay = parseInt(cycle.endDate) || 20;

      cycleStartDateValue = `${startDateYear}-${String(startDateMonth).padStart(2, "0")}-${String(cycleStartDay).padStart(2, "0")}`;
      cycleEndDateValue = `${attendanceYear}-${String(attendanceMonth).padStart(2, "0")}-${String(cycleEndDay).padStart(2, "0")}`;
    }

    cycleStartDate.value = cycleStartDateValue;
    cycleEndDate.value = cycleEndDateValue;

    console.log(
      "Cycle startDate:",
      cycleStartDate.value,
      "Cycle endDate:",
      cycleEndDate.value,
    );
  } catch (error) {
    console.error("Error fetching attendance cycle:", error);
    showError.value = true;
    errorMessage.value = "Failed to load attendance cycle data.";
    noAttendanceData.value = true;

    // Fallback dates
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    cycleStartDate.value = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
    const endDate = new Date(currentYear, currentMonth, 0);
    cycleEndDate.value = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    console.warn("Using fallback dates:", {
      start: cycleStartDate.value,
      end: cycleEndDate.value,
    });
  }

  console.log("fetchAttendanceCycle finished");
};

const fetchData = async () => {
  console.log("Starting fetchData...");

  const token = getToken();
  console.log("Token fetched:", token);

  if (!token) {
    console.log("No token found, exiting fetchData.");
    return;
  }

  console.log("Fetching current user details...");
  const userDetails = await currentUserTenant.fetchLoginUserDetails();
  console.log("User details:", userDetails);

  const tenantId = currentUserTenant.getTenantId();
  console.log("Tenant ID:", tenantId);

  loading.value = true;
  console.log("Loading state set to true");

  try {
    const params = new URLSearchParams({
      fields: ["id", "date", "status", "inTime", "outTime"].join(","),
      sort: "-date",
      page: page.value,
      limit: itemsPerPage.value,
    });
    console.log("Initial params:", params.toString());

    params.append(
      "filter[_and][0][employeeId][assignedUser][id][_eq]",
      userDetails.id,
    );
    params.append("filter[_and][1][tenant][tenantId][_eq]", tenantId);
    console.log("Params after adding filters:", params.toString());

    if (cycleStartDate.value && cycleEndDate.value) {
      params.append("filter[_and][2][date][_between][0]", cycleStartDate.value);
      params.append("filter[_and][2][date][_between][1]", cycleEndDate.value);
      console.log(
        `Date filter applied: ${cycleStartDate.value} to ${cycleEndDate.value}`,
      );
    }
    params.append("filter[_and][3][status][_eq]", "in");
    if (search.value) {
      params.append("filter[_or][0][reason][_contains]", search.value);
      params.append("filter[_or][1][status][_contains]", search.value);
      console.log("Search filter applied:", search.value);
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendance?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Fetch response received:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response JSON data:", data);

    items.value = data.data || [];
    console.log("Items set:", items.value);

    noAttendanceData.value = items.value.length === 0;
    console.log("No attendance data:", noAttendanceData.value);

    await aggregateCount();
    console.log("aggregateCount() completed");
  } catch (error) {
    console.error("Error fetching regularization requests:", error);
    showError.value = true;
    errorMessage.value = "Failed to load regularization requests.";
    totalItems.value = 0;
    noAttendanceData.value = true;
  } finally {
    loading.value = false;
    console.log("Loading state set to false, fetchData finished");
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

onMounted(async () => {
  const userDetails = await currentUserTenant.fetchLoginUserDetails();
  await fetchAttendanceCycle(userDetails.id);
  await fetchData();
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

  .form-drawer {
    width: 100% !important;
  }

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

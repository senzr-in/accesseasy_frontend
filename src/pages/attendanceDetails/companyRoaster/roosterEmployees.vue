<template>
  <div class="attendance-dashboard">
    <!-- Show main table view when showMonthlyReport is false -->
    <template v-if="!showMonthlyReport">
      <v-container fluid class="pa-6">
        <div
          class="d-flex flex-column flex-md-row justify-space-between align-center mb-6"
        >
          <div class="d-flex flex-wrap gap-2">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search employees..."
              hide-details
              variant="outlined"
              density="comfortable"
              dense
              class="search-field mr-2"
            ></v-text-field>
            <v-btn
              color="primary"
              @click="viewSelectedEmployees"
              :disabled="selected.length === 0"
            >
              EDIT Selected ({{ selected.length }})
            </v-btn>
          </div>
        </div>

        <v-card>
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="attendanceData"
            :search="search"
            :loading="loading"
            item-value="id"
            show-select
            hover
            class="elevation-1"
            @click:row="handleRowClick"
          >
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar :color="getAvatarColor(item)" size="36" class="mr-2">
                  <span class="text-white text-subtitle-2">{{
                    getInitials(item)
                  }}</span>
                </v-avatar>
                <div class="font-weight-medium">{{ item.name }}</div>
              </div>
            </template>

            <template v-slot:item.employeeId="{ item }">
              {{ item.employeeId }}
            </template>

            <template v-slot:item.department="{ item }">
              {{ item.department }}
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </template>

    <!-- Show monthly report view when showMonthlyReport is true -->
    <template v-else>
      <v-container fluid class="pa-6">
        <div class="d-flex justify-space-between align-center">
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            @click="backToMainView"
          >
            Back to Dashboard
          </v-btn>
        </div>

        <UserAttendanceReport
          v-if="selectedUsers.length > 0"
          :selectedUsers="selectedUsers"
          :attendanceData="selectedUsers"
          :selectedUserIds="selectedUserIds"
        />
      </v-container>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import UserAttendanceReport from "./companyRoasterDetails.vue";
import axios from "axios";
import { format } from "date-fns";

// State variables
const search = ref("");
const loading = ref(false);
const attendanceData = ref([]);
const employees = ref([]);
const showMonthlyReport = ref(false);
const selected = ref([]);
const selectedUsers = ref([]);

// Table headers
const headers = [
  { title: "Employee Name", key: "name", sortable: true },
  { title: "Employee ID", key: "employeeId", sortable: true },
  { title: "Department", key: "department", sortable: true },
];

// Helper functions
const getInitials = (item) => {
  if (!item?.name) return "";
  return item.name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const getAvatarColor = (item) => {
  const colors = [
    "#1E88E5",
    "#43A047",
    "#E53935",
    "#FB8C00",
    "#8E24AA",
    "#00ACC1",
    "#3949AB",
    "#7CB342",
    "#C0CA33",
    "#FFB300",
  ];
  const identifier = item?.employeeId || item?.name || "";
  const hash = Math.abs(
    identifier.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0),
  );
  return colors[hash % colors.length];
};

const formatTime = (time) => {
  if (!time || time === "-" || time === "00:00:00") return "-";
  return time.substring(0, 5); // Returns HH:mm format
};

const getAttendanceDisplay = (status) => {
  const statusMap = {
    present: "P",
    absent: "A",
    halfDay: "HD",
    weekOff: "WO",
    holiday: "PH",
    paidLeave: "PL",
    unpaidLeave: "UPL",
    onDuty: "OD",
    workFromHome: "WFH",
  };
  return statusMap[status] || status;
};

// Fetch attendance data
const fetchAttendanceData = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    if (!token || !tenantId) {
      console.error("Authentication required or tenant not found");
      return;
    }

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    // Fetch users
    const usersResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][1][status][_neq]=archived&filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}&fields[]=assignedUser.first_name&fields[]=assignedUser.last_name&fields[]=id&fields[]=employeeId&fields[]=assignedDepartment.department_id.departmentName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const users = usersResponse.data.data || [];
    employees.value = users;

    // Fetch attendance data
    const attendanceResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/attendance?filter[_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=date&fields[]=employeeId.id&fields[]=status&fields[]=attendance&fields[]=inTime&fields[]=outTime&fields[]=id&fields[]=workHours&fields[]=mode&fields[]=overTime&fields[]=lateBy&fields[]=earlyDeparture&fields[]=leaveType&fields[]=onTime&fields[]=breakTime`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const attendanceMap = new Map();

    // Initialize map with users
    users.forEach((user) => {
      attendanceMap.set(user.id, {
        name: `${user.assignedUser.first_name} ${user.assignedUser.last_name || ""}`,
        id: user.id,
        employeeId: user.employeeId,
        department:
          user.assignedDepartment?.[0]?.department_id?.departmentName || "N/A",
        presentDays: 0,
        absentDays: 0,
        halfDays: 0,
        weekOffDays: 0,
        holiday: 0,
        onDutyDays: 0,
        workFromHome: 0,
        paidLeave: 0,
        unpaidLeave: 0,
        workingDaysOT: 0,
        holidayOT: 0,
        weekOffOT: 0,
        workFromHomeOT: 0,
        earlyLeaving: 0,
        lateComing: 0,
        dailyRecords: [],
        allRecords: [],
      });
    });

    // Process attendance records
    attendanceResponse.data.data.forEach((record) => {
      const userId = record.employeeId.id;
      if (!attendanceMap.has(userId)) return;

      const userData = attendanceMap.get(userId);
      const recordDate = record.date;

      // Store in allRecords array
      userData.allRecords.push({
        id: record.id,
        date: recordDate,
        attendance: record.attendance,
        inTime: record.inTime || "-",
        outTime: record.outTime || "-",
        workHours: record.workHours || "-",
        lateBy: record.lateBy || "-",
        earlyDeparture: record.earlyDeparture || "-",
        breakTime: record.breakTime || "-",
        overTime: record.overTime || "-",
        mode: record.mode || "-",
        onTime: record.onTime || "-",
        leaveType: record.leaveType || "-",
      });

      // Process current month's data for display
      if (recordDate >= firstDay && recordDate <= lastDay) {
        userData.dailyRecords.push({
          date: recordDate,
          attendance: record.attendance,
          inTime: record.inTime || "-",
          outTime: record.outTime || "-",
          workHours: record.workHours || "-",
          lateBy: record.lateBy || "-",
          earlyDeparture: record.earlyDeparture || "-",
          breakTime: record.breakTime || "-",
          overTime: record.overTime || "-",
          mode: record.mode || "-",
          onTime: record.onTime || "-",
          leaveType: record.leaveType || "-",
        });

        // Update current month counters
        switch (record.attendance) {
          case "present":
            userData.presentDays++;
            if (
              record.overTime &&
              record.overTime !== "" &&
              record.overTime > "00:00:00"
            ) {
              userData.workingDaysOT++;
            }
            break;
          case "absent":
            userData.absentDays++;
            break;
          case "halfDay":
            userData.halfDays++;
            break;
          case "weekOff":
            userData.weekOffDays++;
            if (
              record.overTime &&
              record.overTime !== "" &&
              record.overTime > "00:00:00"
            ) {
              userData.weekOffOT++;
            }
            break;
          case "holiday":
            userData.holiday++;
            if (
              record.overTime &&
              record.overTime !== "" &&
              record.overTime > "00:00:00"
            ) {
              userData.holidayOT++;
            }
            break;
          case "paidLeave":
            userData.paidLeave++;
            break;
          case "unpaidLeave":
            userData.unpaidLeave++;
            break;
          case "onDuty":
            userData.onDutyDays++;
            break;
          case "workFromHome":
            userData.workFromHome++;
            if (
              record.overTime &&
              record.overTime !== "" &&
              record.overTime > "00:00:00"
            ) {
              userData.workingDaysOT++;
            }
            break;
        }

        // Track late comings and early leavings
        if (record.lateBy && record.lateBy !== "00:00:00") {
          userData.lateComing++;
        }
        if (record.earlyDeparture && record.earlyDeparture !== "00:00:00") {
          userData.earlyLeaving++;
        }
      }
    });

    attendanceData.value = Array.from(attendanceMap.values());
  } catch (error) {
    console.error("Error fetching attendance data:", error);
  } finally {
    loading.value = false;
  }
};

// Handle row click
const handleRowClick = (event, { item }) => {
  selectedUsers.value = [item];
  showMonthlyReport.value = true;
  console.log("Selected User ID:", item.id);
};

// View selected employees
const viewSelectedEmployees = () => {
  selectedUsers.value = attendanceData.value.filter((item) =>
    selected.value.includes(item.id),
  );
  showMonthlyReport.value = true;
  console.log("Selected User IDs:", selectedUserIds.value);
};

// Back to main view
const backToMainView = () => {
  showMonthlyReport.value = false;
  selectedUsers.value = [];
  selected.value = [];
};

// New computed property for selected user IDs
const selectedUserIds = computed(() => {
  return selectedUsers.value.map((user) => user.id);
});

// Initialize data on component mount
onMounted(() => {
  fetchAttendanceData();
});
</script>

<style scoped>
.attendance-dashboard {
  background-color: #ffffff;
  min-height: 100vh;
}

.search-field {
  width: 300px;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-data-table) {
  background: white;
  border-radius: 8px;
}

:deep(.v-data-table-header) {
  background: #f7f2f2;
}

:deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.pa-6 {
  padding: 0px !important;
}
</style>

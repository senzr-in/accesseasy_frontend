<template>
  <v-app>
    <v-container fluid class="pa-6">
      <!-- Header -->
      <v-tabs v-model="tab" background-color="transparent" color="primary">
        <v-tab value="employee-kpis">Employee KPIs</v-tab>
        <v-tab value="overview">
          Overview
          <v-chip color="warning" size="x-small" class="ml-2">Premium</v-chip>
        </v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="overview">
          <v-row class="mt-4">
            <v-col cols="12">
              <v-alert type="info" prominent>
                The Overview tab is a premium feature. Please upgrade to a premium plan to unlock this feature.
                <v-btn color="primary" class="mt-2" @click="redirectToPremium">Upgrade Now</v-btn>
              </v-alert>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="employee-kpis">
          <!-- Employee-Specific KPI Panel (Unchanged) -->
          <v-row class="mt-8">
            <v-col cols="12">
              <v-card class="pa-6" elevation="2" rounded="lg">
                <v-row align="center">
                  <v-col cols="12" md="8">
                    <h2 class="text-h5 font-weight-bold">Employee KPIs</h2>
                    <div class="d-flex align-center mt-4 flex-wrap">
                      <v-autocomplete
  v-model="selectedEmployee"
  :items="employees"
  item-title="name"
  item-value="id"
  label="Search Employee"
  variant="outlined"
  dense
  clearable
  return-object
  :search-input.sync="searchQuery"
  no-data-text="No employees found"
  class="mr-4"
  style="max-width: 300px;"
></v-autocomplete>
                      <v-select
                        v-model="selectedMonth"
                        :items="months"
                        item-title="text"
                        item-value="value"
                        label="Select Month"
                        variant="outlined"
                        dense
                        class="mr-4"
                        style="max-width: 150px;"
                      ></v-select>
                      <v-select
                        v-model="selectedYear"
                        :items="years"
                        label="Select Year"
                        variant="outlined"
                        dense
                        class="mr-4"
                        style="max-width: 150px;"
                      ></v-select>
                      <v-chip v-if="selectedEmployee && selectedEmployeeOrg" color="blue" class="ml-2 mr-4" small>
                        {{ selectedEmployeeOrg }}
                      </v-chip>
                      <v-btn
                        color="primary"
                        class="mr-2"
                        small
                        :disabled="!selectedEmployee"
                        @click="downloadCSV"
                      >
                        <v-icon left>mdi-download</v-icon> CSV
                      </v-btn>
                      <v-btn
                        color="primary"
                        small
                        :disabled="!selectedEmployee"
                        @click="openPDFDialog"
                      >
                        <v-icon left>mdi-download</v-icon> PDF
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>

                <v-expand-transition>
                  <div v-if="selectedEmployee">
                    <v-row class="mt-6">
                      <v-col cols="12" md="3">
                        <v-card flat class="pa-4">
                          <div class="d-flex align-center">
                            <v-avatar size="48" color="blue lighten-4" class="mr-3">
                              <v-img v-if="avatarImage" :src="avatarImage" alt="Employee Avatar"></v-img>
                              <span v-else class="text-h6">{{ employeeData.name[0] }}</span>
                            </v-avatar>
                            <div>
                              <div class="text-h6 font-weight-bold">{{ employeeData.name }}</div>
                              <div class="text-caption text-grey">{{ employeeData.employeeId }}</div>
                            </div>
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="9">
                        <v-row>
                          <v-col v-for="kpi in employeeData.kpis" :key="kpi.title" cols="12" sm="6" md="4">
                            <v-card flat class="pa-4">
                              <div class="text-subtitle-2 font-weight-medium">{{ kpi.title }}</div>
                              <div class="mt-2">
                                <div v-for="metric in kpi.metrics" :key="metric.label" class="d-flex justify-space-between">
                                  <span class="text-caption text-grey">{{ metric.label }}</span>
                                  <span class="text-body-2 font-weight-bold">{{ metric.value }}</span>
                                </div>
                                <v-progress-linear
                                  v-if="kpi.progress"
                                  :model-value="kpi.progress.value"
                                  :color="kpi.progress.color"
                                  height="4"
                                  rounded
                                  class="mt-2"
                                ></v-progress-linear>
                              </div>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </div>
                </v-expand-transition>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>

      <!-- PDF Dialog for Print (Unchanged) -->
      <v-dialog v-model="pdfDialog" max-width="800">
        <v-card class="pa-6" id="pdf-content">
          <v-card-title class="text-h5 font-weight-bold">
            Employee KPI Report: {{ employeeData.name }}
          </v-card-title>
          <v-card-subtitle>
            Period: {{ months.find(m => m.value === selectedMonth)?.text }} {{ selectedYear }}<br>
            Employee ID: {{ employeeData.employeeId }}<br>
            Role: {{ employeeData.role }}<br>
            Organization: {{ selectedEmployeeOrg }}
          </v-card-subtitle>
          <v-card-text>
            <v-row>
              <v-col v-for="kpi in employeeData.kpis" :key="kpi.title" cols="12" sm="6">
                <v-card flat class="pa-4">
                  <div class="text-subtitle-1 font-weight-medium">{{ kpi.title }}</div>
                  <div class="mt-2">
                    <div v-for="metric in kpi.metrics" :key="metric.label" class="d-flex justify-space-between">
                      <span class="text-caption">{{ metric.label }}</span>
                      <span class="text-body-2 font-weight-bold">{{ metric.value }}</span>
                    </div>
                    <v-progress-linear
                      v-if="kpi.progress"
                      :model-value="kpi.progress.value"
                      :color="kpi.progress.color"
                      height="4"
                      rounded
                      class="mt-2"
                    ></v-progress-linear>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="printPDF">Print/Save as PDF</v-btn>
            <v-btn text @click="pdfDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

export default {
  name: 'kpi',
  data() {
    return {
      tab: 'employee-kpis',
      selectedEmployee: null,
      searchQuery: '',
      employees: [],
      selectedEmployeeOrg: '',
      avatarImage: null,
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      months: [
        { text: 'January', value: 1 },
        { text: 'February', value: 2 },
        { text: 'March', value: 3 },
        { text: 'April', value: 4 },
        { text: 'May', value: 5 },
        { text: 'June', value: 6 },
        { text: 'July', value: 7 },
        { text: 'August', value: 8 },
        { text: 'September', value: 9 },
        { text: 'October', value: 10 },
        { text: 'November', value: 11 },
        { text: 'December', value: 12 },
      ],
      years: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i),
      pdfDialog: false,
      employeeData: {
        name: '',
        employeeId: '',
        role: '',
        kpis: [
          {
            title: 'Tasks',
            metrics: [
              { label: 'Total', value: '0' },
              { label: 'Completed', value: '0' },
              { label: 'Pending', value: '0' },
              { label: 'Overdue', value: '0' },
            ],
            progress: { value: 0, color: 'green' },
          },
          {
            title: 'Attendance',
            metrics: [
              { label: 'Total', value: '0' },
              { label: 'Present', value: '0' },
              { label: 'Absent', value: '0' },
              { label: 'Week Off', value: '0' },
            ],
          },
          {
            title: 'Leaves',
            metrics: [
              { label: 'Taken', value: '0' },
              { label: 'Remaining', value: '0' },
            ],
            progress: { value: 0, color: 'blue' },
          },
          {
            title: 'Reimbursements',
            metrics: [
              { label: 'Submitted', value: '0' },
              { label: 'Approved', value: '0' },
            ],
          },
        ],
      },
      overviewCards: [
        {
          title: 'Employees',
          icon: 'mdi-account-group',
          color: 'blue',
          metrics: [
            { label: 'Total', value: '0' },
            { label: 'Male', value: '0', badge: { text: '0', color: 'green' } },
            { label: 'Female', value: '0', badge: { text: '0', color: 'blue' } },
          ],
          progress: { value: 0, color: 'green' },
        },
        {
          title: 'Shifts',
          icon: 'mdi-clock',
          color: 'orange',
          metrics: [
            { label: 'Created shifts', value: '0' },
            { label: 'Employee Assigned', value: '0' },
            { label: 'Employee UnAssigned', value: '0' },
          ],
        },
        {
          title: 'Leaves',
          icon: 'mdi-airplane-takeoff',
          color: 'purple',
          metrics: [
            { label: 'Total Settings', value: '0' },
            { label: 'Total Leave Requests', value: '0' },
            { label: 'Approved', value: '0' },
            { label: 'Pending', value: '0' },
            { label: 'Rejected', value: '0' },
          ],
          progress: { value: 0, color: 'blue' },
        },
        {
          title: 'Reimbursements',
          icon: 'mdi-currency-usd',
          color: 'teal',
          metrics: [
            { label: 'Total', value: '0' },
            { label: 'Submitted', value: '0' },
            { label: 'Approved', value: '0' },
          ],
        },
        {
          title: 'Work Orders',
          icon: 'mdi-checkbox-marked-circle',
          color: 'indigo',
          metrics: [
            { label: 'Total WorkOrders', value: '0' },
            { label: 'Completed', value: '0' },
            { label: 'Pending', value: '0' },
            { label: 'Overdue', value: '0' },
          ],
          progress: { value: 0, color: 'green' },
        },
        {
          title: 'Organizations',
          icon: 'mdi-domain',
          color: 'brown',
          metrics: [
            { label: 'Total created forms', value: '0' },
            { label: 'Total Organizations', value: '0' },
            { label: 'Tenant Organization', value: '0' },
            { label: 'Distributor Organization', value: '0' },
            { label: 'Client Organization', value: '0' },
          ],
        },
      ],
    };
  },
  computed: {
    orderedOverviewCards() {
      const order = ['Organizations', 'Work Orders', 'Employees', 'Shifts', 'Leaves', 'Reimbursements'];
      return order
        .map(title => this.overviewCards.find(card => card.title === title))
        .filter(card => card !== undefined);
    },
  },
  watch: {
    selectedEmployee(newVal) {
      if (newVal) {
        this.fetchEmployeeData(newVal);
      } else {
        this.resetEmployeeData();
      }
    },
    selectedMonth() {
      if (this.selectedEmployee) {
        this.fetchEmployeeData(this.selectedEmployee);
      }
    },
    selectedYear() {
      if (this.selectedEmployee) {
        this.fetchEmployeeData(this.selectedEmployee);
      }
    },
  },
  async created() {
   
    const employeeId = this.$route.query.employeeId;
  
  if (employeeId) {
    this.selectedEmployee = employeeId;
    await this.fetchEmployeeData(employeeId);
  }
   await this.fetchData();
  },
  methods: {
    redirectToPremium() {
      // Redirect to the premium subscription page
      window.location.href = ''; // Adjust to your actual subscription page
    },
    // ... Existing methods (convertToCSV, fetchEmployeeData, resetEmployeeData, etc.) ...
    async fetchEmployeeData(employeeId) {
      const employee = this.employees.find(emp => emp.id === employeeId);
      if (!employee) return;

      const [taskData, attendanceData, leaveData, reimbursementData] = await Promise.all([
        this.fetchEmployeeTasks(employee.id),
        this.fetchEmployeeAttendance(employee.id),
        this.fetchEmployeeLeaves(employee.id),
        this.fetchEmployeeReimbursements(employee.id),
      ]);

      const totalTasks = taskData.total;
      const completedTasks = taskData.completed;
      const pendingTasks = taskData.pending;
      const overdueTasks = taskData.overdue;
      const taskCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const totalAttendance = attendanceData.total;
      const presentCount = attendanceData.present;
      const absentCount = attendanceData.absent;
      const weekOffCount = attendanceData.weekOff;

      const totalLeavesTaken = leaveData.taken;
      const totalLeavesRemaining = leaveData.remaining;
      const leavePercentage = leaveData.assigned > 0 ? Math.round((totalLeavesTaken / leaveData.assigned) * 100) : 0;

      const totalSubmittedReimbursements = reimbursementData.submitted;
      const totalApprovedReimbursements = reimbursementData.approved;

      this.employeeData = {
        name: employee.name,
        employeeId: employee.employeeId,
        role: employee.role || 'Unknown',
        kpis: [
          {
            title: 'Tasks',
            metrics: [
              { label: 'Total', value: totalTasks.toString() },
              { label: 'Completed', value: completedTasks.toString() },
              { label: 'Pending', value: pendingTasks.toString() },
              { label: 'Overdue', value: overdueTasks.toString() },
            ],
            progress: { value: taskCompletionPercentage, color: 'green' },
          },
          {
            title: 'Attendance',
            metrics: [
              { label: 'Total', value: totalAttendance.toString() },
              { label: 'Present', value: presentCount.toString() },
              { label: 'Absent', value: absentCount.toString() },
              { label: 'Week Off', value: weekOffCount.toString() },
            ],
          },
          {
            title: 'Leaves',
            metrics: [
              { label: 'Taken', value: totalLeavesTaken.toString() },
              { label: 'Remaining', value: totalLeavesRemaining.toString() },
            ],
            progress: { value: leavePercentage, color: 'blue' },
          },
          {
            title: 'Reimbursements',
            metrics: [
              { label: 'Submitted', value: totalSubmittedReimbursements.toString() },
              { label: 'Approved', value: totalApprovedReimbursements.toString() },
            ],
          },
        ],
      };
      this.selectedEmployeeOrg = employee.orgName;
      this.fetchAndSetAvatar(employee.avatarId);
    },
    resetEmployeeData() {
      this.employeeData = {
        name: '',
        employeeId: '',
        role: '',
        kpis: [
          {
            title: 'Tasks',
            metrics: [
              { label: 'Total', value: '0' },
              { label: 'Completed', value: '0' },
              { label: 'Pending', value: '0' },
              { label: 'Overdue', value: '0' },
            ],
            progress: { value: 0, color: 'green' },
          },
          {
            title: 'Attendance',
            metrics: [
              { label: 'Total', value: '0' },
              { label: 'Present', value: '0' },
              { label: 'Absent', value: '0' },
              { label: 'Week Off', value: '0' },
            ],
          },
          {
            title: 'Leaves',
            metrics: [
              { label: 'Taken', value: '0' },
              { label: 'Remaining', value: '0' },
            ],
            progress: { value: 0, color: 'blue' },
          },
          {
            title: 'Reimbursements',
            metrics: [
              { label: 'Submitted', value: '0' },
              { label: 'Approved', value: '0' },
            ],
          },
        ],
      };
      this.selectedEmployeeOrg = '';
      this.avatarImage = null;
    },
    async fetchAuthorizedImage(avatarId) {
      if (!avatarId) return null;
      const token = await authService.getToken();
      const url = `${import.meta.env.VITE_API_URL}/assets/${avatarId}`;
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Error fetching image:', error);
        return null;
      }
    },
    async fetchAndSetAvatar(avatarId) {
      this.avatarImage = await this.fetchAuthorizedImage(avatarId);
    },
    async fetchEmployeeTasks(employeeId) {
      const token = await authService.getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      try {
        const filter = `?filter[_and][0][year(date_created)][_eq]=${this.selectedYear}&filter[_and][1][month(date_created)][_eq]=${this.selectedMonth}&filter[_and][2][employeeId][id][_eq]=${employeeId}`;
        const tasksResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tasks${filter}`,
          { headers }
        );
        const tasksData = await tasksResponse.json();
        const tasks = tasksData.data;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status.toLowerCase() === 'completed').length;
        const pendingTasks = tasks.filter(task => task.status.toLowerCase() === 'pending').length;
        const overdueTasks = tasks.filter(task => task.status.toLowerCase() === 'overdue').length;

        return {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueTasks,
        };
      } catch (error) {
        console.error('Error fetching employee tasks:', error);
        return {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
        };
      }
    },
    async fetchEmployeeAttendance(employeeId) {
      const token = await authService.getToken();
      const tenantId = await currentUserTenant.getTenantId();
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      try {
        const filter = `?filter[_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][employeeId][id][_eq]=${employeeId}&filter[_and][2][year(date_created)][_eq]=${this.selectedYear}&filter[_and][3][month(date_created)][_eq]=${this.selectedMonth}`;
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance${filter}`,
          { headers }
        );
        const data = await response.json();
        const attendanceRecords = data.data;

        const presentCount = attendanceRecords.filter(record => record.attendance?.toLowerCase() === 'present').length;
        const absentCount = attendanceRecords.filter(record => record.attendance?.toLowerCase() === 'absent').length;
        const weekOffCount = attendanceRecords.filter(record => record.attendance?.toLowerCase() === 'weekoff').length;
        return {
          total: attendanceRecords.length,
          present: presentCount,
          absent: absentCount,
          weekOff: weekOffCount,
        };
      } catch (error) {
        console.error('Error fetching employee attendance:', error);
        return {
          total: 0,
          present: 0,
          absent: 0,
          weekOff: 0,
        };
      }
    },
    async fetchEmployeeLeaves(employeeId) {
      const token = await authService.getToken();
      const tenantId = await currentUserTenant.getTenantId();
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][id][_eq]=${employeeId}&fields=leaves.id,leaves.leaveBalance,leaves.leaveTaken,leaves.assignedLeave`,
          { headers }
        );
        const data = await response.json();

        const leavesData = data.data[0]?.leaves;
        const leaveRecords = Array.isArray(leavesData) ? leavesData : [leavesData].filter(Boolean);

        let totalLeavesRemaining = 0;
        let totalLeavesAssigned = 0;
        let totalLeavesTaken = 0;

        for (const leave of leaveRecords) {
          if (!leave) continue;

          if (leave.leaveTaken && typeof leave.leaveTaken === 'object') {
            totalLeavesTaken += Object.values(leave.leaveTaken).reduce(
              (sum, val) => sum + (Number(val) || 0),
              0
            );
          }

          if (
            leave.leaveBalance &&
            typeof leave.leaveBalance === 'object' &&
            leave.assignedLeave &&
            Array.isArray(leave.assignedLeave)
          ) {
            for (const leaveType of leave.assignedLeave) {
              const matchingKey = Object.keys(leave.leaveBalance).find(
                key => key.toLowerCase().replace(/\s+/g, '') === leaveType.toLowerCase().replace(/\s+/g, '')
              );

              if (matchingKey) {
                totalLeavesRemaining += Number(leave.leaveBalance[matchingKey]) || 0;
              }
            }
          }

          if (leave.assignedLeave && Array.isArray(leave.assignedLeave)) {
            totalLeavesAssigned += leave.assignedLeave.length;
          }
        }

        return {
          taken: totalLeavesTaken,
          remaining: totalLeavesRemaining,
          assigned: totalLeavesAssigned,
        };
      } catch (error) {
        console.error('Error fetching employee leaves:', error);
        return {
          taken: 0,
          remaining: 0,
          assigned: 0,
        };
      }
    },
    async fetchEmployeeReimbursements(employeeId) {
      const token = await authService.getToken();
      const tenantId = await currentUserTenant.getTenantId();
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      try {
        const filter = `?filter[_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][reimbBy][id][_eq]=${employeeId}&filter[_and][2][year(date_created)][_eq]=${this.selectedYear}&filter[_and][3][month(date_created)][_eq]=${this.selectedMonth}`;
        const submittedResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/expenseReimbursement${filter}&filter[_and][4][status][_eq]=submitted`,
          { headers }
        );
        const submittedData = await submittedResponse.json();
        const submittedReimbursements = submittedData.data;

        const approvedResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/expenseReimbursement${filter}&filter[_and][4][status][_eq]=approved`,
          { headers }
        );
        const approvedData = await approvedResponse.json();
        const approvedReimbursements = approvedData.data;

        return {
          submitted: submittedReimbursements.length,
          approved: approvedReimbursements.length,
        };
      } catch (error) {
        console.error('Error fetching employee reimbursements:', error);
        return {
          submitted: 0,
          approved: 0,
        };
      }
    },
    async fetchData() {
      const tenantId = await currentUserTenant.getTenantId();
      const token = await authService.getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      try {
        const personalResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}&fields=id,employeeId,assignedUser.first_name,assignedUser.avatar.id,assignedUser.role.name,assignedUser.organization.orgName`,
          { headers }
        );
        const personalData = await personalResponse.json();
        this.employees = personalData.data.map(emp => ({
          id: emp.id,
          employeeId: emp.employeeId,
          name: emp.assignedUser?.first_name || 'Unknown',
          role: emp.assignedUser?.role?.name || 'Unknown',
          orgName: emp.assignedUser?.organization?.orgName || 'No Organization',
          avatarId: emp.assignedUser?.avatar?.id || null,
        }));

        const shiftsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/shifts?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
          { headers }
        );
        const shiftsData = await shiftsResponse.json();
        const totalShifts = shiftsData.data.length;

        const personalMetricsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}&fields=assignedUser.gender,attendanceSettings.*`,
          { headers }
        );
        const personalMetricsData = await personalMetricsResponse.json();
        const employees = personalMetricsData.data;

        const totalCount = employees.length;
        const maleCount = employees.filter(emp => emp.assignedUser?.gender?.toLowerCase() === 'male').length;
        const femaleCount = employees.filter(emp => emp.assignedUser?.gender?.toLowerCase() === 'female').length;

        const days = ['sunJ', 'monJ', 'tueJ', 'wedJ', 'thuJ', 'friJ', 'satJ'];
        let assignedCount = 0;
        let unassignedCount = 0;

        employees.forEach(emp => {
          const settings = emp.attendanceSettings || {};
          let isAssigned = false;

          for (let i = 1; i < days.length; i++) {
            const shiftValue = settings[days[i]];
            if (shiftValue) {
              isAssigned = true;
              break;
            }
          }

          if (isAssigned) {
            assignedCount++;
          } else {
            unassignedCount++;
          }
        });

        const leaveSettingsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/leaveSetting?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
          { headers }
        );
        const leaveSettingsData = await leaveSettingsResponse.json();
        const totalLeaveSettings = leaveSettingsData.data.length;

        const leaveRequestsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/leaveRequest?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
          { headers }
        );
        const leaveRequestsData = await leaveRequestsResponse.json();
        const leaveRequests = leaveRequestsData.data;
        const totalLeaveCount = leaveRequestsData.data.length;
        const approvedCount = leaveRequests.filter(req => req.status.toLowerCase() === 'approved').length;
        const pendingCount = leaveRequests.filter(req => req.status.toLowerCase() === 'pending').length;
        const rejectedCount = leaveRequests.filter(req => req.status.toLowerCase() === 'rejected').length;

        const reimbursementResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/expenseReimbursement?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
          { headers }
        );
        const reimbursementData = await reimbursementResponse.json();
        const reimbursements = reimbursementData.data;
        const totalReimbursementCount = reimbursements.length;
        const submittedCount = reimbursements.filter(req => req.status.toLowerCase() === 'submitted').length;
        const approvedReimbursementCount = reimbursements.filter(req => req.status.toLowerCase() === 'approved').length;

        const tasksResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tasks?filter[_and][0][_and][0][employeeId][assignedUser][tenant][tenantId][_eq]=${tenantId}`,
          { headers }
        );
        const tasksData = await tasksResponse.json();
        const tasks = tasksData.data;
        const totalTasks = tasksData.data.length;
        const completedTasks = tasks.filter(task => task.status.toLowerCase() === 'completed').length;
        const pendingTasks = tasks.filter(task => task.status.toLowerCase() === 'pending').length;
        const overdueTasks = tasks.filter(task => task.status.toLowerCase() === 'overdue').length;

        const orgFormsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tenant_template?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
          { headers }
        );
        const orgFormsData = await orgFormsResponse.json();
        const orgForms = orgFormsData.data;
        const totalOrgForms = orgForms.length;

        const orgResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/organization?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
          { headers }
        );
        const orgData = await orgResponse.json();
        const organizations = orgData.data;
        const totalOrganizations = organizations.length;
        const tenantOrgCount = organizations.filter(org => org.orgType.toLowerCase() === 'tenantorg').length;
        const distributorOrgCount = organizations.filter(org => org.orgType.toLowerCase() === 'distributororg').length;
        const clientOrgCount = organizations.filter(org => org.orgType.toLowerCase() === 'clientorg').length;

        this.overviewCards.find(card => card.title === 'Employees').metrics = [
          { label: 'Total', value: totalCount.toString() },
          { label: 'Male', value: maleCount.toString(), badge: { text: maleCount.toString(), color: 'green' } },
          { label: 'Female', value: femaleCount.toString(), badge: { text: femaleCount.toString(), color: 'blue' } },
        ];

        this.overviewCards.find(card => card.title === 'Shifts').metrics = [
          { label: 'Created shifts', value: totalShifts.toString() },
          { label: 'Employee Assigned', value: assignedCount.toString() },
          { label: 'Employee UnAssigned', value: unassignedCount.toString(), badge: { text: unassignedCount.toString(), color: 'red' } },
        ];

        this.overviewCards.find(card => card.title === 'Leaves').metrics = [
          { label: 'Total Settings', value: totalLeaveSettings.toString() },
          { label: 'Total Leave Requests', value: totalLeaveCount.toString() },
          { label: 'Approved', value: approvedCount.toString() },
          { label: 'Pending', value: pendingCount.toString() },
          { label: 'Rejected', value: rejectedCount.toString() },
        ];

        this.overviewCards.find(card => card.title === 'Reimbursements').metrics = [
          { label: 'Total', value: totalReimbursementCount.toString() },
          { label: 'Submitted', value: submittedCount.toString() },
          { label: 'Approved', value: approvedReimbursementCount.toString() },
        ];

        this.overviewCards.find(card => card.title === 'Work Orders').metrics = [
          { label: 'Total WorkOrders', value: totalTasks.toString() },
          { label: 'Completed', value: completedTasks.toString() },
          { label: 'Pending', value: pendingTasks.toString() },
          { label: 'Overdue', value: overdueTasks.toString() },
        ];

        this.overviewCards.find(card => card.title === 'Organizations').metrics = [
          { label: 'Total created forms', value: totalOrgForms.toString() },
          { label: 'Total Organizations', value: totalOrganizations.toString() },
          { label: 'Tenant Organization', value: tenantOrgCount.toString() },
          { label: 'Distributor Organization', value: distributorOrgCount.toString() },
          { label: 'Client Organization', value: clientOrgCount.toString() },
        ];
      } catch (error) {
        console.error('Error fetching data:', error);
        this.overviewCards.find(card => card.title === 'Employees').metrics = [
          { label: 'Total', value: '0' },
          { label: 'Male', value: '0', badge: { text: '0', color: 'green' } },
          { label: 'Female', value: '0', badge: { text: '0', color: 'blue' } },
        ];
        this.overviewCards.find(card => card.title === 'Shifts').metrics = [
          { label: 'Created shifts', value: '0' },
          { label: 'Employee Assigned', value: '0' },
          { label: 'Employee UnAssigned', value: '0', badge: { text: '0', color: 'red' } },
        ];
        this.overviewCards.find(card => card.title === 'Leaves').metrics = [
          { label: 'Total Settings', value: '0' },
          { label: 'Total Leave Requests', value: '0' },
          { label: 'Approved', value: '0' },
          { label: 'Pending', value: '0' },
          { label: 'Rejected', value: '0' },
        ];
        this.overviewCards.find(card => card.title === 'Reimbursements').metrics = [
          { label: 'Total', value: '0' },
          { label: 'Submitted', value: '0' },
          { label: 'Approved', value: '0' },
        ];
        this.overviewCards.find(card => card.title === 'Work Orders').metrics = [
          { label: 'Total WorkOrders', value: '0' },
          { label: 'Completed', value: '0' },
          { label: 'Pending', value: '0' },
          { label: 'Overdue', value: '0' },
        ];
        this.overviewCards.find(card => card.title === 'Organizations').metrics = [
          { label: 'Total created forms', value: '0' },
          { label: 'Total Organizations', value: '0' },
          { label: 'Tenant Organization', value: '0' },
          { label: 'Distributor Organization', value: '0' },
          { label: 'Client Organization', value: '0' },
        ];
      }
    },
    downloadCSV() {
      const data = this.employeeData.kpis.flatMap(kpi =>
        kpi.metrics.map(metric => ({
          Category: kpi.title,
          Metric: metric.label,
          Value: metric.value,
        }))
      );
      const csv = this.convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${this.employeeData.name}_KPIs_${this.selectedYear}_${this.selectedMonth}.csv`;
      link.click();
    },
    openPDFDialog() {
      this.pdfDialog = true;
    },
    printPDF() {
      const printContent = document.getElementById('pdf-content').innerHTML;
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Restore the page
    },
  },
};
</script>

<style scoped>
.v-card {
  transition: all 0.3s;
  min-height: 220px;
  display: flex;
  flex-direction: column;
}
.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
.v-card .flex-grow-1 {
  overflow: hidden;
}
.v-card .text-caption {
  font-size: 0.75rem;
}
.v-card .text-body-2 {
  font-size: 0.875rem;
}
.v-chip.premium-chip {
  font-size: 0.65rem;
  height: 18px;
}
</style>
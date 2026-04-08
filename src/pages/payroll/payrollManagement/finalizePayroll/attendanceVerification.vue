<template>
  <div class="payroll-dashboard">
    <div class="header-banner">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </button>
        <div class="title-section">
          <h1 class="main-title">
            <v-icon size="32" class="title-icon">mdi-account-cash</v-icon>
            Multi-Employee Attendance Verification
          </h1>
          <div class="subtitle-wrapper">
            <span class="employee-count">
              <v-icon size="18">mdi-account-group</v-icon>
              {{ selectedEmployees.length }} Employees
            </span>
            <span
              class="cycle-type-badge"
              :class="{ 'fixed-cycle': fixedCycle }"
            >
              <v-icon size="18">mdi-calendar-clock</v-icon>
              {{ fixedCycle ? "Fixed Cycle" : "Custom Cycle" }}
            </span>
            <span class="date-badge attendance-cycle">
              <v-icon size="18">mdi-calendar-range</v-icon>
              Attendance Cycle: {{ formatDate(cycleStartDate) }} -
              {{ formatDate(cycleEndDate) }}
            </span>
          </div>
        </div>
        <div class="header-actions"></div>
      </div>
    </div>

    <div class="stepper-container">
      <div class="stepper">
        <div class="step active">
          <div class="step-icon">
            <span>1</span>
          </div>
          <div class="step-label">Attendance Verification</div>
        </div>

        <div class="step-connector"></div>

        <div class="step disabled">
          <div class="step-icon">
            <span>2</span>
          </div>
          <div class="step-label">Salary Calculation</div>
        </div>
        <div class="step-connector"></div>
        <div class="step disabled">
          <div class="step-icon">
            <span>3</span>
          </div>
          <div class="step-label">Review</div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="section-header">
        <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
        <h2>Employee Status</h2>
      </div>

      <!-- Loading (Skeleton Table Loader) -->
      <template v-if="isLoadingEmployees">
        <SkeletonLoader
          variant="table-body-only"
          :rows="itemsPerPage || 10"
          :columns="7"
        />
      </template>

      <!-- Table Wrapper -->
      <template v-else>
        <data-table-wrapper
          :show-search="true"
          v-model:searchQuery="searchEmployee"
          :search-placeholder="'Search employees...'"
          :is-empty="attendanceSummaryData.length === 0"
        >
          <!-- Table -->
          <template v-if="attendanceSummaryData.length > 0">
            <DataTable
              :items="paginatedEmployees"
              :columns="columns"
              item-key="employee.employeeId"
              wrapper-class="employee-status-table compact-table"
              style="height: calc(80vh - 160px); overflow-y: auto"
            >
              <template #expanded-content="{ item }">
                <tr>
                  <td class="expanded-content-wrapper">
                    <div class="expanded-details">
                      <!-- Attendance Details Section -->
                      <div class="details-section">
                        <h3 class="section-title">Attendance Details</h3>
                        <div class="details-grid">
                          <div class="detail-row">
                            <span class="detail-label">Full Present</span>
                            <span class="detail-value success-text">0</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Half Day (P+0.5)</span>
                            <span class="detail-value warning-text">0</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Unpaid Leave</span>
                            <span class="detail-value info-text">0</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Absent</span>
                            <span class="detail-value error-text">8</span>
                          </div>
                        </div>
                      </div>

                      <!-- Leave Details Section -->
                      <div class="details-section">
                        <h3 class="section-title">Leave Details</h3>
                        <div class="details-grid">
                          <div class="detail-row">
                            <span class="detail-label">Privileged Leave</span>
                            <span class="detail-value purple-text">0</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Maternity Leave</span>
                            <span class="detail-value purple-text">0</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Casual Leave</span>
                            <span class="detail-value purple-text">0</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Sick Leave</span>
                            <span class="detail-value purple-text">0</span>
                          </div>
                        </div>
                      </div>

                      <!-- Work Metrics Section -->
                      <div class="details-section">
                        <h3 class="section-title">Work Metrics</h3>
                        <div class="details-grid">
                          <div class="detail-row">
                            <span class="detail-label">Late By</span>
                            <span class="detail-value">0 hrs</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Early Leave</span>
                            <span class="detail-value">0 hrs</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Work Hours</span>
                            <span class="detail-value">0 hrs</span>
                          </div>
                        </div>
                      </div>

                      <!-- Days Off Section -->
                      <div class="details-section">
                        <h3 class="section-title">Days Off</h3>
                        <div class="details-grid">
                          <div class="detail-row">
                            <span class="detail-label">Week Off</span>
                            <span class="detail-value">19</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Holiday</span>
                            <span class="detail-value">3</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <!-- Employee Name -->
              <template #cell-name="{ item }">
                <div class="employee-info">
                  <div
                    class="employee-avatar"
                    :style="{ backgroundColor: 'grey' }"
                  >
                    {{
                      getInitials(
                        item?.employee?.assignedUser?.first_name || "N/A",
                      )
                    }}
                  </div>
                  <div class="employee-details">
                    <h3 class="employee-name">
                      {{ item?.employee?.assignedUser?.first_name || "N/A" }}
                    </h3>
                  </div>
                </div>
              </template>

              <!-- Employee ID -->
              <template #cell-id="{ item }">
                <span class="employee-code">
                  {{ item?.employee?.employeeId || "N/A" }}
                </span>
              </template>

              <!-- Annual CTC -->
              <template #cell-ctc="{ item }">
                ₹{{ item?.monthlyCTC ? formatAmount(item.monthlyCTC) : "N/A" }}
              </template>

              <!-- Payable Days -->
              <template #cell-payableDays="{ item }">
                {{ item.attendanceData?.totalPayableDays ?? 0 }}
              </template>

              <!-- Present Days -->
              <template #cell-present="{ item }">
                {{ item.attendanceData?.present ?? 0 }}
              </template>

              <!-- Absent Days -->
              <template #cell-absent="{ item }">
                {{ item.attendanceData?.absent ?? 0 }}
              </template>

              <!-- Unpaid Leave -->
              <template #cell-unpaidLeave="{ item }">
                {{ item.attendanceData?.unpaidLeave ?? 0 }}
              </template>

              <!-- Week Off -->
              <template #cell-weekOff="{ item }">
                {{ item.attendanceData?.weekOff ?? 0 }}
              </template>

              <!-- Holiday -->
              <template #cell-holiday="{ item }">
                {{ item.attendanceData?.holiday ?? 0 }}
              </template>

              <template #cell-actions="{ item }">
                <BaseButton
                  variant="primary"
                  size="sm"
                  :left-icon="Eye"
                  class="view-details-btn ms-2"
                  @click.stop="viewEmployeeDetails(item)"
                >
                  View
                </BaseButton>
              </template>

              <!-- Attendance Status -->
              <template #cell-attendance="{ item }">
                <v-chip
                  :color="item?.attendanceVerified ? 'success' : 'error'"
                  size="small"
                  class="text-none"
                >
                  <v-icon start size="16">
                    {{
                      item?.attendanceVerified
                        ? "mdi-check-circle"
                        : "mdi-alert-circle"
                    }}
                  </v-icon>
                  {{ item?.attendanceVerified ? "Verified" : "Unverified" }}
                </v-chip>
              </template>
            </DataTable>
          </template>

          <!-- Empty State -->
          <template v-else>
            <EmptyState
              title="No employee data found"
              message="Try refreshing or check your filters"
              :primary-action="{ text: 'Reload', icon: 'mdi-reload' }"
              @primaryAction="fetchEmployees"
            />
          </template>

          <!-- Pagination -->
        </data-table-wrapper>

        <CustomPagination
          v-model:page="currentPage"
          v-model:itemsPerPage="itemsPerPage"
          :total-items="totalEmployees"
          @update:page="handlePageChange"
          @update:itemsPerPage="handleItemsPerPageChange"
        />
      </template>
    </div>

    <div class="action-footer">
      <BaseButton
        variant="danger"
        size="md"
        :left-icon="X"
        @click="goBack"
        class="ms-2"
      >
        Cancel
      </BaseButton>

      <BaseButton
        v-if="hasUnverifiedEmployees"
        variant="primary"
        size="md"
        :left-icon="CheckCircle"
        @click="showVerifyAllDialog = true"
        class="ms-2"
      >
        Verify Attendance
      </BaseButton>

      <BaseButton
        v-else
        variant="primary"
        size="md"
        :left-icon="ArrowRight"
        @click="handleNext"
        class="ms-2"
        style="min-width: 80px"
      >
        Next
      </BaseButton>
    </div>
    <v-dialog
      v-model="showEmployeeDetails"
      max-width="800"
      content-class="employee-details-dialog"
    >
      <v-card>
        <v-card-title class="dialog-header">
          <v-icon size="24" color="primary" class="mr-2">mdi-account</v-icon>
          {{
            selectedEmployeeDetail?.employee?.assignedUser?.first_name ||
            "Employee"
          }}
          Details
          <v-spacer></v-spacer>
        </v-card-title>

        <v-card-text class="dialog-content">
          <div v-if="selectedEmployeeDetail">
            <div v-if="isLoading" class="loading-container">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <div class="loading-text">Loading attendance data...</div>
            </div>

            <div v-else>
              <v-tabs
                v-model="activeTab"
                background-color="transparent"
                color="primary"
                grow
              >
                <v-tab value="attendance" class="tab-item">
                  <v-icon left>mdi-calendar-check</v-icon>
                  Attendance
                </v-tab>
                <v-tab value="leaves" class="tab-item">
                  <v-icon left>mdi-calendar-remove</v-icon>
                  Leaves
                </v-tab>
                <v-tab value="penalties" class="tab-item">
                  <v-icon left>mdi-alert-circle</v-icon>
                  Penalties
                </v-tab>
              </v-tabs>

              <v-window v-model="activeTab" class="mt-4">
                <v-window-item value="attendance">
                  <div class="attendance-summary">
                    <div class="attendance-item">
                      <div class="attendance-label">Present Days</div>
                      <div class="attendance-value">
                        {{ employeeAttendanceData.present || 0 }}
                      </div>
                    </div>

                    <div class="attendance-item">
                      <div class="attendance-label">Half Days</div>
                      <div class="attendance-value">
                        {{ employeeAttendanceData.halfDay || 0 }}
                      </div>
                    </div>

                    <div class="attendance-item">
                      <div class="attendance-label">Weekoffs</div>
                      <div class="attendance-value">
                        {{ employeeAttendanceData.weekOff || 0 }}
                      </div>
                    </div>

                    <div class="attendance-item">
                      <div class="attendance-label">Holidays</div>
                      <div class="attendance-value">
                        {{ employeeAttendanceData.holiday || 0 }}
                      </div>
                    </div>

                    <div class="attendance-item">
                      <div class="attendance-label">Work from Home</div>
                      <div class="attendance-value">
                        {{ employeeAttendanceData.workFromHome || 0 }}
                      </div>
                    </div>

                    <div class="attendance-item">
                      <div class="attendance-label">OnDuty</div>
                      <div class="attendance-value">
                        {{ employeeAttendanceData.onDuty || 0 }}
                      </div>
                    </div>

                    <div class="attendance-item">
                      <div class="attendance-label">WeekOff Present</div>
                      <div class="attendance-value">
                        {{ employeeAttendanceData.weekoffPresent || 0 }}
                      </div>
                    </div>

                    <div class="attendance-item">
                      <div class="attendance-label">Holiday Present</div>
                      <div class="attendance-value">
                        {{ employeeAttendanceData.holidayPresent || 0 }}
                      </div>
                    </div>

                    <div class="attendance-item total">
                      <div class="attendance-label">Total Payable</div>
                      <div class="attendance-value">
                        {{ employeeAttendanceData.totalPayableDays || 0 }}
                      </div>
                    </div>
                  </div>
                </v-window-item>

                <v-window-item value="leaves">
                  <div class="detail-list">
                    <div class="detail-item">
                      <div class="detail-item-label">Paid Leave</div>
                      <div class="detail-item-value">
                        {{ employeeAttendanceData.paidLeave || 0 }}
                      </div>
                    </div>

                    <div class="detail-item">
                      <div class="detail-item-label">Unpaid Leave</div>
                      <div class="detail-item-value">
                        {{ employeeAttendanceData.unpaidLeave || 0 }}
                      </div>
                    </div>

                    <div class="detail-item total">
                      <div class="detail-item-label">Total Leaves</div>
                      <div class="detail-item-value">
                        {{
                          (employeeAttendanceData.paidLeave || 0) +
                          (employeeAttendanceData.unpaidLeave || 0)
                        }}
                      </div>
                    </div>
                  </div>
                </v-window-item>

                <v-window-item value="penalties">
                  <div class="penalties-container">
                    <div class="text-h6 font-weight-bold mb-4">
                      Attendance Policy
                    </div>

                    <!-- Penalty: Late Coming -->
                    <div class="penalty-row">
                      <div class="penalty-label">Late Coming</div>
                      <div class="penalty-stats d-flex align-center">
                        <div class="stat-item">
                          <div class="stat-number text-red-500">
                            {{ employeeAttendanceData?.lateEntryCount || 0 }}
                          </div>
                          <div class="stat-label">Total Days</div>
                          <v-chip
                            color="red lighten-4"
                            text-color="red darken-2"
                            small
                          >
                            {{
                              employeeAttendanceData?.totalLateDuration ||
                              "00:00:00"
                            }}
                          </v-chip>
                        </div>
                        <div class="stat-item">
                          <div class="stat-number text-green-500">
                            {{ employeeAttendanceData?.lateComingAllowed || 0 }}
                          </div>
                          <div class="stat-label">Allowed</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-number text-orange-500">
                            {{ employeeAttendanceData?.lateComing || 0 }}
                          </div>
                          <div class="stat-label">Deductions</div>
                          <v-chip
                            color="red lighten-4"
                            text-color="red darken-2"
                            small
                          >
                            {{
                              employeeAttendanceData?.deductedLateDuration ||
                              "00:00:00"
                            }}
                          </v-chip>
                        </div>
                        <div
                          class="stat-item"
                          v-if="employeeAttendanceData?.lateData?.leave"
                        >
                          <div class="badge-container mb-1">
                            <span class="badge badge-leave">{{
                              employeeAttendanceData?.lateData?.leave?.toUpperCase()
                            }}</span>
                          </div>
                          <div class="applied-info">
                            <div class="applied-title">
                              {{
                                employeeAttendanceData?.lateData?.leave?.toUpperCase()
                              }}
                              <!-- -
                              {{
                                employeeAttendanceData?.lateData?.mode?.replace(
                                  /^\w/,
                                  (c) => c.toUpperCase(),
                                )
                              }} -->
                            </div>
                            <div class="applied-subtitle">Applied As</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Penalty: Early Leaving -->
                    <div class="penalty-row">
                      <div class="penalty-label">Early Leaving</div>
                      <div class="penalty-stats d-flex align-center">
                        <div class="stat-item">
                          <div class="stat-number text-red-500">
                            {{ employeeAttendanceData?.earlyLeavingCount || 0 }}
                          </div>
                          <div class="stat-label">Total Days</div>
                          <v-chip
                            color="red lighten-4"
                            text-color="red darken-2"
                            small
                          >
                            {{
                              employeeAttendanceData?.totalEarlyDuration ||
                              "00:00:00"
                            }}
                          </v-chip>
                        </div>
                        <div class="stat-item">
                          <div class="stat-number text-green-500">
                            {{
                              employeeAttendanceData?.earlyLeavingAllowed || 0
                            }}
                          </div>
                          <div class="stat-label">Allowed</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-number text-orange-500">
                            {{ employeeAttendanceData?.earlyLeaving || 0 }}
                          </div>
                          <div class="stat-label">Deductions</div>
                          <v-chip
                            color="red lighten-4"
                            text-color="red darken-2"
                            small
                          >
                            {{
                              employeeAttendanceData?.deductedEarlyDuration ||
                              "00:00:00"
                            }}
                          </v-chip>
                        </div>
                        <div
                          class="stat-item"
                          v-if="employeeAttendanceData?.earlyLeavingData?.leave"
                        >
                          <div class="badge-container mb-1">
                            <span class="badge badge-lop">{{
                              employeeAttendanceData?.earlyLeavingData?.leave?.toUpperCase()
                            }}</span>
                          </div>
                          <div class="applied-info">
                            <div class="applied-title">
                              {{
                                employeeAttendanceData?.earlyLeavingData?.leave?.toUpperCase()
                              }}
                              <!-- -
                              {{
                                employeeAttendanceData?.earlyLeavingData?.mode?.replace(
                                  /^\w/,
                                  (c) => c.toUpperCase(),
                                )
                              }} -->
                            </div>
                            <div class="applied-subtitle">Applied As</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Penalty: Working Hours Shortage -->
                    <div class="penalty-row">
                      <div class="penalty-label">Working Hours Shortage</div>
                      <div class="penalty-stats d-flex align-center">
                        <div class="stat-item">
                          <div class="stat-number text-red-500">
                            {{ employeeAttendanceData?.workingHoursCount || 0 }}
                          </div>
                          <div class="stat-label">Total Days</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-number text-green-500">
                            {{
                              employeeAttendanceData?.workingHoursAllowed || 0
                            }}
                          </div>
                          <div class="stat-label">Allowed</div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-number text-orange-500">
                            {{ employeeAttendanceData?.workingHours || 0 }}
                          </div>
                          <div class="stat-label">Deductions</div>
                        </div>
                        <div
                          class="stat-item"
                          v-if="employeeAttendanceData?.workingHoursData?.leave"
                        >
                          <div class="badge-container mb-1">
                            <span class="badge badge-leave">{{
                              employeeAttendanceData?.workingHoursData?.leave?.toUpperCase()
                            }}</span>
                          </div>
                          <div class="applied-info">
                            <div class="applied-title">
                              {{
                                employeeAttendanceData?.workingHoursData?.leave?.replace(
                                  /^\w/,
                                  (c) => c.toUpperCase(),
                                )
                              }}
                              <!-- -
                              {{
                                employeeAttendanceData?.workingHoursData?.mode?.replace(
                                  /^\w/,
                                  (c) => c.toUpperCase(),
                                )
                              }} -->
                            </div>
                            <div class="applied-subtitle">Applied As</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Simple OT Rows -->
                    <div class="simple-row">
                      <div class="simple-label">WeekOff OT</div>
                      <div class="stat-item">
                        <div class="stat-number text-red-500">
                          {{ employeeAttendanceData?.weekOffOTHours || 0 }}
                        </div>
                        <div class="stat-label">Total OTHours</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-number text-red-500">
                          {{ employeeAttendanceData?.weekOffOT || 0 }}
                        </div>
                        <div class="stat-label">Total OTCount</div>
                      </div>
                    </div>

                    <div class="simple-row">
                      <div class="simple-label">Holiday OT</div>
                      <div class="stat-item">
                        <div class="stat-number text-red-500">
                          {{ employeeAttendanceData?.holidayOTHours || 0 }}
                        </div>
                        <div class="stat-label">Total OTHours</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-number text-red-500">
                          {{ employeeAttendanceData?.holidayOT || 0 }}
                        </div>
                        <div class="stat-label">Total OTCount</div>
                      </div>
                    </div>

                    <div class="simple-row">
                      <div class="simple-label">Work From Home OT</div>
                      <div class="stat-item">
                        <div class="stat-number text-red-500">
                          {{ employeeAttendanceData?.workFromHomeOTHours || 0 }}
                        </div>
                        <div class="stat-label">Total OTHours</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-number text-red-500">
                          {{ employeeAttendanceData?.workFromHomeOT || 0 }}
                        </div>
                        <div class="stat-label">Total OTCount</div>
                      </div>
                    </div>
                    <div class="simple-row">
                      <div class="simple-label">WorkingDay OT</div>
                      <div class="stat-item">
                        <div class="stat-number text-red-500">
                          {{ employeeAttendanceData?.workingDayOTHours || 0 }}
                        </div>
                        <div class="stat-label">Total OTHours</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-number text-red-500">
                          {{ employeeAttendanceData?.workingDayOT || 0 }}
                        </div>
                        <div class="stat-label">Total OTCount</div>
                      </div>
                    </div>
                  </div>
                </v-window-item>
              </v-window>

              <div class="attendance-summary-footer">
                <div class="summary-item">
                  <div class="summary-label">Payable Days</div>
                  <div class="summary-value">
                    {{ employeeAttendanceData.totalPayableDays || 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showEmployeeDetails = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showVerifyAllDialog"
      persistent
      max-width="400"
      content-class="verify-all-dialog"
    >
      <v-card>
        <v-card-title class="verify-dialog-title">
          <v-icon left color="primary" size="24">mdi-check-circle</v-icon>
          Verifying Attendance
        </v-card-title>

        <v-card-text class="verify-dialog-content">
          <div v-if="processing" class="verify-loading-container">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <div class="verify-loading-text">
              Processing attendance verification for all employees...
            </div>
          </div>

          <div v-else class="verify-confirm-text">
            Are you sure you want to verify attendance for all employees?
          </div>
        </v-card-text>

        <v-card-actions class="verify-dialog-actions">
          <v-spacer></v-spacer>
          <v-btn
            text
            color="grey-darken-1"
            @click="showVerifyAllDialog = false"
            :disabled="processing"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="verifyAllAttendance"
            :disabled="processing"
          >
            Verify All
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="showSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import { X, CheckCircle, ArrowRight, Eye } from "lucide-vue-next";
const router = useRouter();
const userRole = currentUserTenant.getRole();
const selectedEmployees = ref([]);
const fixedCycle = ref(false);
const includeWeekoff = ref(false);
const includeHoliday = ref(false);
const processing = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");
const isLoading = ref(false);
const isLoadingEmployees = ref(false);
const showVerifyAllDialog = ref(false);
const cycleStartDate = ref("");
const cycleEndDate = ref("");
const showEmployeeDetails = ref(false);
const selectedEmployeeDetail = ref(null);
const activeTab = ref("attendance");
const employeeAttendanceData = ref({});
const attendanceSummaryData = ref([]);
const tenantId = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);

const showWaveOffDetails = ref(false);
const showLeaveDetails = ref(false);
const showLopDetails = ref(false);
const showWorkingLeaveDetails = ref(false);
const showWorkingLopDetails = ref(false);
const showEarlyLeaveDetails = ref(false);
const showEarlyLopDetails = ref(false);

const columns = [
  { key: "id", label: "Employee ID", width: "150px" },
  { key: "name", label: "Employee Name", width: "150px" },

  { key: "ctc", label: "Monthly CTC", width: "150px" },
  { key: "payableDays", label: "Payable Days", width: "150px" },
  { key: "present", label: "Present", width: "150px" },
  { key: "absent", label: "Absent", width: "150px" },
  { key: "unpaidLeave", label: "UnPaidLeave", width: "150px" },
  { key: "weekOff", label: "WeekOff", width: "150px" },
  { key: "holiday", label: "Holiday", width: "150px" },
  { key: "attendance", label: "Attendance Status", width: "150px" },
  { key: "actions", label: "Actions", width: "150px" },
];

// Pagination event handlers
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchAttendanceSummary();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
  fetchAttendanceSummary();
};
const totalPages = computed(() => {
  return Math.ceil(selectedEmployees.value.length / itemsPerPage.value);
});

const paginatedEmployees = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return selectedEmployees.value.slice(startIndex, endIndex);
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
const getInitials = (item) => {
  if (!item?.employeeId?.assignedUser?.first_name) return "";
  return item.employeeId.assignedUser.first_name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};
const formatAmount = (value) => {
  if (!value) return "0.00";
  return parseFloat(value)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const goBack = () => {
  router.push("/payroll/management");
};

const hasUnverifiedEmployees = computed(() => {
  return selectedEmployees.value.some(
    (employee) => !employee.attendanceVerified,
  );
});

const loadSelectedEmployees = () => {
  const storedEmployees = localStorage.getItem("selectedEmployees");
  if (storedEmployees) {
    selectedEmployees.value = JSON.parse(storedEmployees);
  } else {
    const storedEmployee = localStorage.getItem("selectedEmployee");
    if (storedEmployee) {
      selectedEmployees.value = [JSON.parse(storedEmployee)];
    } else {
      router.push("/payroll");
    }
  }
};

const loadDateRangeFromStorage = async () => {
  const storedDateRange = localStorage.getItem("attendanceDateRange");
  if (storedDateRange) {
    const dateRange = JSON.parse(storedDateRange);
    cycleStartDate.value = dateRange.startDate;
    cycleEndDate.value = dateRange.endDate;
    tenantId.value = dateRange.tenantId;

    if (dateRange.fixedCycle !== undefined) {
      fixedCycle.value = dateRange.fixedCycle;
    }
    try {
      const token = authService.getToken();
      const tenantID = tenantId.value;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[_and][0][tenant][tenantId][_eq]=${tenantID}`,
        {
          params: {
            fields: ["id", "fixedCycle", "includeWeekoffs", "includeHolidays"],
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const cycleData = response.data.data[0];
        fixedCycle.value = cycleData.fixedCycle || false;
        includeWeekoff.value = cycleData.includeWeekoffs || false;
        includeHoliday.value = cycleData.includeHolidays || false;
      }
    } catch (error) {
      console.error("Error fetching attendance cycle settings:", error);
    }
  }
};
const attendanceData = ref("null");
const fetchAttendanceSummary = async () => {
  isLoadingEmployees.value = true;
  try {
    const token = authService.getToken();
    const employeeIds = selectedEmployees.value
      .map((emp) => emp.employee.id)
      .join(",");

    if (!employeeIds) {
      isLoadingEmployees.value = false;
      return;
    }

    const params = {
      "filter[_and][0][date][_between][0]": cycleStartDate.value,
      "filter[_and][0][date][_between][1]": cycleEndDate.value,
      "filter[_and][1][employeeId][_in]": employeeIds,
      "filter[_and][2][tenant][tenantId][_eq]": tenantId.value,
    };

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/payroll-attendance/verification`,
      {
        params: params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    attendanceSummaryData.value = response.data.data || [];
    totalItems.value = selectedEmployees.value.length;

    selectedEmployees.value.forEach((employee) => {
      attendanceData.value = attendanceSummaryData.value.find(
        (data) =>
          data.employeeId.toString() === employee.employee.id.toString(),
      );
      const [yearStr, monthStr] = cycleEndDate.value.split("-");
      let year = Number(yearStr);
      let month = Number(monthStr);

      // make sure day (like 2025-08-14) won’t break the split
      if (monthStr.includes("-")) month = Number(monthStr.split("-")[0]);

      const salaryTracking = employee?.salaryTracking || {};
      console.log("salaryTracking ", salaryTracking);
      let monthlyCTC = 0;

      // 🔁 keep checking current and previous months until found
      for (let i = 0; i < 12; i++) {
        const key = `${String(month).padStart(2, "0")}/${year}`;
        console.log("key", key);
        const found = salaryTracking[key];
        if (found) {
          monthlyCTC = Number(found);
          break;
        }

        // move to previous month
        month -= 1;
        if (month === 0) {
          month = 12;
          year -= 1;
        }
      }

      employee.monthlyCTC = monthlyCTC;
      5;

      if (attendanceData.value) {
        employee.attendanceData = attendanceData.value;
      } else {
        employee.payableDays = 0;
        employee.attendanceData = null;
      }
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    showSnackbar.value = true;
    snackbarMessage.value = "Error loading attendance data";
    snackbarColor.value = "error";
  } finally {
    isLoadingEmployees.value = false;
  }
};

const viewEmployeeDetails = async (employee) => {
  selectedEmployeeDetail.value = employee;
  showEmployeeDetails.value = true;
  isLoading.value = true;

  try {
    console.log("employee", employee);
    await fetchEmployeeAttendanceData(employee);
  } catch (error) {
    console.error("Error fetching employee data:", error);
    showSnackbar.value = true;
    snackbarMessage.value = "Error loading employee data";
    snackbarColor.value = "error";
  } finally {
    isLoading.value = false;
  }
};

const fetchEmployeeAttendanceData = async (employee) => {
  try {
    const token = authService.getToken();
    const employeeId = employee.employee.id;

    const attendanceData = attendanceSummaryData.value.find(
      (data) => data.employeeId === employeeId,
    );

    if (attendanceData) {
      employeeAttendanceData.value = {
        present: attendanceData.present || 0,
        absent: attendanceData.absent || 0,
        weekOff: attendanceData.weekOff || 0,
        holiday: attendanceData.holiday || 0,
        onDuty: attendanceData.onDuty || 0,
        workFromHome: attendanceData.workFromHome || 0,
        halfDay: attendanceData.halfDay || 0,
        paidLeave: attendanceData.paidLeave || 0,
        unpaidLeave: attendanceData.unpaidLeave || 0,
        holidayPresent: attendanceData.holidayPresent || 0,
        weekoffPresent: attendanceData.weekoffPresent || 0,
        earlyLeaving: attendanceData.earlyLeaving || 0,
        earlyLeavingCount: attendanceData.earlyLeavingCount || 0,
        earlyLeavingAllowed: attendanceData.earlyLeavingAllowed || 0,
        earlyLeavingData: attendanceData.earlyLeavingData || {},
        totalEarlyDuration: attendanceData.totalEarlyDuration || 0,
        deductedEarlyDuration: attendanceData.deductedEarlyDuration || 0,

        lateComing: attendanceData.lateComing || 0,
        lateEntryCount: attendanceData.lateEntryCount || 0,
        lateComingAllowed: attendanceData.lateComingAllowed || 0,
        lateData: attendanceData.lateData || {},
        totalLateDuration: attendanceData.totalLateDuration,
        deductedLateDuration: attendanceData.deductedLateDuration || 0,

        workingHours: attendanceData.workingHours || 0,
        workingHoursCount: attendanceData.workingHoursCount || 0,
        workingHoursAllowed: attendanceData.workingHoursAllowed || 0,
        workingHoursData: attendanceData.workingHoursData || {},

        workingDayOT: attendanceData.workingDayOT || 0,
        weekOffOT: attendanceData.weekOffOT || 0,
        holidayOT: attendanceData.holidayOT || 0,
        workFromHomeOT: attendanceData.workFromHomeOT || 0,
        totalPayableDays: attendanceData.totalPayableDays || 0,
      };
    } else {
      employeeAttendanceData.value = {
        present: 0,
        absent: 0,
        weekOff: 0,
        holiday: 0,
        onDuty: 0,
        workFromHome: 0,
        halfDay: 0,
        paidLeave: 0,
        unpaidLeave: 0,
        holidayPresent: 0,
        weekoffPresent: 0,
        earlyLeaving: 0,
        totalEarlyDuration: 0,
        deductedEarlyDuration: 0,
        earlyLeavingCount: 0,
        earlyLeavingAllowed: 0,
        earlyLeavingData: {},

        lateComing: 0,
        totalLateDuration: 0,
        deductedLateDuration: 0,
        lateEntryCount: 0,
        lateComingAllowed: 0,
        lateData: {},

        workingHours: 0,
        workingHoursCount: 0,
        workingHoursAllowed: 0,
        workingHoursData: {},

        workingDayOT: 0,
        weekOffOT: 0,
        holidayOT: 0,
        workFromHomeOT: 0,
        totalPayableDays: 0,
      };

      const apiUrl = `${import.meta.env.VITE_API_URL}/attendanceSummary`;

      const response = await axios.get(apiUrl, {
        params: {
          "filter[_and][0][date][_between][0]": cycleStartDate.value,
          "filter[_and][0][date][_between][1]": cycleEndDate.value,
          "filter[_and][1][employeeId][_eq]": employeeId,
          "filter[_and][2][tenant][tenantId][_eq]": tenantId.value,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const data = response.data.data[0];
        employeeAttendanceData.value = {
          present: data.present || 0,
          absent: data.absent || 0,
          weekOff: data.weekOff || 0,
          holiday: data.holiday || 0,
          onDuty: data.onDuty || 0,
          workFromHome: data.workFromHome || 0,
          halfDay: data.halfDay || 0,
          paidLeave: data.paidLeave || 0,
          unpaidLeave: data.unpaidLeave || 0,
          holidayPresent: data.holidayPresent || 0,
          weekoffPresent: data.weekoffPresent || 0,
          earlyLeaving: data.earlyLeaving || 0,
          earlyLeavingCount: data.earlyLeavingCount || 0,
          earlyLeavingAllowed: data.earlyLeavingAllowed || 0,
          earlyLeavingData: data.earlyLeavingData || {},
          totalEarlyDuration: data.totalEarlyDuration || 0,
          deductedEarlyDuration: data.deductedEarlyDuration || 0,

          lateComing: data.lateComing || 0,
          lateEntryCount: data.lateEntryCount || 0,
          lateComingAllowed: data.lateComingAllowed || 0,
          lateData: data.lateData || {},
          totalLateDuration: data.totalLateDuration,
          deductedLateDuration: data.deductedLateDuration || 0,

          workingHours: data.workingHours || 0,
          workingHoursCount: data.workingHoursCount || 0,
          workingHoursAllowed: data.workingHoursAllowed || 0,
          workingHoursData: data.workingHoursData || {},

          workingDayOT: data.workingDayOT || 0,
          workingDayOTHours: data.workingDayOTHours,
          weekOffOT: data.weekOffOT || 0,
          weekOffOTHours: data.weekOffOTHours,
          holidayOT: data.holidayOT || 0,
          holidayOTHours: data.holidayOTHours,
          workFromHomeOT: data.workFromHomeOT || 0,
          workFromHomeOTHours: data.workFromHomeOTHours,
          totalPayableDays: data.totalPayableDays || 0,
        };
      }
    }
  } catch (error) {
    console.error(`Error fetching attendance data for employee :`, error);
    throw error;
  }
};

const verifyAllAttendance = async () => {
  processing.value = true;

  try {
    const token = authService.getToken();
    const bulkPayload = [];
    const employeeIds = [];

    for (const employee of selectedEmployees.value) {
      if (employee.attendanceVerified) {
        continue;
      }
      const empId = employee.employee.id.toString();

      let attendanceData = attendanceSummaryData.value.find(
        (data) => data.employeeId.toString() === empId,
      );

      if (!attendanceData) {
        try {
          const apiUrl = `${import.meta.env.VITE_API_URL}/attendanceSummary`;
          const response = await axios.get(apiUrl, {
            params: {
              "filter[_and][0][date][_between][0]": cycleStartDate.value,
              "filter[_and][0][date][_between][1]": cycleEndDate.value,
              "filter[_and][1][employeeId][_eq]": empId,
              "filter[_and][2][tenant][tenantId][_eq]": tenantId.value,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          attendanceData = response.data?.data?.[0] || {
            employeeId: empId,
            present: 0,
            absent: 0,
            totalPayableDays: 0,
          };
        } catch (error) {
          console.error(
            `Error fetching attendance for employee ${empId}:`,
            error,
          );
          attendanceData = {
            employeeId: empId,
            present: 0,
            absent: 0,
            totalPayableDays: 0,
          };
        }
      }

      const payableDays = attendanceData.totalPayableDays || 0;
      employeeIds.push(empId);

      const month = new Date(cycleEndDate.value).toISOString().slice(0, 7);
      const uniqueId = `${tenantId.value}-${empId}-${month}`;

      if (
        !uniqueId ||
        !empId ||
        !tenantId.value ||
        !cycleStartDate.value ||
        !cycleEndDate.value
      ) {
        console.error(
          `Skipping employee ${empId} due to missing required fields`,
        );
        continue;
      }

      bulkPayload.push({
        attendaceVerification: true,
        payableDays,
        startDate: cycleStartDate.value,
        endDate: cycleEndDate.value,
        employee: empId,
        tenant: tenantId.value,
        totalAttendanceCount: attendanceData || {},
        uniqueId,
      });
    }

    if (bulkPayload.length === 0) {
      showSnackbar.value = true;
      snackbarMessage.value = "No valid employees to verify";
      snackbarColor.value = "info";
      processing.value = false;
      return;
    }

    const existingRecords = [];
    const uniqueIds = bulkPayload.map((p) => p.uniqueId);

    // ✅ BATCHED GET by employee.id + uniqueId
    for (let i = 0; i < bulkPayload.length; i += 100) {
      const batchPayload = bulkPayload.slice(i, i + 100);
      const batchUniqueIds = batchPayload.map((p) => p.uniqueId);
      const batchEmployeeIds = batchPayload.map((p) => p.employee);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
        {
          params: {
            "filter[_and][0][uniqueId][_in]": batchUniqueIds.join(","),
            "filter[_and][1][employee][id][_in]": batchEmployeeIds.join(","),
            fields: "id,employee.id,uniqueId",
            limit: -1,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      existingRecords.push(...(response.data.data || []));
    }

    console.log(
      `Found ${existingRecords.length} existing verification records`,
    );

    const updatePayloads = [];
    const createPayloads = [];
    const skippedEmployees = new Set();

    for (const payload of bulkPayload) {
      // Double-check all required fields are present
      if (
        !payload.uniqueId ||
        !payload.employee ||
        !payload.tenant ||
        !payload.startDate ||
        !payload.endDate
      ) {
        console.error(
          `Skipping employee ${payload.employee} due to missing required fields`,
        );
        skippedEmployees.add(payload.employee);
        continue;
      }

      const existingRecord = existingRecords.find(
        (record) =>
          record.uniqueId === payload.uniqueId &&
          record.employee?.id?.toString() === payload.employee.toString(),
      );

      if (existingRecord) {
        if (!existingRecord.id) {
          console.error(
            `Skipping update for employee ${payload.employee} - missing record ID`,
          );
          skippedEmployees.add(payload.employee);
          continue;
        }
        updatePayloads.push({ id: existingRecord.id, ...payload });
      } else {
        createPayloads.push(payload);
      }
    }

    // ✅ Extra defensive filter against missed uniqueId collisions
    const existingUniqueIds = new Set(existingRecords.map((r) => r.uniqueId));
    const finalCreatePayloads = createPayloads.filter(
      (p) =>
        !existingUniqueIds.has(p.uniqueId) &&
        p.uniqueId &&
        p.employee &&
        p.tenant &&
        p.startDate &&
        p.endDate,
    );

    // Track skipped duplicates
    const skippedDuplicates = createPayloads.filter(
      (p) =>
        existingUniqueIds.has(p.uniqueId) ||
        !p.uniqueId ||
        !p.employee ||
        !p.tenant ||
        !p.startDate ||
        !p.endDate,
    );
    skippedDuplicates.forEach((p) => skippedEmployees.add(p.employee));
    console.log("⚠️ Skipped employees:", Array.from(skippedEmployees));

    console.log(
      `Will update ${updatePayloads.length} records and create ${finalCreatePayloads.length} new records`,
    );

    // Track successful operations
    let successfullyProcessed = 0;
    const failedEmployees = new Set();

    // 🔁 PATCH (update)
    for (let i = 0; i < updatePayloads.length; i += 100) {
      const batch = updatePayloads
        .slice(i, i + 100)
        .filter(
          (p) =>
            p.id &&
            p.uniqueId &&
            p.employee &&
            p.tenant &&
            p.startDate &&
            p.endDate,
        );

      if (batch.length === 0) continue;

      try {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
          batch,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log(`Updated ${batch.length} records`);
        successfullyProcessed += batch.length;
      } catch (error) {
        console.error(`Error updating batch starting at index ${i}:`, error);
        batch.forEach((p) => failedEmployees.add(p.employee));
      }
    }

    // ➕ POST (create)
    for (let i = 0; i < finalCreatePayloads.length; i += 100) {
      const batch = finalCreatePayloads
        .slice(i, i + 100)
        .filter(
          (p) =>
            p.uniqueId && p.employee && p.tenant && p.startDate && p.endDate,
        );

      if (batch.length === 0) continue;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
          batch,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log(`Created ${batch.length} new records`);
        successfullyProcessed += batch.length;
      } catch (error) {
        console.error(`Error creating batch starting at index ${i}:`, error);
        batch.forEach((p) => failedEmployees.add(p.employee));
      }
    }

    // ✅ Update local state only for successfully processed employees
    for (const empId of employeeIds) {
      // Skip if this employee was in failed or skipped lists
      if (failedEmployees.has(empId) || skippedEmployees.has(empId)) continue;

      const index = selectedEmployees.value.findIndex(
        (emp) => emp.employee.id.toString() === empId,
      );

      if (index !== -1) {
        const attendanceData = attendanceSummaryData.value.find(
          (data) => data.employeeId.toString() === empId,
        );
        selectedEmployees.value[index].attendanceVerified = true;
        selectedEmployees.value[index].payableDays =
          attendanceData?.totalPayableDays || 0;
      }
    }

    // Prepare success message with details
    let successMessage = `Successfully processed ${successfullyProcessed} of ${bulkPayload.length} employees.`;

    if (skippedEmployees.size > 0) {
      successMessage += ` ${skippedEmployees.size} were skipped (invalid data or duplicates).`;
    }

    if (failedEmployees.size > 0) {
      successMessage += ` ${failedEmployees.size} failed to process.`;
    }

    showSnackbar.value = true;
    snackbarMessage.value = successMessage;
    snackbarColor.value = successfullyProcessed > 0 ? "success" : "warning";

    setTimeout(() => {
      showVerifyAllDialog.value = false;
      router.push({
        name: "salary-verification",
        query: {
          start: cycleStartDate.value,
          end: cycleEndDate.value,
        },
      });
    }, 2000);
  } catch (error) {
    console.error("Error verifying attendance:", error);
    showSnackbar.value = true;
    snackbarMessage.value = `Error: ${error.message}`;
    snackbarColor.value = "error";
  } finally {
    processing.value = false;
  }
};

const handleNext = () => {
  router.push({
    name: "salary-verification",
    query: {
      start: cycleStartDate.value,
      end: cycleEndDate.value,
    },
  });
};

onMounted(() => {
  loadSelectedEmployees();
  loadDateRangeFromStorage();
  fetchAttendanceSummary();
});
</script>

<style scoped>
:deep(.custom-employee-table .employee-status-table) {
  max-height: 45px; /* your desired reduced height */
  overflow-y: auto;
}

.penalties-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.penalty-row {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  gap: 20px;
}

.penalty-label {
  font-weight: 600;
  color: #374151;
  min-width: 140px;
  font-size: 14px;
}

.penalty-stats {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
}

.stat-item {
  text-align: center;
  min-width: 100px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.badge-container {
  margin-left: 20px;
}

.badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-leave {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.badge-lop {
  background-color: #fee2e2;
  color: #dc2626;
}

.applied-info {
  text-align: right;
  min-width: 140px;
}

.applied-title {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  line-height: 1.2;
}

.applied-subtitle {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.calculation {
  margin-left: auto;
  padding-left: 20px;
}

.calc-text {
  background-color: #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.simple-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.simple-row:last-child {
  border-bottom: none;
}

.simple-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.simple-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.payroll-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding-bottom: 80px;
}

.header-banner {
  background: #ecfdf5;
  padding: 1.5rem;
  color: rgb(0, 0, 0);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0;
}

.cycle-type-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 1rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
}

.title-section {
  flex: 1;
}

.main-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 0.75rem;
}

.subtitle-wrapper {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.employee-count,
.date-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attendance-cycle {
  background: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stepper-container {
  width: 100%;
  margin: 0 auto 1rem;
  padding: 0 1rem;
}

.stepper {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  position: relative;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #6c757d;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.step.active .step-icon {
  background: #4776e6;
  color: white;
}

.step.completed .step-icon {
  background: #48bb78;
  color: white;
}

.step.disabled {
  opacity: 0.6;
}

.step-label {
  font-weight: 500;
  color: #4a5568;
}

.step.active .step-label {
  color: #4776e6;
  font-weight: 600;
}

.step.completed .step-label {
  color: #48bb78;
  font-weight: 600;
}

.step-connector {
  flex: 1;
  height: 3px;
  background: #e9ecef;
  margin: 0 1rem;
}

.step-connector.completed {
  background: #48bb78;
}

.main-content {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 1rem;
}

.content-wrapper {
  height: calc(100vh - 350px);
  overflow-y: auto;
  padding: 0 1rem;
}

.content-section {
  background: white;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: overlay;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
  width: 100%;
}

.employee-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
  height: 100%;
}

.employee-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.verified-attendance {
  border-top: 3px solid #48bb78;
}

.unverified-attendance {
  border-top: 3px solid #f56565;
}

.employee-card-header {
  padding: 1.25rem;
  background: white;
  border-bottom: 1px solid #e9ecef;
}

.employee-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.employee-id {
  font-size: 0.85rem;
  color: #718096;
}

.employee-card-body {
  padding: 1.25rem;
}

.employee-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.detail-label {
  color: #718096;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 500;
  color: #2d3748;
}

.employee-card-footer {
  padding: 1rem 1.25rem;
  background: #f1f5f9;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.status-badge.verified {
  background: rgba(72, 187, 120, 0.1);
  color: #2f855a;
}

.status-badge.unverified {
  background: rgba(245, 101, 101, 0.1);
  color: #c53030;
}

.settings-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.setting-toggle {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.setting-toggle.active {
  background: rgba(71, 118, 230, 0.05);
  border-left: 4px solid #5d80d1;
}

.setting-label {
  margin-left: 1rem;
}

.setting-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.85rem;
  color: #718096;
}

.switch-appearance {
  position: relative;
  width: 38px;
  height: 20px;
  border-radius: 10px;
  background-color: #e2e8f0;
  transition: all 0.3s ease;
}

.switch-appearance.switch-on {
  background-color: #4776e6;
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.switch-appearance.switch-on .switch-thumb {
  left: 20px;
}

.action-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.action-btn {
  min-width: 180px;
}

.settings-btn {
  min-width: 240px;
  margin-right: auto;
}

.employee-details-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  background: #4b6097;
  color: white;
}

.dialog-content {
  padding: 1.5rem;
}

.tab-item {
  text-transform: none;
  font-weight: 500;
}

.detail-list {
  margin-top: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item.total {
  border-top: 2px solid #e9ecef;
  border-bottom: none;
  margin-top: 1rem;
  padding-top: 1rem;
}

.detail-item-label {
  color: #4a5568;
  font-weight: 500;
}

.detail-item-value {
  font-weight: 600;
  color: #2d3748;
}

.attendance-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.attendance-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.attendance-item.total {
  background: #4776e6;
  color: white;
  grid-column: 1 / -1;
}

.attendance-item.total .attendance-label,
.attendance-item.total .attendance-value {
  color: white;
}

.attendance-label {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #718096;
}

.attendance-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.attendance-summary-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
  background: #f8fafc;
  border-radius: 10px;
  padding: 1.5rem;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}

.dialog-actions {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e9ecef;
}

.verify-all-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.verify-dialog-title {
  background: #4b6097;
  color: white;
  padding: 1.25rem;
}

.verify-dialog-content {
  padding: 2rem;
}

.verify-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.verify-loading-text {
  margin-top: 1.5rem;
  font-size: 1rem;
  color: #4a5568;
  text-align: center;
}

.verify-confirm-text {
  font-size: 1rem;
  color: #4a5568;
  text-align: center;
}

.verify-details {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #718096;
}

.verify-dialog-actions {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e9ecef;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1rem;
  color: #4a5568;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.items-per-page-select {
  width: 100px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
  }

  .employee-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .action-footer {
    flex-direction: column;
    padding: 1rem;
  }

  .action-btn,
  .cancel-btn,
  .settings-btn {
    width: 100%;
  }

  .attendance-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .attendance-summary-footer {
    grid-template-columns: 1fr;
  }

  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
}
/* new */
.expanded-content-wrapper {
  background-color: #f8f9fa;
  padding: 0 !important;
}

.expanded-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 24px;
  background-color: #f8f9fa;
}

.details-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-label {
  font-size: 13px;
  color: #6c757d;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.success-text {
  color: #28a745 !important;
}

.warning-text {
  color: #ffc107 !important;
}

.info-text {
  color: #17a2b8 !important;
}

.error-text {
  color: #dc3545 !important;
}

.purple-text {
  color: #9c27b0 !important;
}

.total-row {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid #e0e0e0;
}

.total-label {
  font-weight: 600;
  color: #2c3e50 !important;
}

.total-value {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50 !important;
}
</style>

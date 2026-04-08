<template>
  <div class="employee-container" :class="{ 'filter-open': showFilters }">
    <div class="filter-pane" v-if="showFilters && tenantId">
      <div class="filter-content">
        <PayrollFilters
          :tenantId="tenantId"
          :initialFilters="initialFilters"
          :initiallyVisible="true"
          :filter-schema="pageFilters"
          @apply-filters="handleApplyFilters"
          @filter-visibility-changed="onFilterVisibilityChanged"
        />
      </div>
    </div>

    <div class="main-content">
      <!-- Integrate DataTable wrapper -->
      <data-table-wrapper
        v-model:searchQuery="search"
        search-placeholder="Search Employee "
        :show-search="true"
        :is-empty="items.length === 0 && !search"
        :has-error="false"
        @update:searchQuery="debouncedSearch"
      >
        <template #before-search>
          <button
            v-if="tenantId"
            class="filter-toggle-static"
            @click="toggleFilters"
            :class="{ active: hasActiveFilters }"
            :title="showFilters ? 'Hide filters' : 'Show filters'"
            aria-label="Toggle filters"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
            </svg>
            <div v-if="hasActiveFilters" class="filter-indicator"></div>
          </button>
        </template>
        <template #below-search>
          <div class="position-relative">
            <BaseButton
              variant="primary"
              size="md"
              :left-icon="RefreshCw"
              @click="recalculateAttendance"
              class="ms-2"
            >
              Recalc Attendance
            </BaseButton>

            <BaseButton
              variant="success"
              size="md"
              :left-icon="BadgeCheck"
              @click="markAsPaid"
              :disabled="!hasFinalizedUnpaidUsers"
              class="ms-2"
            >
              Mark as Paid
            </BaseButton>

            <BaseButton
              variant="primary"
              size="md"
              :left-icon="CheckCheck"
              @click="finalizeMultiplePayroll()"
              :disabled="selected.length === 0"
              class="ms-2"
            >
              Finalize Payroll ({{ selected.length }})
            </BaseButton>

            <BaseButton
              variant="primary"
              size="md"
              :left-icon="FileSpreadsheet"
              @click="downloadSalarySheet()"
              class="ms-2"
            >
              Salary Sheet
              <span v-if="selected.length > 0" class="ml-1">
                ({{ selected.length }})
              </span>
            </BaseButton>
          </div></template
        >
        <!-- Toolbar Actions Slot -->

        <template v-slot:toolbar-actions>
          <div class="stats-container">
            <div class="stat-item">
              <span class="stat-value">{{ payrollCounts.paid }}</span>
              <span class="stat-title">Paid</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ payrollCounts.unpaid }}</span>
              <span class="stat-title">Unpaid</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ payrollCounts.finalized }}</span>
              <span class="stat-title">Finalized</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ payrollCounts.unfinalized }}</span>
              <span class="stat-title">Unfinalized</span>
            </div>
          </div>
        </template>
        <!-- Table Content -->
        <template v-slot:default>
          <SkeletonLoading
            v-if="loading"
            variant="data-table"
            :rows="6"
            :columns="columns.length"
            :animated="true"
          />
          <ErrorState
            v-else-if="error"
            :title="'Unable to load employees'"
            :message="error"
            :retry-action="{ text: 'Try Again', icon: RefreshCw }"
            @retry="fetchItems"
          />

          <div v-else>
            <DataTable
              :items="items"
              :columns="columns"
              :selected-items="selected"
              :show-selection="true"
              :sort-by="sortBy"
              :sort-direction="sortDirection"
              :row-clickable="true"
              @update:selected-items="selected = $event"
              @rowClick="handleRowClick"
            >
              <template v-slot:top>
                <div class="d-flex align-center py-2 px-4">
                  <v-chip
                    v-if="dateRange.start && dateRange.end"
                    class="mr-2 mb-1 mt-1"
                    :closable="false"
                  >
                    {{ formatDateForDisplay(dateRange.start) }} -
                    {{ formatDateForDisplay(dateRange.end) }}
                  </v-chip>
                  <!-- <v-chip
                  v-if="selectedCycleId !== 1"
                  class="mr-2 mb-1 mt-1"
                  color="primary"
                  closable
                  @click:close="clearCycleTypeFilter"
                >
                  Cycle: {{ getCycleNameById(selectedCycleId) }}
                </v-chip> -->
                  <v-chip
                    v-if="verificationFilters.attendance !== null"
                    :color="
                      verificationFilters.attendance ? 'success' : 'error'
                    "
                    closable
                    @click:close="clearAttendanceFilter"
                  >
                    Attendance:
                    {{
                      verificationFilters.attendance ? "Verified" : "Unverified"
                    }}
                  </v-chip>
                  <v-chip
                    v-if="verificationFilters.salary !== null"
                    class="mr-2 mb-1 mt-1"
                    :color="verificationFilters.salary ? 'success' : 'error'"
                    closable
                    @click:close="clearSalaryFilter"
                  >
                    Salary:
                    {{
                      verificationFilters.salary ? "Finalized" : "Unfinalized"
                    }}
                  </v-chip>
                  <v-chip
                    v-if="verificationFilters.salaryPaid !== null"
                    class="mr-2 mb-1 mt-1"
                    :color="
                      verificationFilters.salaryPaid === 'paid'
                        ? 'success'
                        : 'error'
                    "
                    closable
                    @click:close="clearSalaryPaidFilter"
                  >
                    Salary Status:
                    {{
                      verificationFilters.salaryPaid === "paid"
                        ? "Paid"
                        : "Unpaid"
                    }}
                  </v-chip>
                </div>
              </template>
              <template v-slot:cell-employee.employeeId="{ item }">
                <strong>{{ item.employee.employeeId || "-" }}</strong>
              </template>
              <template v-slot:cell-employee.assignedUser.first_name="{ item }">
                <span class="text-primary">{{
                  item.employee.assignedUser.first_name || "-"
                }}</span>
              </template>
              <template v-slot:cell-employee.assignedUser.role.name="{ item }">
                {{ item.employee.assignedUser.role?.name || "-" }}
              </template>
              <template
                v-slot:cell-employee.assignedUser.designation="{ item }"
              >
                {{ item.employee.assignedUser.designation || "-" }}
              </template>
              <!-- Preserve existing top slot content -->

              <!-- Custom cell slots -->
              <!-- <template v-slot:cell-employee.cycleType="{ item }">
              {{ getCycleNameById(item.employee.cycleType) }}
            </template> -->
              <template v-slot:cell-attendanceVerification="{ item }">
                <v-icon
                  :color="item.attendanceVerified ? 'success' : 'error'"
                  small
                  style="position: static"
                >
                  {{
                    item.attendanceVerified
                      ? "mdi-check-circle"
                      : "mdi-alert-circle"
                  }}
                </v-icon>
                {{ item.attendanceVerified ? "Verified" : "Unverified" }}
              </template>
              <template v-slot:cell-salaryVerification="{ item }">
                <v-icon
                  :color="item.salaryVerified ? 'success' : 'error'"
                  small
                  style="position: static"
                >
                  {{
                    item.salaryVerified
                      ? "mdi-check-circle"
                      : "mdi-alert-circle"
                  }}
                </v-icon>
                {{ item.salaryVerified ? "Finalized" : "Unfinalized" }}
              </template>
              <template v-slot:cell-pending="{ item }">
                <v-chip :color="item.isPending ? 'orange' : 'green'" small>
                  {{ item.isPending ? "Pending" : "Approved" }}
                </v-chip>
              </template>
              <template v-slot:cell-salaryPaid="{ item }">
                <span
                  class="salary-paid-status"
                  :class="item.salaryPaid === 'paid' ? 'paid' : 'unpaid'"
                >
                  {{ item.salaryPaid === "paid" ? "Paid" : "Unpaid" }}
                </span>
              </template>

              <template v-slot:cell-activity="{ item }">
                <v-chip
                  :color="getActivityColor(item.activity)"
                  small
                  variant="outlined"
                >
                  {{ item.activity }}
                </v-chip>
              </template>
              <template v-slot:cell-joiningDate="{ item }">
                {{
                  item.joiningDate
                    ? formatDateForDisplay(item.joiningDate)
                    : "-"
                }}
              </template>
              <template v-slot:cell-leavingDate="{ item }">
                {{
                  item.leavingDate
                    ? formatDateForDisplay(item.leavingDate)
                    : "-"
                }}
              </template>
              <template v-slot:cell-startDate="{ item }">
                {{
                  item.startDate ? formatDateForDisplay(item.startDate) : "-"
                }}
              </template>
              <template v-slot:cell-endDate="{ item }">
                {{ item.endDate ? formatDateForDisplay(item.endDate) : "-" }}
              </template>
              <template v-slot:cell-ctc="{ item }">
                {{ formatAmount(item.ctc) }}
              </template>
              <template v-slot:cell-payableDays="{ item }">
                {{ item.payableDays || "-" }}
              </template>
              <template v-slot:cell-payableCTC="{ item }">
                {{ formatAmount(item.payableCTC) }}
              </template>
              <template v-slot:cell-data-table-select="{ item }">
                <v-checkbox
                  :model-value="isItemSelected(item)"
                  @update:model-value="
                    (value) => handleCheckboxChange(item, value)
                  "
                  :disabled="!isItemSelectable(item)"
                  color="black"
                  density="compact"
                  @click.stop
                />
              </template>
              <!-- <template v-slot:empty-state>
              <div class="d-flex flex-column align-center py-6">
                <v-icon size="64" color="grey lighten-2" class="mb-4"
                  >mdi-file-search-outline</v-icon
                >
                <h3 class="text-h6 font-weight-medium text-center">
                  No data found
                </h3>
                <p class="text-body-2 text-center text-medium-emphasis">
                  {{ getNoDataMessage() }}
                </p>
                <v-btn color="primary" class="mt-4" @click="clearFilters"
                  >Clear Filters</v-btn
                >
              </div>
            </template> -->
            </DataTable>
          </div>
        </template>

        <!-- Pagination Slot -->
        <template v-slot:pagination>
          <CustomPagination
            v-if="!showForm"
            v-model:page="page"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </data-table-wrapper>

      <!-- Filter Panel and Dialogs remain unchanged -->
      <!-- <transition name="slide">
        <div v-if="showFilters" class="filter-panel">
          <div class="filter-header">
            <div class="d-flex align-center justify-space-between px-4">
              <h3 class="text-h6 font-weight-medium">Advanced Filters</h3>
              <v-btn icon @click="toggleFilters">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
          <div class="filter-content">
            <div class="mb-4">
              <h4 class="text-subtitle-1 font-weight-bold mb-2">
                Attendance Cycle
              </h4>
              <div class="d-flex flex-wrap">
                <v-col cols="12" class="pa-0 mb-2">
                  <v-select
                    v-model="selectedMonth"
                    :items="monthOptions"
                    label="Select Month"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleMonthChange"
                  ></v-select>
                </v-col>
                <v-col cols="12" class="pa-0 mb-2">
                  <v-select
                    v-model="selectedCycleId"
                    :items="cycleTypeOptions"
                    item-title="cycleName"
                    item-value="cycleId"
                    label="Cycle Type"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleCycleTypeChange"
                  ></v-select>
                </v-col>
                <v-col cols="12" class="pa-0">
                  <div class="d-flex align-center">
                    <v-chip color="primary" class="mr-2">
                      {{ getCycleNameById(selectedCycleId) }}
                    </v-chip>
                    <span
                      v-if="dateRange.start && dateRange.end"
                      class="text-body-2"
                    >
                      {{ formatDateForDisplay(dateRange.start) }} -
                      {{ formatDateForDisplay(dateRange.end) }}
                    </span>
                  </div>
                </v-col>
              </div>
            </div>
            <v-select
              v-model="filters.branch"
              :items="branchOptions"
              label="Branch"
              multiple
              chips
              closable-chips
              variant="outlined"
              class="mb-4"
              @update:model-value="handleFilterChange"
              persistent-placeholder
            >
              <template v-slot:selection="{ item }">{{ item.title }}</template>
            </v-select>
            <v-select
              v-model="filters.department"
              :items="departmentOptions"
              label="Department"
              multiple
              chips
              closable-chips
              variant="outlined"
              class="mb-4"
              @update:model-value="handleFilterChange"
              persistent-placeholder
            >
              <template v-slot:selection="{ item }">{{ item.title }}</template>
            </v-select>
            <div class="mb-4">
              <h5 class="text-body-2 font-weight-bold mb-1">
                Unfinalize Payroll
              </h5>
              <v-btn
                color="warning"
                variant="outlined"
                class="mt-2"
                @click="selectUnfinalizedUsers"
                :loading="processingUnfinalized"
              >
                <v-icon start>mdi-account-multiple</v-icon>
                Unfinalize All payroll
              </v-btn>
            </div>
            <div class="mb-4">
              <h4 class="text-subtitle-1 font-weight-bold mb-2">
                Verification Status
              </h4>
              <div class="d-flex flex-wrap">
                <div class="mr-4 mb-2">
                  <h5 class="text-body-2 font-weight-medium mb-1">
                    Attendance
                  </h5>
                  <v-btn-toggle
                    v-model="verificationFilters.attendance"
                    mandatory
                    color="primary"
                    density="comfortable"
                    rounded="pill"
                  >
                    <v-btn :value="true" variant="outlined">Verified</v-btn>
                    <v-btn :value="false" variant="outlined">Unverified</v-btn>
                  </v-btn-toggle>
                </div>
                <div>
                  <h5 class="text-body-2 font-weight-medium mb-1">Salary</h5>
                  <v-btn-toggle
                    v-model="verificationFilters.salary"
                    mandatory
                    color="primary"
                    density="comfortable"
                    rounded="pill"
                  >
                    <v-btn :value="true" variant="outlined">Finalized</v-btn>
                    <v-btn :value="false" variant="outlined">Unfinalized</v-btn>
                  </v-btn-toggle>
                </div>
              </div>
            </div>
            <div class="mb-4">
              <h5 class="text-body-2 font-weight-medium mb-1">Salary Status</h5>
              <v-btn-toggle
                v-model="verificationFilters.salaryPaid"
                mandatory
                color="primary"
                density="comfortable"
                rounded="pill"
              >
                <v-btn :value="'paid'" variant="outlined">Paid</v-btn>
                <v-btn :value="'unPaid'" variant="outlined">Unpaid</v-btn>
              </v-btn-toggle>
            </div>
            <div class="filter-actions">
              <v-btn color="error" variant="text" @click="clearFilters"
                >Clear</v-btn
              >
              <v-btn color="primary" @click="applyFilters" class="ms-2"
                >Apply</v-btn
              >
            </div>
          </div>
        </div>
      </transition> -->

      <!-- Dialogs remain unchanged -->
      <DownloadProgressDialog
        v-model:show="showDownloadProgress"
        :progress="downloadProgress"
        :title="downloadTitle"
        :file-name="downloadFileName"
        :file-size="downloadFileSize"
        :show-cancel="downloadProgress < 100"
        @cancel="cancelDownload"
      />
      <v-dialog v-model="showPayslipPreview" max-width="800px">
        <v-card>
          <v-card-title class="text-h5 bg-primary text-white">
            Payslip Preview
            <v-spacer></v-spacer>
          </v-card-title>
          <v-card-text class="pa-0">
            <div ref="payslipPreviewContent" class="payslip-preview-content">
              <div v-if="currentPayslipData" class="payslip-container-new">
                <div class="payslip-loading" v-if="generatingPdf">
                  <v-progress-circular indeterminate color="primary" />
                  <span class="ml-2">Generating PDF...</span>
                </div>
                <div v-else class="payslip-content">
                  <!-- Header Section -->
                  <div class="payslip-header-new">
                    <div>
                      <h1 class="company-name">
                        {{ currentPayslipData.tenantName }}
                      </h1>
                      <p
                        v-if="currentPayslipData.Address"
                        class="company-address"
                      >
                        {{ currentPayslipData.Address.house }},
                        {{ currentPayslipData.Address.street }},
                        {{ currentPayslipData.Address.vtc }},
                        {{ currentPayslipData.Address.dist }},
                        {{ currentPayslipData.Address.zip }}
                      </p>
                      <h2 class="payslip-title-text">
                        PAYSLIP FOR
                        {{
                          formatPayrollMonth(
                            currentPayslipData.month,
                            currentPayslipData.year,
                          )
                        }}
                      </h2>
                    </div>
                  </div>

                  <!-- Employee Details Section -->
                  <div class="section-container">
                    <div class="section-header">Employee Details</div>
                    <table class="details-table">
                      <tbody>
                        <tr>
                          <td class="label-cell">Employee Name:</td>
                          <td class="value-cell">
                            {{ currentPayslipData.employeeName }}
                          </td>
                          <td class="label-cell">Employee ID:</td>
                          <td class="value-cell">
                            {{ currentPayslipData.employeeId }}
                          </td>
                        </tr>
                        <tr>
                          <td class="label-cell">Role:</td>
                          <td class="value-cell">
                            {{ currentPayslipData.Role }}
                          </td>
                          <td class="label-cell">Designation:</td>
                          <td class="value-cell">
                            {{ currentPayslipData.designation }}
                          </td>
                        </tr>
                        <tr>
                          <td class="label-cell">PF(UAN) Number:</td>
                          <td colspan="3" class="value-cell">
                            {{ currentPayslipData.PFNumber }}
                          </td>
                        </tr>
                        <tr>
                          <td class="label-cell">ESI Number:</td>
                          <td colspan="3" class="value-cell">
                            {{ currentPayslipData.ESINumber }}
                          </td>
                        </tr>
                        <tr>
                          <td class="label-cell">Pay Period:</td>
                          <td class="value-cell">
                            {{
                              formatPayrollMonth(
                                currentPayslipData.month,
                                currentPayslipData.year,
                              )
                            }}
                          </td>
                          <td class="label-cell">Payable Days:</td>
                          <td class="value-cell">
                            {{ currentPayslipData.payableDays }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Earnings and Deductions Section -->
                  <div class="salary-grid">
                    <!-- Earnings Column -->
                    <div class="salary-column">
                      <div class="section-header">Earnings</div>
                      <table class="salary-table">
                        <tbody>
                          <tr
                            v-for="(value, key) in currentPayslipData.earnings"
                            :key="`earning-${key}`"
                          >
                            <td class="item-cell">{{ key }}</td>
                            <td class="amount-cell">
                              {{
                                value === null
                                  ? "NaN"
                                  : formatAmount(value || 0)
                              }}
                            </td>
                          </tr>

                          <!-- Salary Arrears -->
                          <template
                            v-if="
                              currentPayslipData.salaryArrears &&
                              Object.keys(currentPayslipData.salaryArrears)
                                .length > 0
                            "
                          >
                            <tr>
                              <td colspan="2" class="subsection-header">
                                Salary Arrears
                              </td>
                            </tr>
                            <tr
                              v-for="(
                                value, key
                              ) in currentPayslipData.salaryArrears"
                              :key="`arrear-${key}`"
                            >
                              <td class="item-cell">{{ key }}</td>
                              <td class="amount-cell">
                                {{ formatAmount(value || 0) }}
                              </td>
                            </tr>
                          </template>

                          <!-- Benefits -->
                          <template
                            v-if="
                              currentPayslipData.benefits &&
                              Object.keys(currentPayslipData.benefits).length >
                                0
                            "
                          >
                            <tr>
                              <td colspan="2" class="subsection-header">
                                Benefits
                              </td>
                            </tr>
                            <tr
                              v-for="(
                                value, key
                              ) in currentPayslipData.benefits"
                              :key="`benefit-${key}`"
                            >
                              <td class="item-cell">{{ key }}</td>
                              <td class="amount-cell">
                                {{ formatAmount(value || 0) }}
                              </td>
                            </tr>
                          </template>

                          <!-- Total Earnings -->
                          <tr class="total-row">
                            <td class="item-cell">Total Earnings</td>
                            <td class="amount-cell">
                              {{
                                currentPayslipData.totalEarnings === null
                                  ? "NaN"
                                  : formatAmount(
                                      currentPayslipData.totalEarnings || 0,
                                    )
                              }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Deductions Column -->
                    <div class="salary-column">
                      <div class="section-header">Deductions</div>
                      <table class="salary-table">
                        <tbody>
                          <tr
                            v-for="(
                              value, key
                            ) in currentPayslipData.deductions"
                            :key="`deduction-${key}`"
                          >
                            <td class="item-cell">{{ key }}</td>
                            <td class="amount-cell">
                              {{ formatAmount(value || 0) }}
                            </td>
                          </tr>

                          <!-- Penalties -->
                          <template
                            v-if="
                              currentPayslipData.penalties &&
                              Object.keys(currentPayslipData.penalties).length >
                                0
                            "
                          >
                            <tr>
                              <td colspan="2" class="subsection-header">
                                Penalties
                              </td>
                            </tr>
                            <tr
                              v-for="(
                                value, key
                              ) in currentPayslipData.penalties"
                              :key="`penalty-${key}`"
                            >
                              <td class="item-cell">{{ key }}</td>
                              <td class="amount-cell">
                                {{ formatAmount(value || 0) }}
                              </td>
                            </tr>
                          </template>

                          <!-- Other Deductions -->
                          <template
                            v-if="
                              currentPayslipData.otherDeduction &&
                              Object.keys(currentPayslipData.otherDeduction)
                                .length > 0
                            "
                          >
                            <tr>
                              <td colspan="2" class="subsection-header">
                                Other Deductions
                              </td>
                            </tr>
                            <tr
                              v-for="(
                                value, key
                              ) in currentPayslipData.otherDeduction"
                              :key="`other-deduction-${key}`"
                            >
                              <td class="item-cell">{{ key }}</td>
                              <td class="amount-cell">
                                {{ formatAmount(value || 0) }}
                              </td>
                            </tr>
                          </template>

                          <!-- Individual Deductions -->
                          <template
                            v-if="
                              currentPayslipData.individualDeduction &&
                              Object.keys(
                                currentPayslipData.individualDeduction,
                              ).length > 0
                            "
                          >
                            <tr>
                              <td colspan="2" class="subsection-header">
                                Individual Deductions
                              </td>
                            </tr>
                            <template
                              v-for="(
                                group, groupKey
                              ) in currentPayslipData.individualDeduction"
                              :key="`individual-deduction-group-${groupKey}`"
                            >
                              <tr
                                v-for="(value, key) in group"
                                :key="`individual-deduction-${groupKey}-${key}`"
                              >
                                <td class="item-cell">{{ key }}</td>
                                <td class="amount-cell">
                                  {{ formatAmount(value || 0) }}
                                </td>
                              </tr>
                            </template>
                          </template>

                          <!-- Total Deductions -->
                          <tr class="total-row">
                            <td class="item-cell">Total Deductions</td>
                            <td class="amount-cell">
                              {{
                                formatAmount(
                                  currentPayslipData.totalDeductions || 0,
                                )
                              }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Net Salary Section -->
                  <div class="net-salary-box">
                    <span class="net-salary-label">Net Salary (in words):</span>
                    <span class="net-salary-amount">{{
                      formatAmount(currentPayslipData.netSalary)
                    }}</span>
                  </div>

                  <!-- Attendance Summary (if applicable) -->
                  <!-- <div
                    v-if="
                      currentPayslipData &&
                      currentPayslipData.totalAttendanceCount
                    "
                    class="attendance-summary"
                  >
                    <h4>Attendance Summary</h4>
                    <div class="attendance-grid">
                      <template
                        v-for="(value, key) in formatAttendanceData(
                          currentPayslipData.totalAttendanceCount,
                        )"
                        :key="key"
                      >
                        <div class="attendance-item">
                          <span class="attendance-label">{{
                            key.replace(/([A-Z])/g, " $1").trim()
                          }}</span>
                          <span class="attendance-value">{{ value }}</span>
                        </div>
                      </template>
                    </div>
                  </div> -->
                </div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="error" @click="showPayslipPreview = false"
              >Close</v-btn
            >
            <v-btn
              color="primary"
              @click="downloadCurrentPayslip"
              :loading="generatingPdf"
              :disabled="generatingPdf"
            >
              <v-icon left>mdi-download</v-icon>
              Download PDF
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showPaidConfirmation" max-width="500px">
        <v-card>
          <v-card-title class="text-h5 bg-success text-white">
            Mark Users as Paid
          </v-card-title>
          <v-card-text class="pa-4 mt-4">
            <p class="mt-2">
              <strong>Note:</strong> Once marked as paid, these users cannot be
              unfinalized.
            </p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="grey" @click="showPaidConfirmation = false"
              >Cancel</v-btn
            >
            <v-btn
              color="success"
              @click="confirmMarkAsPaid"
              :loading="markingAsPaidInProgress"
              :disabled="markingAsPaidInProgress"
            >
              <v-icon left>mdi-cash</v-icon>
              Mark as Paid
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- No users to mark as paid dialog -->
      <v-dialog v-model="showNoUsersToMarkPaid" max-width="500px">
        <v-card>
          <v-card-title class="text-h5 bg-warning text-white">
            No Users to Mark as Paid
          </v-card-title>
          <v-card-text class="pa-4 mt-4">
            <p>
              No users available to mark as paid. Only finalized and unpaid
              users can be marked as paid.
            </p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="showNoUsersToMarkPaid = false"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Paid users selected warning dialog -->
      <v-dialog v-model="showPaidUsersWarning" max-width="500px">
        <v-card>
          <v-card-title class="text-h5 bg-warning text-white">
            Paid Users Selected
          </v-card-title>
          <v-card-text class="pa-4 mt-4">
            <p>
              You have selected {{ paidUsersCount }} paid users. Paid users
              cannot be unfinalized.
            </p>
            <p class="mt-2">
              <strong>Note:</strong> Only unpaid users can be unfinalized. Paid
              users are permanently finalized.
            </p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="showPaidUsersWarning = false"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Unfinalized users batch processing dialog -->
      <v-dialog v-model="showUnfinalizedDialog" max-width="500px">
        <v-card>
          <v-card-title class="text-h5 bg-warning text-white">
            Process Unfinalized Users
          </v-card-title>
          <v-card-text class="pa-4 mt-4">
            <p>
              Found {{ unfinalizedUsers.length }} finalized users or else
              unselect that employee
            </p>

            <v-progress-linear
              v-if="processingBatch"
              :value="(currentBatch / totalBatches) * 100"
              height="25"
              color="warning"
              class="mt-4"
            >
              <template v-slot:default="{ value }">
                <strong>{{ Math.ceil(value) }}% Complete</strong>
              </template>
            </v-progress-linear>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              @click="cancelUnfinalizedProcess"
              :disabled="processingBatch"
            >
              Cancel
            </v-btn>
            <v-btn
              color="warning"
              @click="processUnfinalizedBatch"
              :loading="processingBatch"
              :disabled="processingBatch"
            >
              <v-icon left>mdi-account-check</v-icon>
              UnFinalized
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Paid user selected dialog -->
      <v-dialog v-model="showPaidUserSelectedDialog" max-width="500px">
        <v-card>
          <v-card-title class="text-h5 bg-warning text-white">
            Paid User Selected
          </v-card-title>
          <v-card-text class="pa-4 mt-4">
            <p>
              You have selected a user who has already been paid. Paid users
              cannot be unfinalized.
            </p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="grey" @click="showPaidUserSelectedDialog = false"
              >Cancel</v-btn
            >
            <v-btn color="warning" @click="skipPaidUsers">
              <v-icon left>mdi-skip-next</v-icon>
              Skip Paid Users
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Mixed paid users dialog -->
      <v-dialog v-model="showMixedPaidUsersDialog" max-width="500px">
        <v-card>
          <v-card-title class="text-h5 bg-warning text-white">
            Some Selected Users Are Paid
          </v-card-title>
          <v-card-text class="pa-4 mt-4">
            <p>
              You have selected {{ paidUsersCount }} paid users and
              {{ unpaidUsersCount }} unpaid users.
            </p>
            <p class="mt-2">
              <strong>Note:</strong> Paid users cannot be unfinalized. Would you
              like to:
            </p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="grey" @click="showMixedPaidUsersDialog = false"
              >Cancel</v-btn
            >
            <v-btn color="warning" @click="skipPaidUsers">
              <v-icon left>mdi-skip-next</v-icon>
              Skip Paid & Continue with Unpaid
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- Modify the attendance popup -->
      <v-dialog v-model="showAttendancePopup" max-width="500">
        <v-card rounded="xl" class="pa-4" elevation="8">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">Processing Attendance</span>
          </v-card-title>

          <v-card-text>
            <div class="d-flex flex-column align-center" v-if="isProcessing">
              <v-progress-circular
                indeterminate
                color="indigo"
                size="40"
                class="mb-4"
              />
              <p class="text-body-1">
                Processing attendance for {{ totalCount }} employee(s)...
              </p>
              <p class="text-body-1 mt-2">
                Finished: {{ processedCount }} / {{ totalCount }}
              </p>
            </div>
            <div v-else class="d-flex flex-column align-center">
              <v-icon size="64" color="green" class="mb-4"
                >mdi-check-circle</v-icon
              >
              <p class="text-body-1">
                Successfully processed attendance for
                {{ successCount }} employee(s). Failed: {{ failedCount }}
              </p>
            </div>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn
              color="grey darken-1"
              dark
              rounded
              @click="cancel"
              v-if="isProcessing"
            >
              <v-icon left>mdi-close</v-icon>
              Cancel
            </v-btn>
            <v-btn color="primary" dark rounded @click="close" v-else>
              OK
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { downloadSalarySheet } from "@/services/payrollManagemnet/salarySheet";
import DownloadProgressDialog from "@/components/loadingProgresss/salarySheetProgress.vue";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";

import {
  fetchCycleTypes,
  getCycleById,
  formatCycleDates,
} from "@/utils/Tasksexport/fetchCycleTypes";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import PayrollFilters from "@/components/common/filters/payrollfilter.vue";
import {
  Undo2,
  CheckCheck,
  FileSpreadsheet,
  RefreshCw,
  BadgeCheck,
} from "lucide-vue-next";

export default {
  components: {
    SkeletonLoading,
    CustomPagination,
    DownloadProgressDialog,
    DataTable,
    DataTableWrapper,
    BaseButton,
    PayrollFilters,
    ErrorState,
  },

  name: "PayrollManagement",
  // props: {
  //   tenantId: {
  //     type: String,
  //     required: true,
  //   },
  //   token: {
  //     type: String,
  //     required: true,
  //   },
  // },
  data() {
    const currentDate = new Date();
    return {
      Undo2,
      CheckCheck,
      RefreshCw,
      BadgeCheck,
      FileSpreadsheet,
      sortBy: "",
      sortDirection: "asc",
      showVerification: false,
      showAttendancePopup: false,
      confirmDialog: false,
      userRole: null,
      userId: null,
      tenantId: null,
      tenantName: "",
      tenantAddress: "",
      companyLogo: "",
      page: 1,
      error: null,
      itemsPerPage: 25,
      totalItems: 0,
      selectedEmployee: null,
      tableOptions: {},
      selected: [],
      search: "",
      searchTimeout: null,
      token: authService.getToken(),
      showForm: false,
      isEditing: false,
      editedItem: null,
      items: [],
      payrollCounts: {
        paid: 0,
        unpaid: 0,
        finalized: 0,
        unfinalized: 0,
      },

      loading: false,
      showFilters: true,
      downloadingPayslips: false,
      selectedStatus: "all",
      attendanceData: {},
      salaryData: {},
      showDownloadProgress: false,
      downloadProgress: 0,
      downloadTitle: "Downloading Salary Sheet",
      downloadFileName: "salary-sheet.xlsx",
      downloadFileSize: 2048000,
      downloadCancelToken: null,
      showPayslipPreview: false,
      currentPayslipData: null,
      generatingPdf: false,
      cycleStartDate: null,
      cycleEndDate: null,
      cycleDays: 0,
      attendanceDetails: {},
      showPaidConfirmation: false,
      showNoUsersToMarkPaid: false,
      showPaidUsersWarning: false,
      markingAsPaidInProgress: false,
      finalizedUnpaidUsers: [],
      paidUsersCount: 0,
      processingUnfinalized: false,
      unfinalizedUsers: [],
      showUnfinalizedDialog: false,
      batchSize: 100,
      currentBatch: 0,
      totalBatches: 0,
      processingBatch: false,
      showPaidUserSelectedDialog: false,
      showMixedPaidUsersDialog: false,
      unpaidUsersCount: 0,
      verificationFilters: {
        attendance: null,
        salary: null,
        salaryPaid: null,
      },
      activeFilters: {
        branch: null,
        department: null,
        activity: [],
        cycleType: null,
      },
      dateRange: {
        start: null,
        end: null,
      },
      selectedMonth: currentDate.getMonth(), // 0-based (0 = January, 11 = December)
      selectedYear: currentDate.getFullYear(),
      multiAttendanceCycles: [],
      cycleTypeOptions: [],
      pageFilters: [
        { key: "monthYear", label: "Month & Year", type: "month", show: true },

        { key: "branch", label: "Branch", type: "select", show: true },
        { key: "department", label: "Department", type: "select", show: true },
        {
          key: "attendanceCycle",
          label: "Attendance Cycle",
          type: "select",
          show: true,
        },
      ],
    };
  },

  computed: {
    initialFilters() {
      return {
        branch: this.activeFilters.branch,
        department: this.activeFilters.department,
        activity: this.activeFilters.activity,
        attendanceCycle: this.activeFilters.cycleType?.toString(),
        monthYear: `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, "0")}`, // Format as YYYY-MM
      };
    },
    headers() {
      return [
        { title: "EmpId", key: "employee.employeeId", width: "150px" },
        {
          title: "Name",
          key: "employee.assignedUser.first_name",
          width: "150px",
        },
        {
          title: "Role",
          key: "employee.assignedUser.role.name",
          width: "150px",
        },

        {
          title: "Designation",
          key: "employee.assignedUser.designation",
          width: "150px",
        },
        // { title: "Activity", key: "activity", width: "120px" },
        // { title: "Joining Date", key: "joiningDate", width: "120px" },
        // { title: "Leaving Date", key: "leavingDate", width: "120px" },
        {
          title: "Attendance Verification",
          key: "attendanceVerification",
          width: "180px",
        },
        {
          title: "Salary Verification",
          key: "salaryVerification",
          width: "180px",
        },
        { title: "Monthly CTC", key: "monthlyCTC", width: "120px" },
        { title: "Payable Days", key: "payableDays", width: "120px" },
        { title: "Salary Status", key: "salaryPaid", width: "120px" },
        { title: "Start Date", key: "startDate", width: "120px" },
        { title: "End Date", key: "endDate", width: "120px" },
      ];
    },
    columns() {
      return this.headers.map((header) => ({
        key: header.key,
        label: header.title,
        width: header.width,
        sortable: true,
      }));
    },
    selectedIds() {
      return this.selected.map((item) => item.id || item);
    },
    hasDownloadableSelected() {
      if (!this.selected || this.selected.length === 0) return false;
      const selectedItems = this.items.filter((item) =>
        this.selected.some((selectedItem) => {
          const selectedId = selectedItem.id || selectedItem;
          return selectedId === item.id;
        }),
      );
      return selectedItems.some(
        (item) => item.attendanceVerified && item.salaryVerified,
      );
    },
    hasFinalizedUnpaidUsers() {
      return this.items.some(
        (item) => item.salaryVerified && item.salaryPaid !== "paid",
      );
    },
    hasPaidUsersSelected() {
      if (!this.selected || this.selected.length === 0) return false;
      const selectedItems = this.items.filter((item) =>
        this.selected.some((selectedItem) => {
          const selectedId = selectedItem.id || selectedItem;
          return selectedId === item.id;
        }),
      );
      return selectedItems.some((item) => item.salaryPaid === "paid");
    },
    paidUsersSelectedCount() {
      if (!this.selected || this.selected.length === 0) return 0;
      const selectedItems = this.items.filter((item) =>
        this.selected.some((selectedItem) => {
          const selectedId = selectedItem.id || selectedItem;
          return selectedId === item.id;
        }),
      );
      return selectedItems.filter((item) => item.salaryPaid === "paid").length;
    },
    successCount() {
      return this.processedCount - this.failedCount;
    },
    // failedCount() {
    //   return this.attendanceStatus.filter((r) => r.status === "failed").length;
    // },
    // remainingCount() {
    //   return this.totalCount
    //     ? this.totalCount - this.attendanceStatus.length
    //     : 0;
    // },
    // failedRecords() {
    //   return this.attendanceStatus.filter((r) => r.status === "failed");
    // },
    // progressPercentage() {
    //   if (!this.totalCount || this.totalCount === 0) return 0;
    //   return (this.attendanceStatus.length / this.totalCount) * 100;
    // },
    hasActiveFilters() {
      return (
        this.activeFilters.branch !== null ||
        this.activeFilters.department !== null ||
        this.activeFilters.activity.length > 0 ||
        this.activeFilters.cycleType !== null ||
        (this.dateRange.start && this.dateRange.end) ||
        this.verificationFilters.attendance !== null ||
        this.verificationFilters.salary !== null ||
        this.verificationFilters.salaryPaid !== null
      );
    },
  },

  watch: {
    selected: {
      handler(newVal, oldVal) {
        console.log("Selected changed:", {
          newCount: newVal.length,
          oldCount: oldVal?.length || 0,
          newItems: newVal.map((item) => item.id || item),
          oldItems: oldVal?.map((item) => item.id || item) || [],
        });
      },
      deep: true,
      immediate: true,
    },
    selectedStatus(newStatus) {
      this.page = 1;
      this.fetchItems();
    },
    verificationFilters: {
      handler() {
        this.handleFilterChange();
      },
      deep: true,
    },
    selectedMonth(newMonth) {
      this.handleMonthChange();
    },
    selectedYear() {
      this.handleMonthChange();
    },
  },

  methods: {
    async fetchItems() {
      this.userRole = currentUserTenant.getRole();
      this.userId = currentUserTenant.getUserId();
      this.loading = true;
      this.clearSelections();

      const fields = [
        "id",
        "employee.id",
        "employee.employeeId",
        "employee.assignedUser.first_name",
        "employee.assignedUser.role.name",
        "employee.approver.id",
        "employee.assignedUser.dateOfJoining",
        "employee.assignedUser.dateOfLeaving",
        "employee.config.configName",
        "employee.assignedUser.pan",
        "employee.assignedUser.UAN",
        "employee.assignedUser.PFAccountNumber",
        "employee.assignedUser.ESIAccountNumber",
        "employee.assignedUser.designation",
        "employee.branch.branchName",
        "employee.department.departmentName",
        "tenant.tenantName",
        "tenant.logo",
        "tenant.companyAddress",
        "status",
        "ctc",
        "employee.cycleType",
        "salaryTracking",
      ];

      try {
        const url = new URL(
          `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown`,
        );

        if (
          this.verificationFilters.attendance !== null ||
          this.verificationFilters.salary !== null
        ) {
          url.searchParams.append("limit", "-1");
        } else {
          url.searchParams.append("limit", this.itemsPerPage.toString());
          url.searchParams.append("page", this.page.toString());
        }

        url.searchParams.append(
          "filter[_and][0][_and][0][employee][assignedUser][tenant][tenantId][_eq]",
          this.tenantId,
        );

        if (this.userRole === "Manager") {
          url.searchParams.append(
            "filter[_and][1][_or][0][employee][approver][id][_eq]",
            this.userId,
          );
          url.searchParams.append(
            "filter[_and][1][_or][1][employee][assignedUser][id][_eq]",
            this.userId,
          );
        }

        if (this.search && this.search.trim() !== "") {
          url.searchParams.append(
            "filter[_and][0][_and][0][employee][assignedUser][first_name][_icontains]",
            this.search.trim(),
          );
        }

        if (this.activeFilters.branch) {
          url.searchParams.append(
            "filter[_and][0][_and][0][employee][branch][id][_eq]",
            this.activeFilters.branch,
          );
        }

        if (this.activeFilters.department) {
          url.searchParams.append(
            "filter[_and][0][_and][0][employee][department][id][_eq]",
            this.activeFilters.department,
          );
        }

        if (this.activeFilters.cycleType) {
          url.searchParams.append(
            "filter[_and][0][_and][0][employee][cycleType][_eq]",
            this.activeFilters.cycleType.toString(),
          );
        }

        if (this.dateRange.start && this.dateRange.end) {
          url.searchParams.append(
            "filter[_and][0][_and][2][_or][0][employee][assignedUser][dateOfJoining][_lte]",
            this.dateRange.end,
          );
          url.searchParams.append(
            "filter[_and][0][_and][2][_or][1][employee][assignedUser][dateOfJoining][_null]",
            true,
          );
          url.searchParams.append(
            "filter[_and][0][_and][3][_or][0][employee][assignedUser][dateOfLeaving][_gte]",
            this.dateRange.start,
          );
          url.searchParams.append(
            "filter[_and][0][_and][3][_or][1][employee][assignedUser][dateOfLeaving][_null]",
            true,
          );
        }

        fields.forEach((field) => {
          url.searchParams.append("fields[]", field);
        });

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
          this.items = [];
          this.loading = false;
          return;
        }

        const employeeIds = data.data.map((item) => item.employee.id);

        const verificationMap = await this.checkVerificationStatus(employeeIds);

        const processedItems = data.data.map((item) => {
          const employeeId = item.employee.id;
          const verificationStatus = verificationMap[employeeId] || {
            attendanceVerified: false,
            salaryVerified: false,
            ctc: "-",
            payableDays: "-",
            startDate: null,
            endDate: null,
            salaryPaid: "unPaid",
          };

          const joiningDate = item.employee.assignedUser.dateOfJoining;
          const leavingDate = item.employee.assignedUser.dateOfLeaving;
          const activity = this.calculateActivityStatus(
            joiningDate,
            leavingDate,
            this.dateRange.start,
            this.dateRange.end,
          );

          if (
            this.activeFilters.activity.length > 0 &&
            !this.activeFilters.activity.includes(activity)
          ) {
            return null;
          }

          const matchesAttendanceFilter =
            this.verificationFilters.attendance === null ||
            verificationStatus.attendanceVerified ===
              this.verificationFilters.attendance;
          const matchesSalaryFilter =
            this.verificationFilters.salary === null ||
            verificationStatus.salaryVerified ===
              this.verificationFilters.salary;
          const matchesSalaryPaidFilter =
            this.verificationFilters.salaryPaid === null ||
            verificationStatus.salaryPaid ===
              this.verificationFilters.salaryPaid;

          if (
            matchesAttendanceFilter &&
            matchesSalaryFilter &&
            matchesSalaryPaidFilter
          ) {
            return {
              ...item,
              attendanceVerified: verificationStatus.attendanceVerified,
              salaryVerified: verificationStatus.salaryVerified,
              ctc: verificationStatus.ctc,
              payableDays: verificationStatus.payableDays,
              monthlyCTC: (() => {
                if (!item.salaryTracking) return "-";
                const endDate = this.dateRange.end;
                if (!endDate) return "-";

                const monthYear = new Date(endDate)
                  .toLocaleDateString("en-GB", {
                    month: "2-digit",
                    year: "numeric",
                  })
                  .replace("/", "/");

                const trackingKeys = Object.keys(item.salaryTracking);
                if (trackingKeys.length === 0) return "-";

                if (item.salaryTracking[monthYear]) {
                  return item.salaryTracking[monthYear];
                }

                const sortedKeys = trackingKeys
                  .map((k) => {
                    const [m, y] = k.split("/").map(Number);
                    return { key: k, date: new Date(y, m - 1) };
                  })
                  .sort((a, b) => a.date - b.date);

                const end = new Date(endDate);
                let fallback = "-";
                for (const entry of sortedKeys) {
                  if (entry.date <= end) {
                    fallback = item.salaryTracking[entry.key];
                  }
                }
                return fallback;
              })(),
              downloadablePdf: verificationStatus.downloadablePdf,
              startDate: verificationStatus.startDate,
              endDate: verificationStatus.endDate,
              salaryPaid: verificationStatus.salaryPaid,
              joiningDate: joiningDate,
              leavingDate: leavingDate,
              activity: activity,
            };
          }

          return null;
        });

        let filteredItems = processedItems.filter((item) => item !== null);

        if (
          this.verificationFilters.attendance !== null ||
          this.verificationFilters.salary !== null
        ) {
          const startIndex = (this.page - 1) * this.itemsPerPage;
          const endIndex = startIndex + this.itemsPerPage;
          this.totalItems = filteredItems.length;
          filteredItems = filteredItems.slice(startIndex, endIndex);
        }

        this.items = filteredItems;

        this.selected = this.selected.filter((selectedItem) => {
          const selectedId = selectedItem.id || selectedItem;
          return this.items.some((item) => item.id === selectedId);
        });
      } catch (error) {
        console.error("Error fetching salary breakdown:", error);
        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    async aggregateCount() {
      const token = authService.getToken();
      try {
        if (!token || !this.tenantId) {
          throw new Error("Authentication required or tenant not found");
        }

        const url = new URL(
          `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown`,
        );

        url.searchParams.append("aggregate[count]", "id");
        url.searchParams.append("fields[]", "employee.id");

        url.searchParams.append(
          "filter[_and][0][_and][0][employee][assignedUser][tenant][tenantId][_eq]",
          this.tenantId,
        );

        if (this.activeFilters.cycleType) {
          url.searchParams.append(
            "filter[_and][0][_and][0][employee][cycleType][_eq]",
            this.activeFilters.cycleType.toString(),
          );
        }

        url.searchParams.append(
          "filter[_and][0][_and][0][employee][status][_neq]",
          "archived",
        );

        if (this.search && this.search.trim() !== "") {
          url.searchParams.append(
            "filter[_and][0][_and][0][employee][assignedUser][first_name][_icontains]",
            this.search.trim(),
          );
        }

        if (this.activeFilters.branch) {
          url.searchParams.append(
            "filter[_and][0][_and][0][employee][branch][id][_eq]",
            this.activeFilters.branch,
          );
        }

        if (this.activeFilters.department) {
          url.searchParams.append(
            "filter[_and][0][_and][0][employee][department][id][_eq]",
            this.activeFilters.department,
          );
        }

        if (this.dateRange.start && this.dateRange.end) {
          url.searchParams.append(
            "filter[_and][0][_and][2][_or][0][employee][assignedUser][dateOfJoining][_lte]",
            this.dateRange.end,
          );
          url.searchParams.append(
            "filter[_and][0][_and][2][_or][1][employee][assignedUser][dateOfJoining][_null]",
            true,
          );
          url.searchParams.append(
            "filter[_and][0][_and][3][_or][0][employee][assignedUser][dateOfLeaving][_gte]",
            this.dateRange.start,
          );
          url.searchParams.append(
            "filter[_and][0][_and][3][_or][1][employee][assignedUser][dateOfLeaving][_null]",
            true,
          );
        }

        const countResponse = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!countResponse.ok) {
          throw new Error(`HTTP error! status: ${countResponse.status}`);
        }

        const countData = await countResponse.json();
        let totalCount = countData?.data?.[0]?.count?.id || 0;

        this.totalItems = totalCount;
        await this.PayrollVerificationCount();
      } catch (error) {
        console.error("Error fetching aggregate count:", error);
      }
    },

    async PayrollVerificationCount() {
      const token = authService.getToken();
      try {
        if (!token || !this.tenantId) {
          throw new Error("Authentication required or tenant not found");
        }

        if (!this.dateRange.start || !this.dateRange.end) {
          // Fallback to filters.monthYear
          const [year, month] = this.initialFilters.monthYear
            .split("-")
            .map(Number);
          this.dateRange.start = `${year}-${String(month).padStart(2, "0")}-01`;
          this.dateRange.end = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;
        }

        const query = [
          "aggregate[count]=id",
          "groupBy[]=salaryPaid",
          "groupBy[]=salaryVerification",
          `filter[_and][0][employee][assignedUser][tenant][tenantId][_eq]=${this.tenantId}`,
          `filter[_and][1][startDate][_eq]=${this.dateRange.start}`,
          `filter[_and][2][endDate][_eq]=${this.dateRange.end}`,
          `filter[_and][3][employee][cycleType][_eq]=${this.activeFilters.cycleType || 1}`,
          "filter[_and][4][status][_neq]=archived",
          "limit=-1",
        ].join("&");

        const fullUrl = `${import.meta.env.VITE_API_URL}/items/payrollVerification?${query}`;

        const response = await fetch(fullUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const counts = {
          paid: 0,
          unpaid: 0,
          finalized: 0,
          unfinalized: 0,
        };

        (data?.data || []).forEach((row) => {
          if (row.salaryPaid === "paid") counts.paid = row.count.id;
          if (row.salaryVerification === true) counts.finalized = row.count.id;
        });

        counts.unpaid = this.totalItems - counts.paid;
        counts.unfinalized = this.totalItems - counts.finalized;
        this.payrollCounts = counts;
      } catch (error) {
        console.error("Error fetching payroll verification counts:", error);
      }
    },

    async calculateAttendanceCycleDates(month, year) {
      try {
        const tenantID = this.tenantId;
        const token = this.token;

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[_and][0][tenant][tenantId][_eq]=${tenantID}`,
          {
            params: {
              fields: [
                "id",
                "status",
                "startDate",
                "endDate",
                "fixedCycle",
                "includeWeekoffs",
                "includeHolidays",
                "startMonth",
                "endMonth",
              ],
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const attendanceCycle = response.data?.data[0] ?? {};

        let cycleStartDate, cycleEndDate;

        if (attendanceCycle.fixedCycle) {
          const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
          const endDate = new Date(year, month, 0);
          const endDateFormatted = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

          this.dateRange.start = startDate;
          this.dateRange.end = endDateFormatted;
        } else {
          const attendanceMonth = month === 1 ? 12 : month - 1;
          const attendanceYear = month === 1 ? year - 1 : year;

          const startDateMonth =
            attendanceMonth === 1 ? 12 : attendanceMonth - 1;
          const startDateYear =
            attendanceMonth === 1 ? attendanceYear - 1 : attendanceYear;

          const cycleStartDay = parseInt(attendanceCycle.startDate) || 21;
          const cycleEndDay = parseInt(attendanceCycle.endDate) || 20;

          cycleStartDate = `${startDateYear}-${String(startDateMonth + 1).padStart(2, "0")}-${String(cycleStartDay).padStart(2, "0")}`;
          cycleEndDate = `${attendanceYear}-${String(attendanceMonth + 1).padStart(2, "0")}-${String(cycleEndDay).padStart(2, "0")}`;

          this.dateRange.start = cycleStartDate;
          this.dateRange.end = cycleEndDate;
        }

        const startDate = new Date(this.dateRange.start);
        const endDate = new Date(this.dateRange.end);
        const diffTime = Math.abs(endDate - startDate);
        this.cycleDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return {
          cycleStartDate: this.dateRange.start,
          cycleEndDate: this.dateRange.end,
          cycleDays: this.cycleDays,
          includeWeekoffs: attendanceCycle.includeWeekoffs || false,
          includeHolidays: attendanceCycle.includeHolidays || false,
        };
      } catch (error) {
        console.error("Error calculating attendance cycle dates:", error);
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = new Date(year, month, 0);
        const endDateFormatted = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

        this.dateRange.start = startDate;
        this.dateRange.end = endDateFormatted;
        console.warn("Using fallback dates:", { startDate, endDateFormatted });

        return {
          cycleStartDate: this.dateRange.start,
          cycleEndDate: this.dateRange.end,
          cycleDays: 0,
          includeWeekoffs: false,
          includeHolidays: false,
        };
      }
    },

    async handleApplyFilters(filters) {
      if (filters.monthYear) {
        const [year, month] = filters.monthYear.split("-").map(Number);
        this.selectedYear = year;
        this.selectedMonth = month - 1;
      } else {
        const currentDate = new Date();
        this.selectedYear = currentDate.getFullYear();
        this.selectedMonth = currentDate.getMonth();
      }

      this.activeFilters = {
        branch: filters.branch || null,
        department: filters.department || null,
        activity: Array.isArray(filters.activity)
          ? filters.activity
          : filters.activity
            ? [filters.activity]
            : [],
        cycleType: filters.attendanceCycle
          ? parseInt(filters.attendanceCycle)
          : null,
      };

      if (filters.cycleStartDate && filters.cycleEndDate) {
        this.dateRange.start = filters.cycleStartDate;
        this.dateRange.end = filters.cycleEndDate;
      } else {
        await this.calculateAttendanceCycleDates(
          this.selectedMonth + 1,
          this.selectedYear,
        );
      }

      this.page = 1;
      await this.aggregateCount();
      await this.fetchItems();
      await this.PayrollVerificationCount();
    },
    async openAttendancePopup() {
      this.showAttendancePopup = true;
      this.cancelProcessing = false;
      this.attendanceStatus = [];
    },
    cancel() {
      this.cancelProcessing = true;
      alert("Attendance processing has been stopped.");
    },
    close() {
      this.cancelProcessing = true;
      this.showAttendancePopup = false;
    },
    async recalculateAttendance() {
      if (!this.selected || this.selected.length === 0) {
        this.$emit("show-snackbar", {
          message: "Please select at least one employee",
          color: "warning",
        });
        return;
      }

      this.showAttendancePopup = true;

      this.processedCount = 0;
      this.failedCount = 0;

      try {
        this.isProcessing = true;
        const batchSize = 100;
        const employeeIds = this.selected.map((emp) => emp.employee.id);
        this.totalCount = employeeIds.length;

        for (let i = 0; i < employeeIds.length; i += batchSize) {
          if (this.cancelProcessing) {
            break;
          }

          const batchIds = employeeIds.slice(i, i + batchSize);

          const payload = {
            tenantId: this.tenantId,
            startDate: this.dateRange.start,
            endDate: this.dateRange.end,
            employeeIds: batchIds,
          };

          try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/reCalulate-Attendance/re-attendance`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${this.token}`,
                  "Content-Type": "application/json",
                },
              },
            );

            this.processedCount += batchIds.length;
          } catch (error) {
            console.error("Batch processing error:", error);
            this.failedCount += batchIds.length;
            this.processedCount += batchIds.length;
            this.$emit("show-snackbar", {
              message: `Error processing batch: ${error.message}`,
              color: "error",
            });
          }
        }

        if (!this.cancelProcessing) {
          this.isProcessing = false;
          // Success message is now shown in the popup
        }
      } catch (error) {
        console.error("Error processing attendance:", error);
        this.$emit("show-snackbar", {
          message: `Error processing attendance: ${error.message}`,
          color: "error",
        });
      } finally {
        this.showAttendancePopup = false;
        this.isProcessing = false;
      }
    },

    async confirmDeleteExisting() {
      this.confirmDialog = false;
      try {
        const idsToDelete = this.attendanceRecords.map((rec) => rec.id); // delete ALL fetched records
        if (idsToDelete.length > 0) {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/items/attendance`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(idsToDelete), // send raw array
            },
          );

          if (!response.ok) {
            throw new Error(
              `Failed to delete attendance: ${response.statusText}`,
            );
          }

          // Clear local state
          this.attendanceRecords = [];
          this.existingEmployees = [];

          alert("Attendance records deleted successfully.");
        } else {
          alert("No attendance records selected to delete.");
        }
      } catch (error) {
        console.error("Error deleting attendance records:", error);
        alert("Error deleting attendance records. Please try again.");
      }
    },

    isItemSelected(item) {
      const itemId = item.id || item;
      return this.selected.some((selectedItem) => {
        const selectedId = selectedItem.id || selectedItem;
        return selectedId === itemId;
      });
    },

    // New method to handle checkbox changes
    handleCheckboxChange(item, isChecked) {
      if (isChecked) {
        // Add item if not already selected
        if (!this.isItemSelected(item)) {
          this.selected.push(item);
        }
      } else {
        // Remove item if selected
        const itemId = item.id || item;
        this.selected = this.selected.filter((selectedItem) => {
          const selectedId = selectedItem.id || selectedItem;
          return selectedId !== itemId;
        });
      }

      // Force reactivity update
      this.$forceUpdate();
    },

    // Clear selections when filters change
    clearSelections() {
      this.selected = [];
    },

    // New method to determine if an item can be selected
    isItemSelectable(item) {
      // If user joined this month and we're generating previous month cycle, disable
      if (item.activity === "New Joining") {
        return false;
      }

      // If user left this month and we're generating next month cycle, disable
      if (item.activity === "left") {
        return false;
      }

      return true;
    },

    // New method to get row props for styling
    getRowProps(item) {
      return {
        class: !this.isItemSelectable(item.item) ? "disabled-row" : "",
      };
    },

    // New method to get activity color
    getActivityColor(activity) {
      switch (activity) {
        case "New Joining":
          return "success";
        case "left":
          return "error";
        case "Active":
          return "primary";
        default:
          return "grey";
      }
    },

    // New method to calculate activity status
    calculateActivityStatus(
      joiningDate,
      leavingDate,
      cycleStartDate,
      cycleEndDate,
    ) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const cycleStart = new Date(cycleStartDate);
      const cycleEnd = new Date(cycleEndDate);

      // Check if user joined this month
      if (joiningDate) {
        const joinDate = new Date(joiningDate);
        const joinMonth = joinDate.getMonth();
        const joinYear = joinDate.getFullYear();

        // If user joined in current month and cycle is for previous month
        if (
          joinMonth === currentMonth &&
          joinYear === currentYear &&
          cycleEnd < new Date(currentYear, currentMonth, 1)
        ) {
          return "New Joining";
        }
      }

      // Check if user left this month
      if (leavingDate) {
        const leftate = new Date(leavingDate);
        const leaveMonth = leftate.getMonth();
        const leaveYear = leftate.getFullYear();

        // If user left in current month and cycle is for next month
        if (
          leaveMonth === currentMonth &&
          leaveYear === currentYear &&
          cycleStart > new Date(currentYear, currentMonth + 1, 0)
        ) {
          return "left";
        }

        // If user already left before the cycle
        if (leftate < cycleStart) {
          return "left";
        }
      }

      return "Active";
    },

    async markAsUnpaid() {
      if (!this.selected || this.selected.length === 0) {
        this.$emit("show-snackbar", {
          message: "Please select at least one employee",
          color: "warning",
        });
        return;
      }

      try {
        const selectedItems = this.items.filter((item) =>
          this.selected.some((selectedItem) => {
            const selectedId = selectedItem.id || selectedItem;
            return selectedId === item.id;
          }),
        );

        const employeeIds = selectedItems.map((item) => item.employee.id);

        // Fetch payroll verification IDs for selected employees
        const payrollIds = await this.fetchPayrollVerificationIds(employeeIds);

        if (payrollIds.length === 0) {
          this.$emit("show-snackbar", {
            message: "No payroll records found for selected employees",
            color: "warning",
          });
          return;
        }

        // Prepare payload to mark as unpaid
        const payload = payrollIds.map((payroll) => ({
          id: payroll.id,
          salaryPaid: "unPaid",
        }));

        // Send PATCH request to update salary status
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          },
        );

        // Update local items
        selectedItems.forEach((item) => {
          const index = this.items.findIndex(
            (localItem) => localItem.id === item.id,
          );
          if (index !== -1) {
            this.items[index].salaryPaid = "unPaid";
          }
        });

        this.$emit("show-snackbar", {
          message: `Successfully marked ${selectedItems.length} users as unpaid`,
          color: "success",
        });
      } catch (error) {
        console.error("Error marking users as unpaid:", error);
        this.$emit("show-snackbar", {
          message: `Error marking users as unpaid: ${error.message}`,
          color: "error",
        });
      }
    },

    async selectUnfinalizedUsers() {
      this.processingUnfinalized = true;
      try {
        if (this.selected && this.selected.length > 0) {
          const selectedItems = this.items.filter((item) =>
            this.selected.some((selectedItem) => {
              const selectedId = selectedItem.id || selectedItem;
              return selectedId === item.id;
            }),
          );

          if (selectedItems.length === 0) {
            this.$emit("show-snackbar", {
              message: "No valid users selected for unfinalization",
              color: "warning",
            });
            return;
          }

          const selectedEmployeeIds = selectedItems.map(
            (item) => item.employee.id,
          );

          const url = new URL(
            `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
          );

          url.searchParams.append("limit", "-1");
          url.searchParams.append(
            "filter[tenant][tenantId][_eq]",
            this.tenantId,
          );
          url.searchParams.append(
            "filter[employee][_in]",
            selectedEmployeeIds.join(","),
          );
          url.searchParams.append(
            "filter[_or][0][salaryVerification][_eq]",
            "true",
          );
          url.searchParams.append(
            "filter[_or][1][attendaceVerification][_eq]",
            "true",
          );

          url.searchParams.append("filter[salaryPaid][_neq]", "paid");

          if (this.dateRange.start && this.dateRange.end) {
            url.searchParams.append(
              "filter[startDate][_gte]",
              this.dateRange.start,
            );
            url.searchParams.append(
              "filter[endDate][_lte]",
              this.dateRange.end,
            );
          }

          url.searchParams.append("fields[]", "id");
          url.searchParams.append("fields[]", "employee");
          url.searchParams.append("fields[]", "salaryPaid");
          url.searchParams.append("fields[]", "leavededuction");
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (!data.data || data.data.length === 0) {
            this.$emit("show-snackbar", {
              message:
                "No finalized unpaid payroll records found for selected users",
              color: "info",
            });
            return;
          }

          this.unfinalizedUsers = data.data;
        } else {
          const url = new URL(
            `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
          );

          url.searchParams.append("limit", "-1");
          url.searchParams.append(
            "filter[tenant][tenantId][_eq]",
            this.tenantId,
          );
          url.searchParams.append(
            "filter[_or][0][salaryVerification][_eq]",
            "true",
          );
          url.searchParams.append(
            "filter[_or][1][attendaceVerification][_eq]",
            "true",
          );

          url.searchParams.append("filter[salaryPaid][_neq]", "paid");

          if (this.dateRange.start && this.dateRange.end) {
            url.searchParams.append(
              "filter[startDate][_gte]",
              this.dateRange.start,
            );
            url.searchParams.append(
              "filter[endDate][_lte]",
              this.dateRange.end,
            );
          }

          url.searchParams.append("fields[]", "id");
          url.searchParams.append("fields[]", "employee");
          url.searchParams.append("fields[]", "salaryPaid");
          url.searchParams.append("fields[]", "leavededuction");
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (!data.data || data.data.length === 0) {
            this.$emit("show-snackbar", {
              message:
                "No finalized unpaid users found for the selected period",
              color: "info",
            });
            return;
          }

          this.unfinalizedUsers = data.data;
        }

        this.totalBatches = Math.ceil(
          this.unfinalizedUsers.length / this.batchSize,
        );
        this.currentBatch = 0;

        this.showUnfinalizedDialog = true;
      } catch (error) {
        console.error("Error fetching finalized users:", error);
        this.$emit("show-snackbar", {
          message: `Error fetching finalized users: ${error.message}`,
          color: "error",
        });
      } finally {
        this.processingUnfinalized = false;
      }
    },
    async adjustLeavesFromUnfinalizedUsers() {
      if (!this.unfinalizedUsers || this.unfinalizedUsers.length === 0) {
        this.$emit("show-snackbar", {
          message: "No unfinalized users to adjust leave for",
          color: "warning",
        });
        return;
      }

      try {
        const employeeIds = this.unfinalizedUsers.map((u) => u.employee);

        // Fetch leave records
        const url = new URL(`${import.meta.env.VITE_API_URL}/items/leave`);
        url.searchParams.append("limit", "-1");
        url.searchParams.append(
          "filter[assignedTo][_in]",
          employeeIds.join(","),
        );
        url.searchParams.append("fields[]", "id");
        url.searchParams.append("fields[]", "assignedTo");
        url.searchParams.append("fields[]", "leaveTaken");
        url.searchParams.append("fields[]", "leaveBalance");

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
          this.$emit("show-snackbar", {
            message: "No leave records found for unfinalized users",
            color: "info",
          });
          return;
        }

        // Loop through unfinalized users
        for (const user of this.unfinalizedUsers) {
          const leaveRecord = data.data.find(
            (record) => record.assignedTo === user.employee,
          );

          if (!leaveRecord) {
            continue;
          }

          if (!user.leavededuction) {
            continue;
          }

          for (const leaveType in user.leavededuction) {
            const leaveTakenKey = "t" + leaveType.toLowerCase(); // leaveTaken key with 't' prefix
            const leaveBalanceKey = leaveType.toLowerCase(); // leaveBalance key as-is
            const deductionValue = user.leavededuction[leaveType];

            if (
              leaveRecord.leaveTaken?.[leaveTakenKey] !== undefined &&
              leaveRecord.leaveBalance?.[leaveBalanceKey] !== undefined
            ) {
              leaveRecord.leaveTaken[leaveTakenKey] -= deductionValue;
              leaveRecord.leaveBalance[leaveBalanceKey] += deductionValue;

              // PATCH updated leave record
              const patchUrl = `${import.meta.env.VITE_API_URL}/items/leave/${leaveRecord.id}`;
              const patchResponse = await fetch(patchUrl, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${this.token}`,
                },
                body: JSON.stringify({
                  leaveTaken: leaveRecord.leaveTaken,
                  leaveBalance: leaveRecord.leaveBalance,
                }),
              });

              if (!patchResponse.ok) {
                console.error(`Failed to update leave ID ${leaveRecord.id}`);
              } else {
              }
            } else {
            }
          }
        }

        this.$emit("show-snackbar", {
          message: "Leave balances updated for unfinalized users",
          color: "success",
        });
      } catch (error) {
        console.error("Error adjusting leaves:", error);
        this.$emit("show-snackbar", {
          message: `Error adjusting leaves: ${error.message}`,
          color: "error",
        });
      }
    },

    async processUnfinalizedBatch() {
      if (this.currentBatch >= this.totalBatches) {
        this.$emit("show-snackbar", {
          message: "All batches processed successfully",
          color: "success",
        });
        this.showUnfinalizedDialog = false;
        return;
      }

      this.processingBatch = true;
      await this.adjustLeavesFromUnfinalizedUsers();
      try {
        const startIndex = this.currentBatch * this.batchSize;
        const endIndex = Math.min(
          startIndex + this.batchSize,
          this.unfinalizedUsers.length,
        );
        const currentBatchUsers = this.unfinalizedUsers.slice(
          startIndex,
          endIndex,
        );

        const payload = currentBatchUsers.map((user) => {
          return {
            id: user.id,
            salaryVerification: false,
            attendaceVerification: false,
            leavededuction: {},
          };
        });

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.currentBatch++;

        this.$emit("show-snackbar", {
          message: `Processed batch ${this.currentBatch} of ${this.totalBatches}`,
          color: "success",
        });

        if (this.currentBatch < this.totalBatches) {
          await this.processUnfinalizedBatch();
        } else {
          this.showUnfinalizedDialog = false;
          this.fetchItems();
        }
      } catch (error) {
        console.error("Error processing batch:", error);
        this.$emit("show-snackbar", {
          message: `Error processing batch: ${error.message}`,
          color: "error",
        });
      } finally {
        this.processingBatch = false;
      }
    },

    cancelUnfinalizedProcess() {
      this.showUnfinalizedDialog = false;
      this.unfinalizedUsers = [];
      this.currentBatch = 0;
      this.totalBatches = 0;
    },

    async markAsPaid() {
      this.finalizedUnpaidUsers = this.items.filter(
        (item) => item.salaryVerified && item.salaryPaid !== "paid",
      );

      if (this.finalizedUnpaidUsers.length === 0) {
        this.showNoUsersToMarkPaid = true;
        return;
      }

      try {
        const payrollIds = await this.fetchPayrollVerificationIds(
          this.finalizedUnpaidUsers.map((item) => item.employee.id),
        );

        if (payrollIds.length === 0) {
          this.showNoUsersToMarkPaid = true;
          return;
        }

        this.finalizedUnpaidUsers = this.finalizedUnpaidUsers
          .map((user) => ({
            ...user,
            payrollVerificationId: payrollIds.find(
              (p) => p.employee === user.employee.id,
            )?.id,
          }))
          .filter((user) => user.payrollVerificationId);

        this.showPaidConfirmation = true;
      } catch (error) {
        console.error("Error fetching payroll verification IDs:", error);
        this.$emit("show-snackbar", {
          message: "Error verifying payroll records",
          color: "error",
        });
      }
    },

    async fetchPayrollVerificationIds(employeeIds) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
          {
            params: {
              filter: {
                _and: [
                  { employee: { _in: employeeIds } },
                  { startDate: { _eq: this.dateRange.start } },
                  { endDate: { _eq: this.dateRange.end } },
                ],
              },
              fields: ["id", "employee"],
            },
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );
        return response.data.data || [];
      } catch (error) {
        console.error("Error fetching payroll verification IDs:", error);
        return [];
      }
    },

    async confirmMarkAsPaid() {
      this.markingAsPaidInProgress = true;

      try {
        const payload = this.finalizedUnpaidUsers
          .filter((user) => user.payrollVerificationId)
          .map((user) => ({
            id: user.payrollVerificationId,
            salaryPaid: "paid",
            paidDate: new Date().toISOString().split("T")[0], // Add today's date in YYYY-MM-DD format
          }));

        if (payload.length === 0) {
          throw new Error("No valid payroll records found to mark as paid");
        }

        await axios.patch(
          `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          },
        );

        this.finalizedUnpaidUsers.forEach((user) => {
          const index = this.items.findIndex((item) => item.id === user.id);
          if (index !== -1) {
            this.items[index].salaryPaid = "paid";
          }
        });

        this.$emit("show-snackbar", {
          message: `Successfully marked ${this.finalizedUnpaidUsers.length} users as paid`,
          color: "success",
        });

        this.showPaidConfirmation = false;
      } catch (error) {
        console.error("Error marking users as paid:", error);
        this.$emit("show-snackbar", {
          message: `Error marking users as paid: ${error.message}`,
          color: "error",
        });
      } finally {
        this.markingAsPaidInProgress = false;
      }
    },

    finalizeMultiplePayroll() {
      if (!this.selected || this.selected.length === 0) {
        this.$emit("show-snackbar", {
          message: "Please select at least one employee",
          color: "warning",
        });
        return;
      }

      const selectedItems = this.items.filter((item) =>
        this.selected.some((selectedItem) => {
          const selectedId = selectedItem.id || selectedItem;
          return selectedId === item.id;
        }),
      );

      const verifiedUsers = this.selected.filter(
        (item) => item.attendanceVerified === true,
      );

      if (verifiedUsers.length > 0) {
        this.selectUnfinalizedUsers();
        return;
      }

      // const verifiedUsers = selectedItems.filter(
      //   (item) => item.salaryVerified === true,
      // );

      // if (verifiedUsers.length > 0) {
      //   this.$emit("show-snackbar", {
      //     message:
      //       "Some selected employees are already verified. Please unselect them to proceed.",
      //     color: "error",
      //   });
      //   alert(
      //     "Some selected employees are already verified. Please unselect them to proceed.",
      //   );
      //   return;
      // }

      const paidUsers = selectedItems.filter(
        (item) => item.salaryPaid === "paid",
      );

      if (paidUsers.length > 0) {
        if (selectedItems.length === 1 && paidUsers.length === 1) {
          this.showPaidUserSelectedDialog = true;
          return;
        }

        if (selectedItems.length > 1 && paidUsers.length > 0) {
          this.paidUsersCount = paidUsers.length;
          this.unpaidUsersCount = selectedItems.length - paidUsers.length;

          if (this.unpaidUsersCount > 0) {
            this.showMixedPaidUsersDialog = true;
          } else {
            this.showPaidUsersWarning = true;
          }
          return;
        }
      }

      localStorage.setItem("selectedEmployees", JSON.stringify(selectedItems));

      localStorage.setItem(
        "attendanceDateRange",
        JSON.stringify({
          startDate: this.dateRange.start,
          endDate: this.dateRange.end,
          selectedMonth: this.selectedMonth,
          fixedCycle: this.fixedCycle,
          tenantId: this.tenantId,
        }),
      );

      this.$router.push({
        name: "attendance-verification",
      });
    },

    skipPaidUsers() {
      const selectedItems = this.items.filter((item) =>
        this.selected.some((selectedItem) => {
          const selectedId = selectedItem.id || selectedItem;
          return selectedId === item.id;
        }),
      );

      const unpaidUsers = selectedItems.filter(
        (item) => item.salaryPaid !== "paid",
      );

      if (unpaidUsers.length === 0) {
        this.$emit("show-snackbar", {
          message:
            "No unpaid users to process. Please select at least one unpaid user.",
          color: "warning",
        });
        this.showPaidUserSelectedDialog = false;
        this.showMixedPaidUsersDialog = false;
        return;
      }

      localStorage.setItem("selectedEmployees", JSON.stringify(unpaidUsers));

      localStorage.setItem(
        "attendanceDateRange",
        JSON.stringify({
          startDate: this.dateRange.start,
          endDate: this.dateRange.end,
          selectedMonth: this.selectedMonth,
          fixedCycle: this.fixedCycle,
          tenantId: this.tenantId,
        }),
      );

      this.$emit("show-snackbar", {
        message: `Processing ${unpaidUsers.length} unpaid users. Skipped ${this.paidUsersCount} paid users.`,
        color: "info",
      });

      this.showPaidUserSelectedDialog = false;
      this.showMixedPaidUsersDialog = false;

      this.$router.push({
        name: "attendance-verification",
      });
    },

    handleSelectionChange() {
      if (this.hasPaidUsersSelected) {
        this.$emit("show-snackbar", {
          message: `Warning: ${this.paidUsersSelectedCount} selected users are paid and cannot be unfinalized`,
          color: "warning",
        });
      }
    },

    getCycleNameById(cycleId) {
      const cycle = this.multiAttendanceCycles.find(
        (c) => c.cycleId === cycleId,
      );
      return cycle ? cycle.cycleName : `Cycle ${cycleId}`;
    },

    // Updated computed property for cycle type options with date ranges
    cycleTypeOptionsWithDates() {
      const currentYear = new Date().getFullYear();
      const selectedMonth = this.selectedMonth;

      return this.multiAttendanceCycles.map((cycle) => {
        const startDay = parseInt(cycle.startDate) || 21;
        const endDay = parseInt(cycle.endDate) || 20;

        let startMonth, startYear, endMonth, endYear;

        // Calculate start date (previous month)
        if (selectedMonth === 0) {
          startMonth = 11;
          startYear = currentYear - 1;
        } else {
          startMonth = selectedMonth - 1;
          startYear = currentYear;
        }

        // Calculate end date (selected month)
        endMonth = selectedMonth;
        endYear = currentYear;

        const startDate = `${startYear}-${String(startMonth + 1).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`;
        const endDate = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

        return {
          cycleId: cycle.cycleId,
          cycleName: cycle.cycleName,
          title: `${cycle.cycleName} (${this.formatDateForDisplay(startDate)} - ${this.formatDateForDisplay(endDate)})`,
          value: cycle.cycleId,
          dateRange: {
            start: startDate,
            end: endDate,
          },
        };
      });
    },

    // Add this method to the methods section
    getCycleWithDateRange(cycleId) {
      const cycleWithDate = this.cycleTypeOptionsWithDates.find(
        (c) => c.cycleId === cycleId,
      );
      return cycleWithDate ? cycleWithDate.title : `Cycle ${cycleId}`;
    },

    async fetchCycleTypesData() {
      try {
        this.multiAttendanceCycles = await fetchCycleTypes();
        this.cycleTypeOptions = this.multiAttendanceCycles.map((cycle) => ({
          cycleId: cycle.cycleId,
          cycleName: cycle.cycleName,
        }));
      } catch (error) {
        console.error("Error fetching cycle types:", error);
        this.$emit("show-snackbar", {
          message: "Failed to load cycle types",
          color: "error",
        });
      }
    },

    formatAttendanceData(totalAttendanceCount) {
      if (!totalAttendanceCount) return {};

      try {
        const attendanceData =
          typeof totalAttendanceCount === "string"
            ? JSON.parse(totalAttendanceCount)
            : totalAttendanceCount;

        const { employeeId, ...formattedData } = attendanceData;
        return formattedData;
      } catch (error) {
        console.error("Error formatting attendance data:", error);
        return {};
      }
    },

    getNoDataMessage() {
      // Simple message since you removed the complex logic
      return "No employees match your current filter criteria.";
    },

    formatDateForDisplay(dateString) {
      if (!dateString) return "-";

      try {
        const date = new Date(dateString + "T00:00:00Z");

        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
      }
    },

    clearAttendanceFilter() {
      this.verificationFilters.attendance = null;
      this.applyFilters();
    },

    formatAmount(value) {
      if (!value) return "0";
      // Convert to number and remove decimals for whole number display
      const numValue = parseFloat(value);
      return Math.round(numValue).toLocaleString("en-IN");
    },

    formatPayrollMonth(month, year) {
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    },
    async downloadPayslip(item) {
      if (!item.attendanceVerified || !item.salaryVerified) {
        this.$emit("show-snackbar", {
          message:
            "This employee's payslip is not available for download. Both attendance and salary must be verified and finalized.",
          color: "warning",
        });
        return;
      }

      try {
        this.generatingPdf = true;

        const employeeResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule/${item.employee.id}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );

        if (!employeeResponse.ok) {
          throw new Error(
            `Failed to fetch employee details: ${employeeResponse.statusText}`,
          );
        }

        const employeeData = await employeeResponse.json();

        let verificationUrl = `${import.meta.env.VITE_API_URL}/items/payrollVerification?filter[_and][0][employee][id][_eq]=${item.employee.id}`;

        if (this.dateRange.start && this.dateRange.end) {
          verificationUrl += `&filter[_and][1][startDate][_gte]=${this.dateRange.start}`;
          verificationUrl += `&filter[_and][2][endDate][_lte]=${this.dateRange.end}`;
        }

        const verificationResponse = await fetch(verificationUrl, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (!verificationResponse.ok) {
          throw new Error(
            `Failed to fetch verification details: ${verificationResponse.statusText}`,
          );
        }

        const verificationData = await verificationResponse.json();

        if (!verificationData.data || verificationData.data.length === 0) {
          throw new Error(
            "No payroll verification data found for this employee in the selected date range.",
          );
        }

        const verification = verificationData.data[0];

        const earnings = verification.earnings || {};
        const deductions = verification.deductions || {};
        const benefits = verification.benefits || {};
        const penalties = verification.penalties || {};
        const otherDeduction = verification.otherDeduction || {};

        const currentDate = new Date();
        const month = this.dateRange.end
          ? new Date(this.dateRange.end).getMonth() + 1
          : currentDate.getMonth() + 1;
        const year = this.dateRange.end
          ? new Date(this.dateRange.end).getFullYear()
          : currentDate.getFullYear();
        this.currentPayslipData = {
          employeeName: item.employee.assignedUser.first_name || "Employee",
          employeeId: item.employee.employeeId || "-",
          department: item.employee.department?.departmentName || "-",
          Role: item.employee.assignedUser.role?.name || "-",
          PFNumber: item.employee.assignedUser?.PFAccountNumber,
          ESINumber: item.employee.assignedUser?.ESIAccountNumber,
          tenantName: item.tenant?.tenantName,
          Address: item.tenant?.companyAddress,
          designation: item.employee.assignedUser?.designation,
          month: month,
          year: year,
          payableDays: item.payableDays || verification.payableDays || 0,
          earnings: earnings,
          deductions: deductions,
          benefits: benefits,
          penalties: penalties,
          otherDeduction: otherDeduction,
          totalEarnings: verification.totalEarnings,
          individualDeduction: verification.individualDeduction,
          salaryArrears: verification.salaryArrears,
          totalDeductions: verification.totalOtherDeduction,
          netSalary: verification.netSalary,
          totalBenefits: verification.totalBenefits,
          totalAttendanceCount: verification.totalAttendanceCount || null,
          loanRepayment: verification.loanRepayment || 0,
          // tdsAmount: verification.tdsAmount || 0,
          payableAmount: verification.payableAmount || 0,
          ctc: verification.ctc || 0,
          cycleDates: {
            startDate: this.dateRange.start,
            endDate: this.dateRange.end,
            totalDays:
              this.dateRange.start && this.dateRange.end
                ? Math.ceil(
                    (new Date(this.dateRange.end) -
                      new Date(this.dateRange.start)) /
                      (1000 * 60 * 60 * 24),
                  ) + 1
                : 0,
          },
          startDate: verification.startDate || this.dateRange.start || "-",
          endDate: verification.endDate || this.dateRange.end || "-",
        };
        const imageUrl = await this.files(item.tenant?.logo);
        this.currentPayslipData.logo = imageUrl;
        this.showPayslipPreview = true;
      } catch (error) {
        console.error("Error preparing payslip:", error);
        this.$emit("show-snackbar", {
          message: `Error preparing payslip: ${error.message}`,
          color: "error",
        });
        return false;
      } finally {
        this.generatingPdf = false;
      }

      return true;
    },
    async files(fileId) {
      try {
        const token = authService.getToken();
        if (!fileId) {
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/assets/${fileId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch file");
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        return objectUrl;
      } catch (error) {
        console.error("Error fetching file URL:", error);
        return null;
      }
    },

    async downloadCurrentPayslip() {
      if (!this.currentPayslipData) return;

      try {
        this.generatingPdf = true;

        const payslipElement =
          this.$refs.payslipPreviewContent.querySelector(".payslip-container");

        if (!payslipElement) {
          throw new Error("Payslip element not found");
        }

        const canvas = await html2canvas(payslipElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imageData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
        });

        // A4 size in points
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const margin = 20;

        const imageWidth = pageWidth - 2 * margin;
        const imageHeight = (canvas.height * imageWidth) / canvas.width;

        pdf.addImage(imageData, "PNG", margin, margin, imageWidth, imageHeight);

        const fileName = `payslip-${this.currentPayslipData.employeeName.replace(/\s+/g, "-")}-${this.currentPayslipData.month}-${this.currentPayslipData.year}.pdf`;

        pdf.save(fileName);

        this.$emit("show-snackbar", {
          message: "Payslip downloaded as PDF successfully",
          color: "success",
        });
      } catch (error) {
        console.error("Error downloading payslip:", error);
        this.$emit("show-snackbar", {
          message: `Error downloading payslip: ${error.message}`,
          color: "error",
        });
      } finally {
        this.generatingPdf = false;
      }
    },

    async downloadSelectedPayslips() {
      if (!this.selected || this.selected.length === 0) {
        this.$emit("show-snackbar", {
          message: "Please select at least one employee",
          color: "warning",
        });
        return;
      }

      if (this.selected.length > 1) {
        this.$emit("show-snackbar", {
          message: "Please select only one employee to download a payslip",
          color: "warning",
        });
        return;
      }

      this.downloadingPayslips = true;

      try {
        const selectedItems = this.items.filter((item) =>
          this.selected.some((selectedItem) => {
            const selectedId = selectedItem.id || selectedItem;
            return selectedId === item.id;
          }),
        );

        const downloadableItems = selectedItems.filter(
          (item) => item.attendanceVerified && item.salaryVerified,
        );

        if (downloadableItems.length === 0) {
          this.$emit("show-snackbar", {
            message:
              "The selected employee doesn't have verified attendance and finalized salary for payslip download",
            color: "warning",
          });
          this.downloadingPayslips = false;
          return;
        }

        const success = await this.downloadPayslip(downloadableItems[0]);

        if (success && this.currentPayslipData) {
          await this.downloadCurrentPayslip();

          this.$emit("show-snackbar", {
            message: "Successfully processed payslip",
            color: "success",
          });
        } else {
          console.error("Failed to load payslip data");
          this.$emit("show-snackbar", {
            message: "Failed to load payslip data",
            color: "error",
          });
        }
      } catch (error) {
        console.error("Error downloading payslip:", error);
        this.$emit("show-snackbar", {
          message: `Error downloading payslip: ${error.message}`,
          color: "error",
        });
      } finally {
        this.downloadingPayslips = false;
      }
    },

    cancelDownload() {
      if (this.downloadCancelToken) {
        this.downloadCancelToken.cancel("Download canceled by user");
      }
      this.showDownloadProgress = false;
      this.downloadProgress = 0;
    },

    async downloadSalarySheet() {
      try {
        this.loading = true;

        this.downloadProgress = 0;
        this.showDownloadProgress = true;
        this.downloadTitle = "Downloading Salary Sheet";
        this.downloadFileName = `salary-sheet-${new Date().toISOString().slice(0, 10)}.xlsx`;

        let selectedItems = [];

        if (this.selected.length > 0) {
          selectedItems = this.items.filter((item) =>
            this.selected.some((selectedItem) => {
              const selectedId = selectedItem.id || selectedItem;
              return selectedId === item.id;
            }),
          );
        } else if (this.hasActiveFilters || this.search) {
          selectedItems = this.items;
        } else {
          let page = 1;
          let allEmployees = [];
          let hasMore = true;

          while (hasMore) {
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown`,
              {
                params: {
                  limit: 100,
                  page,
                  "filter[_and][0][_and][0][employee][assignedUser][tenant][tenantId][_eq]":
                    this.tenantId,
                  "filter[_and][0][_and][2][_or][0][employee][assignedUser][dateOfJoining][_lte]":
                    this.dateRange.end,
                  "filter[_and][0][_and][2][_or][1][employee][assignedUser][dateOfJoining][_null]": true,

                  "filter[_and][0][_and][3][_or][0][employee][assignedUser][dateOfLeaving][_gte]":
                    this.dateRange.start,
                  "filter[_and][0][_and][3][_or][1][employee][assignedUser][dateOfLeaving][_null]": true,
                  fields: [
                    "id",
                    "employee.id",
                    "employee.employeeId",
                    "employee.assignedUser.first_name",
                    "employee.assignedUser.role.name",
                    "employee.assignedUser.dateOfJoining",
                    "employee.assignedUser.dateOfLeaving",
                    "employee.branch.branchName",
                    "employee.department.departmentName",
                    "employee.cycleType",
                  ],
                },
                headers: {
                  Authorization: `Bearer ${this.token}`,
                },
              },
            );

            const employees = response.data.data || [];
            allEmployees = allEmployees.concat(employees);
            hasMore = employees.length === 100;
            page++;
          }

          selectedItems = allEmployees;
        }

        this.downloadFileSize = selectedItems.length * 10240;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        this.downloadCancelToken = axios.CancelToken.source();

        let startDate, endDate;

        const cycleDates = await this.calculateAttendanceCycleDates(
          currentMonth,
          currentYear,
        );
        startDate = cycleDates.cycleStartDate;
        endDate = cycleDates.cycleEndDate;

        if (this.dateRange.start && this.dateRange.end) {
          startDate = this.dateRange.start;
          endDate = this.dateRange.end;
        }

        const progressInterval = setInterval(() => {
          if (this.downloadProgress < 90) {
            this.downloadProgress += Math.floor(Math.random() * 10) + 1;
          }
        }, 300);

        await downloadSalarySheet(
          selectedItems,
          currentMonth,
          currentYear,
          this.token,
          {
            cancelToken: this.downloadCancelToken.token,
            onProgress: (progress) => {
              this.downloadProgress = progress.percentage;
            },
            startDate,
            endDate,
            isFixedCycle: this.fixedCycle,
            filters: {
              branch: this.filters?.branch || null,
              department: this.filters?.department || null,
              attendanceVerification:
                this.verificationFilters?.attendance || null,
              salaryVerification: this.verificationFilters?.salary || null,
            },
          },
        );

        clearInterval(progressInterval);
        this.downloadProgress = 100;
        this.showDownloadProgress = false;
        this.$emit("show-snackbar", {
          message: `Successfully generated salary sheet for ${selectedItems.length} employees`,
          color: "success",
        });
      } catch (error) {
        this.showDownloadProgress = false;

        if (axios.isCancel(error)) {
          this.$emit("show-snackbar", {
            message: "Download canceled",
            color: "info",
          });
        } else {
          console.error("Error generating salary sheet:", error);
          this.$emit("show-snackbar", {
            message: `Error generating salary sheet: ${error.message}`,
            color: "error",
          });
        }
      } finally {
        this.loading = false;
        // this.showDownloadProgress = false;
      }
    },

    handleRowClick(item) {
      if (item.attendanceVerified && item.salaryVerified) {
        this.downloadPayslip(item);
        return;
      }

      localStorage.setItem("selectedEmployee", JSON.stringify(item));

      localStorage.setItem(
        "attendanceDateRange",
        JSON.stringify({
          startDate: this.dateRange.start,
          endDate: this.dateRange.end,
          selectedMonth: this.selectedMonth,
          fixedCycle: this.fixedCycle,
          tenantId: this.tenantId,
        }),
      );
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.page = 1;
        this.aggregateCount();
        this.fetchItems();
      }, 500);
    },

    async user() {
      const userData = await currentUserTenant.fetchLoginUserDetails();
      this.tenantId = userData.tenant?.tenantId || userData.tenant;

      try {
        const tenantResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tenant/${this.tenantId}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );

        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json();
          // Fix: Properly extract tenant name from response
          this.tenantName = tenantData.data?.tenantName || "Company Name";
          this.tenantAddress =
            tenantData.data?.companyAddress || "Company Address";
          this.companyLogo =
            tenantData.data?.logo ||
            "https://via.placeholder.com/150x50?text=Company+Logo";

          // Fix: Set currentPayslipData with proper tenant name
          this.currentPayslipData = {
            tenantName: this.tenantName,
            logo: this.companyLogo,
            address: this.tenantAddress,
          };
        }
      } catch (error) {
        console.error("Error fetching tenant details:", error);
      }
    },

    async checkVerificationStatus(employeeIds) {
      try {
        const url = new URL(
          `${import.meta.env.VITE_API_URL}/items/payrollVerification?limit=-1`,
        );

        // Build filter conditions
        if (Array.isArray(employeeIds)) {
          url.searchParams.append(
            "filter[employee][id][_in]",
            employeeIds.join(","),
          );
        } else {
          url.searchParams.append("filter[employee][id][_eq]", employeeIds);
        }

        if (this.tenantId) {
          url.searchParams.append(
            "filter[tenant][tenantId][_eq]",
            this.tenantId,
          );
        }

        // Add date range filters if available
        if (this.dateRange.start && this.dateRange.end) {
          url.searchParams.append(
            "filter[startDate][_eq]",
            this.dateRange.start,
          );
          url.searchParams.append("filter[endDate][_eq]", this.dateRange.end);
        }

        // Add verification filters if set
        if (this.verificationFilters.attendance !== null) {
          url.searchParams.append(
            "filter[attendaceVerification][_eq]",
            this.verificationFilters.attendance,
          );
        }

        if (this.verificationFilters.salary !== null) {
          url.searchParams.append(
            "filter[salaryVerification][_eq]",
            this.verificationFilters.salary,
          );
        }

        if (this.verificationFilters.salaryPaid !== null) {
          url.searchParams.append(
            "filter[salaryPaid][_eq]",
            this.verificationFilters.salaryPaid,
          );
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
          if (Array.isArray(employeeIds) && employeeIds.length > 0) {
            return {};
          }

          return {
            attendanceVerified: false,
            salaryVerified: false,
            ctc: "0",
            payableDays: "0",
            downloadablePdf: null,
            startDate: null,
            endDate: null,
            salaryPaid: "unPaid",
          };
        }

        if (Array.isArray(employeeIds) && employeeIds.length > 0) {
          const verificationMap = {};
          data.data.forEach((item) => {
            if (item.employee) {
              verificationMap[item.employee] = {
                attendanceVerified: item.attendaceVerification || false,
                salaryVerified: item.salaryVerification || false,
                ctc: item.ctc
                  ? Math.round(parseFloat(item.ctc)).toString()
                  : "-",
                payableDays: item.payableDays || "-",
                downloadablePdf: item.downloadablePdf,
                startDate: item.startDate || null,
                endDate: item.endDate || null,
                salaryPaid: item.salaryPaid || "unPaid",
              };
            }
          });
          return verificationMap;
        }

        return {
          attendanceVerified: data.data[0].attendaceVerification || false,
          salaryVerified: data.data[0].salaryVerification || false,
          ctc: data.data[0].ctc
            ? Math.round(parseFloat(data.data[0].ctc)).toString()
            : "-",
          payableDays: data.data[0].payableDays || "-",
          downloadablePdf: data.data[0].downloadablePdf,
          startDate: data.data[0].startDate || null,
          endDate: data.data[0].endDate || null,
          salaryPaid: data.data[0].salaryPaid || "unPaid",
        };
      } catch (error) {
        console.error("Error checking verification status:", error);
        if (Array.isArray(employeeIds) && employeeIds.length > 1) {
          return {};
        }
        return {
          attendanceVerified: false,
          salaryVerified: false,
          ctc: "-",
          payableDays: "-",
          downloadablePdf: null,
          startDate: null,
          endDate: null,
          salaryPaid: "unPaid",
        };
      }
    },
    onFilterVisibilityChanged(isVisible) {
      this.showFilters = isVisible;
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    // this were the data for the ui is getting

    handlePageChange(newPage) {
      this.page = newPage;
      this.fetchItems();
    },

    handleItemsPerPageChange(newItemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.page = 1;
      this.fetchItems();
    },

    getStatusCount(status) {
      if (!this.hasActiveFilters && this.selectedStatus === "all") {
        return 0;
      }
      if (status === "all") {
        return this.totalItems;
      }

      return this.items.filter((item) => item.status === status).length;
    },

    getStatusColor(status) {
      const statusColors = {
        Active: "success",
        Inactive: "error",
        Pending: "warning",
      };
      return statusColors[status] || "grey";
    },
  },
  watch: {
    dateRange: {
      handler(newVal, oldVal) {
        console.log("dateRange changed:", {
          newVal,
          oldVal,
        });
      },
      deep: true,
    },
  },
  async mounted() {
    await this.user();
    await this.aggregateCount();
    await this.fetchItems();
  },
};
</script>

<style scoped>
.employee-container {
  display: flex;
  position: relative;
  transition: all 0.3s ease;
}

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

/* Fixed row height - reduced from default */
.employee-table :deep(tbody tr) {
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
}

.employee-table :deep(tbody td) {
  padding-top: 8px !important;
  /* padding-bottom: 8px !important;
  height: 48px !important; */
  vertical-align: middle !important;
}

.employee-table :deep(thead tr) {
  height: 56px !important;
}

.employee-table :deep(thead th) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  height: 56px !important;
  vertical-align: middle !important;
}

/* Disabled row styling - gray background for left/new joining users */
.employee-table :deep(tbody tr.disabled-row) {
  background-color: #f5f5f5 !important;
  color: #757575 !important;
  opacity: 0.7;
}

.employee-table :deep(tbody tr.disabled-row td) {
  background-color: #f5f5f5 !important;
  color: #757575 !important;
}

.employee-table :deep(tbody tr.disabled-row:hover) {
  background-color: #eeeeee !important;
}

/* Checkbox styling improvements */
.employee-table :deep(.v-input--selection-controls) {
  margin-top: 0 !important;
  padding-top: 0 !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.employee-table :deep(.v-checkbox) {
  height: 32px !important;
}

.employee-table :deep(.v-input--density-compact .v-field) {
  height: 32px !important;
}

/* Ensure proper alignment of all content */
.salary-paid-status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  text-transform: capitalize;
  text-align: center;
  min-width: 70px;
}

.salary-paid-status.paid {
  background-color: #1b5e20;
  color: #c8e6c9;
}

.salary-paid-status.unpaid {
  background-color: #b71c1c;
  color: #ffcdd2;
}

.filter-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 350px;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.filter-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f5f5;
  margin-top: 70px;
}

.filter-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.filter-actions {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.filter-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff5252;
}

.filter-panel {
  width: 350px !important;
  max-width: 350px !important;
}

.download-progress-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.progress-status {
  font-size: 16px;
  color: #666;
  margin-bottom: 4px;
}

.progress-percentage {
  font-size: 32px;
  font-weight: 600;
  color: #1a73e8;
  margin-bottom: 12px;
}

.progress-bar {
  border-radius: 8px;
  overflow: hidden;
}

.payslip-preview-content {
  padding: 20px;
  background-color: #f5f5f5;
}

.payslip-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.payslip-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.payslip-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eaeaea;
}

.company-logo {
  width: 120px;
  margin-right: 20px;
}

.company-logo img {
  max-width: 100%;
  height: auto;
}

.company-info h2 {
  font-size: 24px;
  margin: 0 0 5px;
  color: #333;
}

.company-info p {
  margin: 0;
  color: #666;
}

.payslip-title {
  text-align: center;
  margin-bottom: 20px;
}

.payslip-title h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.employee-details {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-item {
  flex: 1;
}

.label {
  font-weight: 600;
  color: #555;
  margin-right: 5px;
}

.value {
  color: #333;
}

.salary-details {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.salary-section {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
}

.salary-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 8px;
}
.filter-toggle-static {
  position: relative;
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #374151;
}

.filter-toggle-static:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-toggle-static.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.filter-indicator {
  position: absolute;
  top: -2px;
  left: -2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.salary-items {
  display: flex;
  flex-direction: column;
}

.salary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.salary-item.total {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
  font-weight: 600;
}

.item-name {
  color: #555;
}

.item-value {
  color: #333;
}

.net-salary {
  background-color: #4776e6;
  color: white;
  border-radius: 6px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.net-salary-label {
  font-size: 18px;
  font-weight: 600;
}

.net-salary-value {
  font-size: 22px;
  font-weight: 700;
}

.payslip-footer {
  text-align: center;
  color: #777;
  font-size: 12px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
}

.payslip-footer p {
  margin: 5px 0;
}

/* payslip */
.payslip-container-new {
  padding: 20px;
  background-color: #fff;
}

.payslip-content {
  max-width: 800px;
  margin: 0 auto;
}

/* Header Styles */
.payslip-header-new {
  border: 2px solid #000;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.company-name {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: bold;
}

.company-address {
  margin: 0 0 15px 0;
  font-size: 14px;
}

.payslip-title-text {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

/* Section Styles */
.section-container {
  margin-bottom: 20px;
}

.section-header {
  background-color: #e0e0e0;
  padding: 10px;
  font-weight: bold;
  border: 1px solid #000;
  border-bottom: none;
}

/* Table Styles */
.details-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
}

.details-table td {
  border: 1px solid #000;
  padding: 8px;
}

.label-cell {
  font-weight: bold;
  width: 25%;
}

.value-cell {
  width: 25%;
}

/* Salary Grid */
.salary-grid {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.salary-column {
  flex: 1;
}

.salary-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
}

.salary-table td {
  border: 1px solid #000;
  padding: 8px;
}

.item-cell {
  text-align: left;
}

.amount-cell {
  text-align: right;
}

.subsection-header {
  font-weight: bold;
  background-color: #f5f5f5;
  text-align: left;
  padding: 8px !important;
}

.total-row {
  font-weight: bold;
  background-color: #f0f0f0;
}

/* Net Salary Box */
.net-salary-box {
  border: 2px solid #000;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 20px;
}

.net-salary-label {
  flex: 1;
}

.net-salary-amount {
  flex: 0 0 auto;
}

/* Attendance Summary */
.attendance-summary {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.attendance-summary h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.attendance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.attendance-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.attendance-label {
  font-weight: 500;
  text-transform: capitalize;
}

.attendance-value {
  font-weight: bold;
}

/* Footer */
.payslip-footer-new {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 20px;
}

.payslip-footer-new p {
  margin: 5px 0;
}

/* Loading State */
.payslip-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

/* Print Styles */
@media print {
  .payslip-container-new {
    padding: 0;
  }
}

.salary-item-group {
  margin-top: 10px;
  padding-top: 5px;
  border-top: 1px dashed #eaeaea;
}

.salary-item-group-title {
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  font-size: 14px;
}

.net-salary {
  margin-top: 20px;
  margin-bottom: 30px;
}

.employee-details {
  margin-bottom: 30px;
}

.salary-details {
  margin-bottom: 30px;
}

.attendance-summary {
  margin-top: 20px;
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
}

.filter-pane {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.attendance-summary h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 8px;
}

.attendance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.attendance-item {
  display: flex;
  flex-direction: column;
}

.attendance-label {
  font-weight: 600;
  color: #555;
  font-size: 12px;
}

.attendance-value {
  color: #333;
  font-size: 14px;
}
/* Stats Container */
.stats-container {
  display: inline-flex;
  gap: 1rem;
  padding: 0.5rem 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.stat-item.active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
}

.stat-title {
  color: #6b7280;
}

.stat-item.active.all-orgs--text {
  background: rgba(130, 94, 156, 0.1);
}

.stat-item.active.tenant--text {
  background: rgba(16, 185, 129, 0.1);
}

.stat-item.active.distributor--text {
  background: rgba(104, 173, 225, 0.1);
}

.stat-item.active.client--text {
  background: rgba(196, 170, 98, 0.1);
}

.stat-item.active.contact--text {
  background: rgba(168, 85, 247, 0.1);
}
.position-relative {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 8px;
}
</style>

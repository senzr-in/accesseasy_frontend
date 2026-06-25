<template>
  <div class="employee-form-container">
    <!-- Success message notification -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">
          mdi-check-circle
        </v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      v-model="showErrorSnackbar"
      color="error"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">
          mdi-alert-circle
        </v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>

    <!-- Breadcrumb and Action Buttons -->
    <div class="form-heade">
      <div class="header-conten">
        <v-breadcrumbs
          :items="breadcrumbs"
          class="pa-0"
        >
          <template #prepend>
            <!-- <v-btn
              icon
              variant="text"
              @click="$emit('cancel')"
              class="back-button"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn> -->
          </template>
          <template #item="{ item }">
            <v-breadcrumbs-item
              :disabled="item.disabled"
              class="breadcrum"
              @click="$router.push('/employee-details')"
            >
              {{ item.text }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </div>
      <div class="action-buttons">
        <v-btn
          color="error"
          variant="text"
          @click="$emit('cancel')"
        >
          CANCEL
        </v-btn>
        <BaseButton
          color="black"
          :text="`SAVE`"
          @click="saveEmployee"
        />
      </div>
    </div>

    <!-- Tab Bar -->

    <div class="tab-section">
      <v-tabs
        v-model="currentTab"
        bg-color="transparent"
        color="#059367"
        class="custom-tabs mb-6"
        align-tabs="center"
      >
        <v-tab
          v-for="(tab, index) in filteredTabs"
          :key="index"
          :value="tab.id"
          class="tab-item"
          :class="{
            'tab-item--active': currentTab === tab.id,
            'tab-item--error': tabHasErrorComputed(tab.id),
            'tab-item--loading': loadingStates[tab.id],
          }"
        >
          <div class="tab-conten">
            <v-icon
              v-if="loadingStates[tab.id]"
              class="tab-loading-icon"
              size="16"
            >
              mdi-loading
            </v-icon>
            <!-- <v-icon class="tab-icon" size="20">
              {{ tab.icon }}
            </v-icon> -->
            <span class="tab-text">{{ tab.title }}</span>
            <v-icon
              v-if="tabHasErrorComputed(tab.id) && !loadingStates[tab.id]"
              color="error"
              size="16"
              class="tab-error-icon"
            >
              mdi-alert-circle
            </v-icon>
          </div>
        </v-tab>
      </v-tabs>
    </div>

    <!-- Main Content Area -->
    <div class="form-content">
      <v-form
        ref="form"
        v-model="valid"
        @submit.prevent="saveEmployee"
      >
        <!-- Personal Details Section -->
        <div
          v-show="currentTab === 'personal'"
          class="form-section"
        >
          <div
            v-if="loadingStates.personal"
            class="tab-loading-container"
          >
            <v-progress-circular
              indeterminate
              color="#059367"
              size="32"
            />
            <p>Loading personal details...</p>
          </div>
          <div v-else>
            <!-- Employee Details Card -->
            <div class="detail-card">
              <div class="card-header">
                <h3 class="section-title">
                  Employee Details
                </h3>
              </div>
              <div class="card-body">
                <!-- Top Row: Avatar + Fields -->
                <div class="form-row">
                  <!-- Avatar Section -->
                  <div class="avatar-section">
                    <div class="avatar-wrapper-large">
                      <div class="avatar-large square-avatar">
                        <v-img
                          v-if="avatarImage"
                          :src="avatarImage"
                          alt="Avatar"
                        />
                        <div
                          v-else
                          class="avatar-placeholder-large"
                        >
                          <v-icon
                            size="120"
                            color="grey lighten-1"
                          >
                            mdi-account-tie
                          </v-icon>
                        </div>
                      </div>
                      <v-btn
                        icon
                        class="edit-avatar-btn-large"
                        color="white"
                        @click="triggerFileInput"
                      >
                        <v-icon>mdi-camera</v-icon>
                      </v-btn>
                    </div>
                    <input
                      ref="fileInput"
                      type="file"
                      style="display: none"
                      accept="image/*"
                      @change="handleAvatarChange"
                    >
                  </div>
                  <!-- Fields Container -->
                  <div class="fields-container">
                    <!-- Name and Role Row -->
                    <div class="form-row name-role-row">
                      <div class="field-group">
                        <label>First Name *</label>
                        <v-text-field
                          v-model="formData.firstName"
                          required
                          :error-messages="getFieldErrorMessage('firstName')"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          @blur="markFieldAsTouched('firstName')"
                          @input="capitalizeFirstLetterEachWord('firstName')"
                        />
                      </div>
                      <div class="field-group">
                        <label>Middle Name</label>
                        <v-text-field
                          v-model="formData.middleName"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          @input="capitalizeFirstLetterEachWord('middleName')"
                        />
                      </div>
                      <div class="field-group">
                        <label>Last Name</label>
                        <v-text-field
                          v-model="formData.lastName"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          @input="capitalizeFirstLetterEachWord('lastName')"
                        />
                      </div>
                      <div class="field-group">
                        <label>Role *</label>
                        <v-select
                          v-model="formData.role"
                          :items="roleOptions"
                          item-title="name"
                          item-value="name"
                          :error-messages="getFieldErrorMessage('role')"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          @blur="markFieldAsTouched('role')"
                        />
                      </div>
                    </div>
                    <!-- Employee ID, Designation, Phone, Email Row -->
                    <div class="form-row contact-row">
                      <div class="field-group">
                        <label>Employee ID *</label>
                        <v-text-field
                          v-model="formData.employeeId"
                          required
                          :error-messages="getFieldErrorMessage('employeeId')"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          @blur="markFieldAsTouched('employeeId')"
                        />
                      </div>
                      <div class="field-group">
                        <label>Designation</label>
                        <v-text-field
                          v-model="formData.designation"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          @input="handleInputChange('designation')"
                        />
                      </div>
                      <div class="field-group">
                        <label>Phone</label>
                        <v-text-field
                          v-model="formData.phone"
                          type="number"
                          :error-messages="phoneErrorMessage"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          @blur="validatePhone"
                        />
                      </div>
                      <div class="field-group">
                        <label>Email</label>
                        <v-text-field
                          v-model="formData.email"
                          :error-messages="emailErrorMessage"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          @blur="validateEmail"
                          @input="
                            clearEmailError();
                            toLowerCase('email');
                          "
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Details Card -->
            <div class="detail-card">
              <div class="card-header">
                <h3 class="section-title">
                  Details
                </h3>
              </div>
              <div class="card-body">
                <!-- Details Row 1: Blood Group, Marital Status, DOB, Gender -->
                <div class="form-row">
                  <div class="field-group-column">
                    <div class="field-group">
                      <label>Blood Group</label>
                      <v-select
                        v-model="formData.bloodGroup"
                        :items="[
                          'O+',
                          'O-',
                          'A+',
                          'A-',
                          'B+',
                          'B-',
                          'AB+',
                          'AB-',
                        ]"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </div>
                    <div class="field-group">
                      <label>Marital Status</label>
                      <v-select
                        v-model="formData.maritalStatus"
                        :items="['Married', 'Unmarried']"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </div>
                  </div>
                  <div class="field-group dob-gender-column">
                    <div class="sub-field">
                      <label>Date of Birth</label>
                      <v-text-field
                        v-model="formData.assignedUser.DOB"
                        type="date"
                        variant="outlined"
                        density="comfortable"
                        :error-messages="getFieldErrorMessage('DOB')"
                        :max="maxDate"
                        :min="minDate"
                        hide-details="auto"
                        @input="handleInputChange('assignedUser.DOB')"
                        @blur="markFieldAsTouched('DOB')"
                      />
                    </div>
                    <div class="sub-field">
                      <label>Gender *</label>
                      <v-select
                        v-model="formData.gender"
                        :items="['Female', 'Male', 'Other']"
                        required
                        :error-messages="getFieldErrorMessage('gender')"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                        @blur="markFieldAsTouched('gender')"
                      />
                    </div>
                  </div>
                  <div class="field-group address-field">
                    <label>Permanent Address</label>
                    <v-textarea
                      v-model="formData.permanentAddress"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                      auto-grow
                      hide-details="auto"
                    />
                  </div>
                  <div class="field-group address-field">
                    <label>Communication Address</label>
                    <v-textarea
                      v-model="formData.communicationAddress"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                      auto-grow
                      hide-details="auto"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Company Details Card -->
            <div class="detail-card">
              <div class="card-header">
                <h3 class="section-title">
                  Company Details
                </h3>
              </div>
              <div class="card-body">
                <!-- Company Row 1: Organization, Date of Joining, Attendance Cycle -->
                <div class="form-row">
                  <div class="field-group">
                    <label>Branch</label>
                    <v-select
                      v-model="formData.branchLocation"
                      :items="locationOptions"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      @update:model-value="handleBranchLocationChange"
                    />
                  </div>
                  <div class="field-group">
                    <label>Department</label>
                    <v-select
                      v-model="formData.department"
                      :items="departmentOptions"
                      item-title="name"
                      item-value="id"
                      :error-messages="getFieldErrorMessage('department')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      @update:model-value="handleDepartmentChange"
                    />
                  </div>
                  <div class="field-group">
                    <label>Attendance Cycle</label>
                    <v-select
                      v-model="formData.cycleType"
                      :items="cycleTypeOptions"
                      item-title="cycleName"
                      item-value="cycleId"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </div>
                </div>

                <!-- Company Row 2: Branch, Department, Date of Leaving, Approver -->
                <div class="form-row">
                  <div class="field-group">
                    <label>Approver</label>
                    <v-select
                      v-model="formData.approver"
                      :items="filteredApproverOptions"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      density="comfortable"
                      clearable
                      hide-details="auto"
                    >
                      <template #prepend-item>
                        <div class="approver-search">
                          <v-text-field
                            v-model="searchApprover"
                            label="Search by name"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-magnify"
                            hide-details
                            @input="debounceFilterApprover"
                          />
                          <v-btn
                            variant="text"
                            density="compact"
                            :icon="
                              showApproverFilters
                                ? 'mdi-chevron-up'
                                : 'mdi-filter'
                            "
                            @click.stop="
                              showApproverFilters = !showApproverFilters
                            "
                          />
                        </div>
                        <v-expand-transition>
                          <div
                            v-if="showApproverFilters"
                            class="filter-dropdown"
                          >
                            <v-select
                              v-model="selectedApproverDepartmentFilter"
                              :items="[
                                { id: 'all', name: 'All Departments' },
                                ...departmentOptions,
                              ]"
                              item-title="name"
                              item-value="id"
                              label="Department"
                              density="compact"
                              variant="outlined"
                              hide-details
                              @update:model-value="filterApprovers"
                            />
                          </div>
                        </v-expand-transition>
                        <v-divider class="mt-2" />
                      </template>
                    </v-select>
                  </div>
                  <div class="field-group">
                    <label>Date of Joining</label>
                    <v-text-field
                      v-model="formData.dateOfJoining"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </div>

                  <div class="field-group">
                    <label>Date of Leaving</label>
                    <v-text-field
                      v-model="formData.dateOfLeaving"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Government IDs Section -->
        <!-- <div v-show="currentTab === 'government'" class="form-section">
          <h3>Government IDs</h3>
          <br />
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.voterID"
                label="Voter ID"
                :rules="[rules.voterIdFormat]"
                variant="outlined"
                density="comfortable"
                @input="toUpperCase('voterID')"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.drivingLicense"
                :rules="[rules.drivingLicenseFormat]"
                label="Driving License"
                variant="outlined"
                density="comfortable"
                @input="toUpperCase('drivingLicense')"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.uan"
                :rules="[rules.uanFormat]"
                label="UAN"
                variant="outlined"
                density="comfortable"
                @input="toUpperCase('uan')"
              ></v-text-field>
            </v-col>

          
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.pan"
                label="PAN"
                :rules="[rules.panFormat]"
                variant="outlined"
                density="comfortable"
                @input="toUpperCase('pan')"
              ></v-text-field>
            </v-col>

           
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.aadhar"
                label="Aadhar"
                type="number"
                :rules="[rules.aadharFormat]"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>
        </div> -->

        <!-- Company Details Section -->
        <div
          v-show="currentTab === 'company'"
          class="form-section"
        >
          <h3>Company Details</h3>
          <br>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="formData.designation"
                label="Designation"
                variant="outlined"
                density="comfortable"
                @input="handleInputChange('designation')"
              />
            </v-col>
            <!-- Department -->
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="formData.department"
                :items="departmentOptions"
                item-title="name"
                item-value="id"
                label="Department"
                :error-messages="getFieldErrorMessage('department')"
                variant="outlined"
                density="comfortable"
                @update:model-value="handleDepartmentChange"
              />
            </v-col>
            <!-- Branch Location -->
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="formData.branchLocation"
                :items="locationOptions"
                item-title="name"
                item-value="id"
                label="Branch Location"
                variant="outlined"
                density="comfortable"
                @update:model-value="handleBranchLocationChange"
              />
            </v-col>
            <!-- Date of Joining -->
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="formData.dateOfJoining"
                label="Date of Joining"
                type="date"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <!-- Date of Leaving -->
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="formData.cycleType"
                :items="cycleTypeOptions"
                item-title="cycleName"
                item-value="cycleId"
                label="Attendance Cycle Type"
                variant="outlined"
                density="comfortable"
                @update:model-value="handleCycleTypeChange"
              />
            </v-col>

            <v-col cols="12">
              <h3>PF and ESI Account</h3>
              <br>
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="formData.ESIAccountNumber"
                type="number"
                label="ESI Account Number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="formData.PFAccountNumber"
                type="string"
                label="UAN PF AccountNumber"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </div>

        <!-- Attendance Category Section -->
        <div
          v-show="currentTab === 'attendanceCategory'"
          class="form-section"
        >
          <v-row>
            <v-col cols="12">
              <AttendanceSettingsEditor
                v-model="formData.attendanceCategory"
                :tenant-id="tenantId"
                @update:working-hours-data="
                  (data) => (formData.employeeWorkingHours = data)
                "
                @update:holiday-ids="(ids) => (formData.employeeHolidays = ids)"
              />
            </v-col>
          </v-row>
        </div>

        <!-- Previous Record Section -->
        <!-- <div v-show="currentTab === 'previousRecord'" class="form-section">
          <PastExperienceForm v-model="formData.previousRecords" />
        </div> -->

        <!-- Verification Form Content -->
        <!-- <div
          v-show="currentTab === 'backgroundVerification'"
          class="form-section"
        >
          <h3>Background Verification</h3>
          <br />
          <BackgroundVerification
            :initial-data="{
              phone: formData.phone,
              aadhaar: formData.aadhar,
              pan: formData.pan,
              voterId: formData.voterID,
              uan: formData.uan,
              gst: formData.gst,
            }"
            :verification="formData.verification"
            @update:verification="
              (newVerification) => (formData.verification = newVerification)
            "
            @verification-complete="handleVerificationComplete"
          />
        </div> -->

        <!-- Leave Policy Section -->
        <div
          v-show="currentTab === 'LeavePolicy'"
          class="form-section"
        >
          <div
            v-if="loadingStates.LeavePolicy"
            class="tab-loading-container"
          >
            <v-progress-circular
              indeterminate
              color="#059367"
              size="32"
            />
            <p>Loading leave policies...</p>
          </div>
          <div v-else>
            <v-row>
              <v-col cols="12">
                <v-card>
                  <v-card-title>Available Leave Policies</v-card-title>
                  <v-card-text>
                    <DataTable
                      :items="processedLeaves"
                      :columns="leaveColumns"
                      :show-selection="false"
                      item-key="id"
                      :expandable="false"
                    >
                      <template #cell-leaveName="{ item }">
                        <div class="d-flex align-center">
                          <span class="ml-2">{{
                            formatLeaveType(item.leaveName)
                          }}</span>
                        </div>
                      </template>

                      <template #cell-isAssigned="{ item }">
                        <v-switch
                          v-model="item.isAssigned"
                          color="#059367"
                          hide-details
                          inset
                          @change="handleLeaveToggle(item)"
                        />
                      </template>

                      <template #cell-days="{ item }">
                        <div class="d-flex align-center">
                          <v-text-field
                            v-if="item.isEditing"
                            v-model.number="item.leaveConfig.days"
                            type="number"
                            min="0"
                            dense
                            outlined
                            hide-details
                            label="Days"
                            @blur="saveLeaveEdit(item)"
                            @keyup.enter="saveLeaveEdit(item)"
                          />
                          <span
                            v-else
                            class="text-body-1"
                          >
                            {{ item.leaveConfig?.days || 0 }}
                          </span>
                          <!-- <v-btn
                          icon
                          size="small"
                          class="ml-2"
                          @click="toggleLeaveEdit(item)"
                        >
                          <v-icon>{{
                            item.isEditing ? "mdi-check" : "mdi-pencil"
                          }}</v-icon>
                        </v-btn> -->
                        </div>
                      </template>

                      <template #cell-monthLimit="{ item }">
                        <span class="text-body-1">
                          {{ item.leaveConfig?.monthLimit || 0 }}
                        </span>
                      </template>

                      <template #cell-carryForward="{ item }">
                        <span class="text-body-1">
                          {{ item.leaveConfig?.limit || 0 }}
                        </span>
                      </template>

                      <template #empty-state>
                        <v-alert
                          type="info"
                          variant="tonal"
                        >
                          No active leave policies found for the current year.
                        </v-alert>
                      </template>
                    </DataTable>

                    <!-- Save indicator -->
                    <v-alert
                      v-if="hasUnsavedLeaveChanges"
                      type="warning"
                      variant="tonal"
                      class="mt-3"
                    >
                      You have unsaved leave policy changes. Please save the
                      employee to apply these changes.
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Emergency Contact -->
        <!-- <div
          v-show="currentTab === 'EmergencyContactDetails'"
          class="form-section"
        >
          <h3>Emergency Contact Details</h3>
          <br />
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.emergencyContactName"
                label="Emergency Contact Name"
                variant="outlined"
                density="comfortable"
                @input="capitalizeFirstLetterEachWord('emergencyContactName')"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.emergencyContactMobileNumber"
                label="Emergency Contact Mobile Number"
                type="number"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.emergencyContactRelationship"
                label="Emergency Contact Relationship"
                variant="outlined"
                density="comfortable"
                @input="
                  capitalizeFirstLetterEachWord('emergencyContactRelationship')
                "
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.guardiansName"
                label="Guardian's Name"
                variant="outlined"
                density="comfortable"
                @input="capitalizeFirstLetterEachWord('guardiansName')"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formData.emergencyContactAddress"
                label="Emergency Contact Address"
                rows="3"
                variant="outlined"
                density="comfortable"
              ></v-textarea>
            </v-col>
          </v-row>
        </div> -->
        <!-- Access Management Section -->
        <div
          v-show="currentTab === 'accessManagement'"
          class="form-section"
        >
          <div
            v-if="loadingStates.accessManagement"
            class="tab-loading-container"
          >
            <v-progress-circular
              indeterminate
              color="#059367"
              size="32"
            />
            <p>Loading access management settings...</p>
          </div>
          <AccessManagement
            ref="accessManagementRef"
            :employee-data="formData"
            :is-create-mode="true"
            :access-level-options="accessLevelOptions"
            :tenant-id="tenantId"
            @update:employee-data="handleAccessManagementUpdate"
          />
        </div>
        <!-- App Access -->

        <div
          v-show="currentTab === 'Appaccess'"
          class="form-section"
        >
          <div
            v-if="loadingStates.Appaccess"
            class="tab-loading-container"
          >
            <v-progress-circular
              indeterminate
              color="#059367"
              size="32"
            />
            <p>Loading app access settings...</p>
          </div>
          <div v-else>
            <v-card
              class="app-access-card mb-6 pa-6"
              elevation="0"
              outlined
            >
              <div class="d-flex justify-space-between align-start">
                <div>
                  <div class="d-flex align-center mb-2">
                    <h2 class="text-h6 font-weight-bold me-4">
                      App Access
                    </h2>
                    <div class="d-flex align-center">
                      <!-- <span class="text-body-1 font-weight-medium me-2">
                        {{ formData.appAccess ? "Enabled" : "Disabled" }}
                      </span> -->
                      <v-switch
                        v-model="formData.appAccess"
                        color="#059367"
                        hide-details
                        inset
                        class="app-access-switch"
                        :true-value="true"
                        :false-value="false"
                      />
                    </div>
                  </div>
                  <p class="text-body-2 text-grey-darken-1 mb-0">
                    Enable or disable mobile application access for this
                    employee
                  </p>
                </div>
              </div>
            </v-card>

            <!-- Attendance Mode Toggles -->
            <v-card
              class="attendance-modes-card pa-6"
              elevation="0"
              outlined
            >
              <div class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-1">
                  Attendance Modes
                </h2>
                <p class="text-body-2 text-grey-darken-1">
                  Select the attendance tracking methods for this employee
                </p>
              </div>

              <v-row>
                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <div class="attendance-option">
                    <div
                      class="attendance-icon-wrapper"
                      :class="formData.GeoAttendance ? 'enabled' : 'disabled'"
                    >
                      <v-icon
                        size="32"
                        color="white"
                      >
                        mdi-crosshairs-gps
                      </v-icon>
                    </div>
                    <div class="text-center mt-3 mb-2">
                      <span class="text-body-1 font-weight-medium">Geo Attendance</span>
                    </div>
                    <v-switch
                      v-model="formData.GeoAttendance"
                      color="#059367"
                      hide-details
                      inset
                      class="attendance-switch"
                      :true-value="true"
                      :false-value="false"
                    />
                  </div>
                </v-col>

                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <div class="attendance-option">
                    <div
                      class="attendance-icon-wrapper"
                      :class="formData.faceAttendance ? 'enabled' : 'disabled'"
                    >
                      <v-icon
                        size="32"
                        color="white"
                      >
                        mdi-account-circle
                      </v-icon>
                    </div>
                    <div class="text-center mt-3 mb-2">
                      <span class="text-body-1 font-weight-medium">Face Attendance</span>
                    </div>
                    <v-switch
                      v-model="formData.faceAttendance"
                      color="#059367"
                      hide-details
                      inset
                      class="attendance-switch"
                      :true-value="true"
                      :false-value="false"
                    />
                  </div>
                </v-col>

                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <div class="attendance-option">
                    <div
                      class="attendance-icon-wrapper"
                      :class="
                        formData.selfieAttendance ? 'enabled' : 'disabled'
                      "
                    >
                      <v-icon
                        size="32"
                        color="white"
                      >
                        mdi-camera
                      </v-icon>
                    </div>
                    <div class="text-center mt-3 mb-2">
                      <span class="text-body-1 font-weight-medium">Selfie Attendance</span>
                    </div>
                    <v-switch
                      v-model="formData.selfieAttendance"
                      color="#059367"
                      hide-details
                      inset
                      class="attendance-switch"
                      :true-value="true"
                      :false-value="false"
                    />
                  </div>
                </v-col>

                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <div class="attendance-option">
                    <div
                      class="attendance-icon-wrapper"
                      :class="formData.QrAttendance ? 'enabled' : 'disabled'"
                    >
                      <v-icon
                        size="32"
                        color="white"
                      >
                        mdi-qrcode-scan
                      </v-icon>
                    </div>
                    <div class="text-center mt-3 mb-2">
                      <span class="text-body-1 font-weight-medium">QR Attendance</span>
                    </div>
                    <v-switch
                      v-model="formData.QrAttendance"
                      color="#059367"
                      hide-details
                      inset
                      class="attendance-switch"
                      :true-value="true"
                      :false-value="false"
                    />
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </div>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { convertToCardAccessHex } from "@/utils/helpers/convertToCardAccessHex";
import BackgroundVerification from "./backdround.vue";
import BankDetails from "./bank.vue";
import AccessManagement from "./employeeAddForm/accessManagement.vue";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import AttendanceSettingsEditor from "./employeeAddForm/attendance/attendanceManagement.vue";
import { useRouter } from "vue-router";
import PastExperienceForm from "./employeeAddForm/pastExperience.vue";
import { debounce } from "lodash";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
const bankDetails = ref({});
const branchOptions = ref([]);
const leaveChanges = ref(new Map());
const hasUnsavedLeaveChanges = ref(false);
const verifications = ref([]);
const capitalizeFirstLetterEachWord = (field) => {
  formData[field] = formData[field]
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const toLowerCase = (field) => {
  formData[field] = formData[field].toLowerCase();
};

const toUpperCase = (field) => {
  formData[field] = formData[field].toUpperCase();
};
const processedLeaves = computed(() => {
  return enabledLeaves.value.map((leave) => {
    // Check if we have unsaved changes for this leave
    const leaveChange = leaveChanges.value.get(leave.id);

    return {
      ...leave,
      isAssigned: leaveChange?.isAssigned ?? leave.isAssigned ?? false,
      leaveConfig: {
        ...leave.leaveConfig,
        days: leaveChange?.days ?? leave.leaveConfig?.days ?? 0,
      },
      isEditing: leaveChange?.isEditing ?? false,
    };
  });
});
const phoneErrorMessage = ref("");
const emailErrorMessage = ref("");

const validatePhone = async () => {
  const phone = formData.phone;

  if (!phone) {
    phoneErrorMessage.value = "";
    return true;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[phone][_eq]=%2B91${phone}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to validate phone number");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      phoneErrorMessage.value =
        "This phone number already exists. Please use a different number.";
      return false;
    } else {
      phoneErrorMessage.value = "";
      return true;
    }
  } catch (error) {
    console.error("Error checking phone number:", error);
    phoneErrorMessage.value = "Error checking phone number";
    return false;
  }
};

const validateEmail = async () => {
  const email = formData.email;

  if (!email) {
    emailErrorMessage.value = "";
    return true;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[email][_eq]=${email}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to validate email");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      emailErrorMessage.value =
        "This email already exists. Please use a different email.";
      return false;
    } else {
      emailErrorMessage.value = "";
      return true;
    }
  } catch (error) {
    console.error("Error checking email:", error);
    emailErrorMessage.value = "Error checking email";
    return false;
  }
};

const clearEmailError = () => {
  emailErrorMessage.value = "";
};

const clearPhoneError = () => {
  phoneErrorMessage.value = "";
};

const props = defineProps({
  firstName: String,
  tenantId: String,
  titleAttachment: String,
});

const emit = defineEmits(["save-success", "cancel"]);

// Breadcrumb items
const breadcrumbs = ref([
  { text: "Employee", href: "/employee-details", disabled: false },
  {
    text: "Create Employee",
    href: "/employee-details",
    disabled: true,
  },
]);

const router = useRouter();
const currentTab = ref("personal");
const formSubmitAttempted = ref(false);
const assignedCards = ref([]);
const formErrors = ref({});
const touchedFields = ref({});
const form = ref(null);
const valid = ref(false);
const fileInput = ref(null);
const avatarImage = ref(null);
const currentAvatarId = ref(null);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const selectedAvatarFile = ref(null);
const accessManagementRef = ref(null);
const isInitialized = ref(false);
const leaveSettings = ref([]);
const enabledLeaves = ref([]);
const selectedBranchFilter = ref("all");
const selectedDepartmentFilter = ref("all");
const searchReportingManager = ref("");
const showFilters = ref(false);
const selectedManagesEmployeeBranchFilter = ref("all");
const selectedManagesEmployeeDepartmentFilter = ref("all");
const searchManagesEmployee = ref("");
const showManagesEmployeeFilters = ref(false);
const managesEmployeeOptions = ref([]);
const orgOptions = ref([]);
const cycleTypeOptions = ref([]);
const departmentOptions = ref([]);
const locationOptions = ref([]);
const selectedApproverDepartmentFilter = ref("all");
const searchApprover = ref("");
const showApproverFilters = ref(false);
const approverOptions = ref([]);
const userRole = ref(authService.getUserRole() || "Employee");
const accessLevelOptions = ref([]);

const leaveColumns = ref([
  { key: "leaveName", label: "Leave Type", width: "200px" },

  { key: "days", label: "Days", width: "200px" },
  { key: "monthLimit", label: "Month Limit", width: "200px" },
  { key: "carryForward", label: "Carry Forward", width: "200px" },
  { key: "isAssigned", label: "Status", width: "200px" },
]);

const filteredTabs = computed(() => {
  const currentRole = userRole.value;
  return tabs.filter((tab) => tab.roles.includes(currentRole));
});

const filteredApproverOptions = computed(() => {
  if (!formData.role) return [];

  return approverOptions.value.filter((approver) => {
    if (formData.role === "Employee") {
      return approver.role === "Employee";
    } else if (formData.role === "Employee") {
      return approver.role === "Employee";
    }
    //  else if (formData.role === "Employee") {
    //   return approver.role === "Employee";
    // }
    return false;
  });
});

const tabs = [
  {
    id: "personal",
    title: "Overview",
    icon: "mdi-account",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
  // {
  //   id: "company",
  //   title: "Company Details",
  //   icon: "mdi-domain",
  //   roles: ["Admin", "Manager", "Employee", "Dealer"],
  // },
  {
    id: "attendanceCategory",
    title: "Assign shifts",
    icon: "mdi-calendar-check",
    roles: ["Admin", "Dealer", "Manager"],
  },
  {
    id: "LeavePolicy",
    title: "Leave Policy",
    icon: "mdi-calendar-account",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
  {
    id: "accessManagement",
    title: "Access Management",
    icon: "mdi-key",
    roles: ["Admin", "Dealer", "Manager", "accessManager"],
  },

  {
    id: "Appaccess",
    title: " Mobile App access",
    icon: "mdi-map-marker",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
];

const tabRequiredFields = {
  personal: ["firstName", "gender", "employeeId"],
  // company: [],
  attendanceCategory: [],
  LeavePolicy: [],
  accessManagement: [],
  Appaccess: [],
};
const loadingStates = reactive({
  personal: false,
  attendanceCategory: false,
  LeavePolicy: false,
  accessManagement: false,
  Appaccess: false,
  government: false,
  company: false,
  previousRecord: false,
  backgroundVerification: false,
});
const tabDataLoaded = reactive({
  personal: false,
  attendanceCategory: false,
  LeavePolicy: false,
  Appaccess: false,
  government: false,
  company: false,
  previousRecord: false,
  accessManagement: false,
  backgroundVerification: false,
});
const loadTabData = async (tabId) => {
  if (tabDataLoaded[tabId] || loadingStates[tabId]) return;

  loadingStates[tabId] = true;

  try {
    switch (tabId) {
      case "personal":
        await loadPersonalTabData();
        break;
      case "attendanceCategory":
        await loadAttendanceTabData();
        break;
      case "LeavePolicy":
        await loadLeavePolicyTabData();
        break;
      case "accessManagement":
        await loadAccessManagementTabData();
        break;
      case "Appaccess":
        await loadAppAccessTabData();
        break;
      case "government":
        await loadGovernmentTabData();
        break;
      case "company":
        await loadCompanyTabData();
        break;
      case "previousRecord":
        await loadPreviousRecordTabData();
        break;
      case "backgroundVerification":
        await loadVerificationTabData();
        break;
    }
    tabDataLoaded[tabId] = true;
  } catch (error) {
    console.error(`Error loading ${tabId} tab:`, error);
    showErrorMessage(`Failed to load ${tabId} data`);
  } finally {
    loadingStates[tabId] = false;
  }
};

// Individual tab loading methods
const loadPersonalTabData = async () => {
  // Load personal tab specific data
  await Promise.all([
    fetchDepartments(),
    fetchLocations(),
    fetchRoles(),
    fetchCycleTypes(),
    filterApprovers(),
  ]);
};

const loadAttendanceTabData = async () => {
  // Load attendance tab specific data
  // Add any attendance-specific API calls here
  console.log("Loading attendance data...");
};

const loadLeavePolicyTabData = async () => {
  // Load leave policy data
  await fetchLeavePolicies();
};

const loadAppAccessTabData = async () => {
  // Load app access specific data
  console.log("Loading app access data...");
};

const loadGovernmentTabData = async () => {
  // Load government IDs data
  console.log("Loading government data...");
};
const loadAccessManagementTabData = async () => {
  try {
    const resolvedTenantId = await resolveTenantId();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${resolvedTenantId}&fields=accessLevelName,accessType,_24hrs,maxWorkHours,workingHours,holidays,assignedDoors.doors_id.doorNumber,assignedDoors.doors_id.doorName`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch access levels");

    const data = await response.json();
    accessLevelOptions.value = data.data || [];

    console.log("Access levels loaded:", accessLevelOptions.value);
  } catch (error) {
    console.error("Error loading access management data:", error);
    showErrorMessage("Failed to load access management data");
  }
};
const loadCompanyTabData = async () => {
  // Load company details data
  await Promise.all([
    filterReportingManagers(),
    filterManagesEmployee(),
    filterApprovers(),
  ]);
};

const loadPreviousRecordTabData = async () => {
  // Load previous record data
  console.log("Loading previous record data...");
};

const loadVerificationTabData = async () => {
  // Load verification data
  console.log("Loading verification data...");
};
watch(
  currentTab,
  async (newTab, oldTab) => {
    // Validate previous tab before switching
    if (oldTab && tabRequiredFields[oldTab]) {
      const mandatoryFields = tabRequiredFields[oldTab];
      if (Array.isArray(mandatoryFields)) {
        mandatoryFields.forEach((field) => {
          if (!formData[field]) {
            touchedFields.value[field] = true;
            formErrors.value[field] = "This field is required";
          }
        });
      }
    }

    // Load data for the new tab
    await loadTabData(newTab);
  },
  { immediate: true }
);
const formData = reactive({
  avatar: null,
  avatarFile: null,
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  email: "",
  officeEmail: "",
  gender: "",
  assignedUser: {
    DOB: null,
  },
  Dob: null,
  maritalStatus: "",
  bloodGroup: "",
  status: "active",
  skilled: "",
  employeeId: "",
  department: "",
  branchLocation: "",
  role: "",
  designation: "",
  tenantName: "",
  dateOfJoining: "",
  dateOfLeaving: "",
  accessOn: true,
  permanentAddress: "",
  currentAddress: "",
  emergencyContactName: "",
  emergencyContactMobileNumber: "",
  emergencyContactRelationship: "",
  emergencyContactAddress: "",
  guardiansName: "",
  voterID: "",
  drivingLicense: "",
  uan: "",
  previousRecords: [],
  ESIAccountNumber: "",
  PFAccountNumber: "",
  shopAccount: "",
  verification: [],
  appAccess: true,
  QrAttendance: true,
  GeoAttendance: true,
  faceAttendance: true,
  selfieAttendance: false,
  workingRange: 100,
  attendanceCategory: null,
  employeeWorkingHours: [],
  employeeHolidays: [],
  reportingManager: [],
  managesEmployees: [],
  cycleType: null,
  approver: null,
});

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const roleOptions = ref([]);
const reportingManagerOptions = ref([]);

const handleVerificationUpdate = (data) => {
  formData.aadhar = data.aadhaar;
  formData.pan = data.pan;
  formData.voterID = data.voterId;
  formData.uan = data.uan;
  formData.gst = data.gst;
};

const handleVerificationComplete = (data) => {
  handleVerificationUpdate(data);
  alert("Verification completed successfully!");
};
async function fetchLeavePolicies() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const currentYear = new Date().getFullYear();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveSetting?filter[_and][0][_and][0][tenant][tenantId][_eq]=${resolvedTenantId}&filter[_and][0][_and][1][year(yearOfPolicy)][_eq]=${currentYear}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch leave policies");
    }

    const data = await response.json();

    // Preserve existing changes when refreshing data
    const currentChanges = new Map(leaveChanges.value);

    enabledLeaves.value = data.data
      .filter((leave) => leave.leaveConfig?.isEnabled)
      .map((leave) => {
        const existingChange = currentChanges.get(leave.id);
        return {
          ...leave,
          isAssigned: existingChange?.isAssigned ?? leave.isAssigned ?? false,
          leaveConfig: {
            ...leave.leaveConfig,
            days: existingChange?.days ?? leave.leaveConfig?.days ?? 0,
          },
        };
      });
  } catch (error) {
    console.error("Error fetching leave policies:", error);
    enabledLeaves.value = [];
  }
}
const handleLeaveToggle = (leave) => {
  // Store the change locally
  const existingChange = leaveChanges.value.get(leave.id) || {};
  leaveChanges.value.set(leave.id, {
    ...existingChange,
    isAssigned: leave.isAssigned,
    days: leave.isAssigned
      ? (existingChange.days ?? leave.leaveConfig?.days ?? 0)
      : 0,
  });

  hasUnsavedLeaveChanges.value = true;
  console.log(`Leave ${leave.leaveName} toggled to ${leave.isAssigned}`);
};
const toggleLeaveEdit = (leave) => {
  if (leave.isEditing) {
    saveLeaveEdit(leave);
  } else {
    const existingChange = leaveChanges.value.get(leave.id) || {};
    leaveChanges.value.set(leave.id, {
      ...existingChange,
      isEditing: true,
    });
  }
};
const saveLeaveEdit = (leave) => {
  const existingChange = leaveChanges.value.get(leave.id) || {};
  leaveChanges.value.set(leave.id, {
    ...existingChange,
    isEditing: false,
    days: leave.leaveConfig.days,
  });
  hasUnsavedLeaveChanges.value = true;
};
const updateLeaveBalance = (leave) => {
  if (leave.isAssigned && leave.leaveConfig?.days !== undefined) {
    console.log(
      `Updating ${leave.leaveName} balance to ${leave.leaveConfig.days} days`
    );

    const existingChange = leaveChanges.value.get(leave.id) || {};
    leaveChanges.value.set(leave.id, {
      ...existingChange,
      days: leave.leaveConfig.days,
    });
    hasUnsavedLeaveChanges.value = true;
  }
};
const getLeavesPayload = () => {
  const leavesPayload = {
    leaveBalance: {},
    CarryForwardleave: {},
    leaveTaken: {},
    monthLimit: {},
    assignedLeave: [],
    year: null,
  };

  if (processedLeaves.value && processedLeaves.value.length > 0) {
    leavesPayload.year = new Date(processedLeaves.value[0].yearOfPolicy)
      .getFullYear()
      .toString();

    processedLeaves.value.forEach((leave) => {
      const leaveType = leave.leaveName.toLowerCase().replace(/\s+/g, "");

      // Use the changed values if they exist, otherwise use original
      const leaveChange = leaveChanges.value.get(leave.id);
      const isAssigned = leaveChange?.isAssigned ?? leave.isAssigned;
      const days = leaveChange?.days ?? leave.leaveConfig?.days;

      leavesPayload.leaveBalance[leaveType] = days || 0;
      leavesPayload.CarryForwardleave[leaveType] =
        leave.leaveConfig?.limit || 0;
      leavesPayload.leaveTaken[`t${leaveType}`] = leave.leaveConfig?.taken || 0;
      leavesPayload.monthLimit[leaveType] = leave.leaveConfig?.monthLimit || 0;

      if (isAssigned === true) {
        leavesPayload.assignedLeave.push(leave.leaveName);
      }
    });

    // Clear changes after successful save
    leaveChanges.value.clear();
    hasUnsavedLeaveChanges.value = false;
  }

  return leavesPayload;
};
const currentYear = new Date().getFullYear();
const maxDate = computed(() => {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18;
  return `${maxYear}-12-31`;
});

const minDate = computed(() => {
  const currentYear = new Date().getFullYear();
  return `${currentYear - 100}-01-01`;
});

const rules = {
  required: (value) => !!value || "This field is required",
  panFormat: (value) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(value) || "Invalid PAN format";
  },
  voterIdFormat: (value) => {
    const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;
    return !value || voterIdRegex.test(value) || "Invalid Voter ID format";
  },
  drivingLicenseFormat: (value) => {
    const drivingLicenseRegex = /^[A-Z]{2}[0-9]{13}$/;
    return (
      !value ||
      drivingLicenseRegex.test(value) ||
      "Invalid Driving License format"
    );
  },
  uanFormat: (value) => {
    const uanRegex = /^[0-9]{12}$/;
    return !value || uanRegex.test(value) || "Invalid UAN format";
  },
  aadharFormat: (value) => {
    const aadharRegex = /^[0-9]{12}$/;
    return aadharRegex.test(value) || "Invalid Aadhar format";
  },
};

const userTenant = computed(() => {
  return authService.getUserTenant();
});

const tabHasError = (tabId) => {
  if (!formSubmitAttempted.value) return false;
  if (!tabRequiredFields[tabId]) return false;

  return tabRequiredFields[tabId].some(
    (field) =>
      touchedFields.value[field] &&
      (!formData[field] || formErrors.value[field])
  );
};

const tabHasErrorComputed = computed(() => (tabId) => {
  if (!formSubmitAttempted.value) return false;
  return tabRequiredFields[tabId].some(
    (field) =>
      touchedFields.value[field] &&
      (!formData[field] || formErrors.value[field])
  );
});

const getFieldErrorMessage = (field) => {
  if (formData[field]) {
    formErrors.value[field] = "";
    return "";
  }
  if (formErrors.value[field] && touchedFields.value[field]) {
    return formErrors.value[field];
  }
  return "";
};

const handleInputChange = (field) => {
  if (field === "designation") {
    capitalizeFirstLetterEachWord(field);
  } else if (field === "assignedUser.DOB") {
    if (formData.assignedUser.DOB) {
      formErrors.value.DOB = "";
    }
  }
};

async function fetchDepartments(orgId = null) {
  try {
    const resolvedTenantId = await resolveTenantId();
    let filterQuery = `filter[tenant][tenantId][_eq]=${resolvedTenantId}`;
    if (orgId) {
      filterQuery = `filter[_and][0][tenant][tenantId][_eq]=${resolvedTenantId}`;
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );
    const data = await response.json();
    departmentOptions.value = data.data.map((dept) => ({
      id: dept.id,
      name: dept.departmentName || "Unnamed Department",
    }));
  } catch (error) {
    console.error("Error fetching departments:", error);
    departmentOptions.value = [];
  }
}

async function fetchLocations(orgId = null) {
  try {
    const resolvedTenantId = await resolveTenantId();
    let filterQuery = `filter[tenant][tenantId][_eq]=${resolvedTenantId}&filter[locType][_eq]=branch`;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );
    const data = await response.json();
    locationOptions.value = data.data.map((loc) => ({
      id: loc.id,
      name: `${loc.locdetail?.locationName || "Unnamed Location"} (${loc.locType || ""})`,
    }));
  } catch (error) {
    console.error("Error fetching locations:", error);
    locationOptions.value = [];
  }
}

async function fetchCycleTypes() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance cycles");
    }

    const data = await response.json();

    if (
      data.data &&
      data.data.length > 0 &&
      data.data[0].multi_attendance_cycle &&
      Array.isArray(data.data[0].multi_attendance_cycle.cycles)
    ) {
      cycleTypeOptions.value = data.data[0].multi_attendance_cycle.cycles.map(
        (cycle) => ({
          cycleId: cycle.cycleId,
          cycleName: cycle.cycleName,
        })
      );
      console.log("cycletypesformat", cycleTypeOptions);
    } else {
      console.warn("No cycles found in multi_attendance_cycle");
    }
  } catch (error) {
    console.error("Error fetching attendance cycles:", error);
    showErrorMessage("Failed to load attendance cycle options");
  }
}

const formatLeaveType = (leaveName) => {
  return leaveName.replace(/([A-Z])/g, " $1").trim();
};

async function fetchRoles() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/roles?filter[name][_neq]=Administrator&filter[_and][0][_and][0][name][_neq]=esslAdmin&filter[_and][2][name][_neq]=Dealer&`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );
    const data = await response.json();
    roleOptions.value = data.data.map((role) => ({
      id: role.id,
      name: role.name,
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
}

async function resolveTenantId() {
  if (props.tenantId instanceof Promise) {
    return await props.tenantId;
  }
  return props.tenantId;
}

const debounceFilter = debounce(filterReportingManagers, 300);

async function filterReportingManagers() {
  try {
    const resolvedTenantId = await resolveTenantId();
    let allManagers = [];
    let page = 1;
    const limit = 100;

    while (true) {
      let filters = [];

      if (selectedBranchFilter.value && selectedBranchFilter.value !== "all") {
        const selectedBranch = branchOptions.value.find(
          (branch) => branch.id === selectedBranchFilter.value
        );
        if (selectedBranch) {
          filters.push(
            `filter[_and][0][branch][branchName][_icontains]=${encodeURIComponent(selectedBranch.name)}`
          );
        }
      }

      if (
        selectedDepartmentFilter.value &&
        selectedDepartmentFilter.value !== "all"
      ) {
        const selectedDept = departmentOptions.value.find(
          (dept) => dept.id === selectedDepartmentFilter.value
        );
        if (selectedDept) {
          filters.push(
            `filter[_and][1][department][departmentName][_icontains]=${encodeURIComponent(selectedDept.name)}`
          );
        }
      }

      if (searchReportingManager.value) {
        filters.push(
          `filter[_and][2][assignedUser][first_name][_icontains]=${encodeURIComponent(searchReportingManager.value)}`
        );
      }

      const currentUserRole = authService.getUserRole();
      let roleFilter = "";

      if (currentUserRole === "Admin") {
        roleFilter = `&filter[assignedUser][role][name][_eq]=Manager`;
      } else if (currentUserRole === "Manager") {
        roleFilter = `&filter[_or][0][assignedUser][role][name][_eq]=Employee`;
        roleFilter += `&filter[_or][1][assignedUser][role][name][_eq]=Manager`;
      }

      const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${resolvedTenantId}${roleFilter}`;
      const fullFilter = `${baseFilter}${filters.length > 0 ? "&" + filters.join("&") : ""}`;

      const fields = [
        "id",
        "assignedUser.id",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "branch.id",
        "branch.branchName",
        "department.id",
        "department.departmentName",
      ].join(",");

      const pagination = `&limit=${limit}&page=${page}`;
      const url = `${import.meta.env.VITE_API_URL}/items/personalModule?${fullFilter}&fields=${fields}${pagination}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch reporting managers: ${response.statusText}`
        );
      }

      const data = await response.json();
      const currentPageManagers = data.data || [];
      allManagers = [...allManagers, ...currentPageManagers];

      if (currentPageManagers.length < limit) {
        break;
      }
      page++;
    }

    reportingManagerOptions.value = allManagers
      .filter((item) => item.assignedUser?.id && item.assignedUser?.first_name)
      .map((item) => ({
        id: item.assignedUser.id,
        name: item.assignedUser.first_name.trim(),
        role: item.assignedUser?.role?.name || "",
        departmentId: item.department?.id || null,
        departmentName: item.department?.departmentName || "",
        branchId: item.branch?.id || null,
        branchName: item.branch?.branchName || "",
      }));
  } catch (error) {
    console.error("Error filtering reporting managers:", error);
    reportingManagerOptions.value = [];
    showErrorMessage("Failed to load reporting managers. Please try again.");
  }
}

async function filterManagesEmployee() {
  try {
    const resolvedTenantId = await resolveTenantId();
    let allEmployees = [];
    let page = 1;
    const limit = 100;

    while (true) {
      let filters = [];

      if (
        selectedManagesEmployeeBranchFilter.value &&
        selectedManagesEmployeeBranchFilter.value !== "all"
      ) {
        const selectedEmployeesBranch = branchOptions.value.find(
          (branch) => branch.id === selectedManagesEmployeeBranchFilter.value
        );
        if (selectedEmployeesBranch) {
          filters.push(
            `filter[_and][0][branch][branchName][_icontains]=${selectedEmployeesBranch.name}`
          );
        }
      }

      if (
        selectedManagesEmployeeDepartmentFilter.value &&
        selectedManagesEmployeeDepartmentFilter.value !== "all"
      ) {
        const selectedDept = departmentOptions.value.find(
          (dept) => dept.id === selectedManagesEmployeeDepartmentFilter.value
        );
        if (selectedDept) {
          filters.push(
            `filter[_and][1][department][departmentName][_icontains]=${selectedDept.name}`
          );
        }
      }

      if (searchManagesEmployee.value) {
        filters.push(
          `filter[_and][2][assignedUser][first_name][_icontains]=${searchManagesEmployee.value}`
        );
      }

      const currentUserRole = authService.getUserRole();
      let roleFilter = "";

      if (currentUserRole === "Admin") {
        roleFilter = `&filter[assignedUser][role][name][_eq]=Manager`;
      } else if (currentUserRole === "Manager") {
        roleFilter = `&filter[assignedUser][role][name][_eq]=Employee`;
      }

      const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${resolvedTenantId}${roleFilter}`;
      const fullFilter = `${baseFilter}${filters.length > 0 ? "&" + filters.join("&") : ""}`;

      const fields = [
        "id",
        "assignedUser.id",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "branch.id",
        "branch.branchName",
        "department.id",
        "department.departmentName",
      ].join(",");

      const pagination = `&limit=${limit}&page=${page}`;
      const url = `${import.meta.env.VITE_API_URL}/items/personalModule?${fullFilter}&fields=${fields}${pagination}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      const data = await response.json();
      const currentPageEmployees = data.data || [];
      allEmployees = [...allEmployees, ...currentPageEmployees];

      if (currentPageEmployees.length < limit) {
        break;
      }
      page++;
    }

    managesEmployeeOptions.value = allEmployees.map((item) => ({
      id: item.assignedUser?.id || "",
      name: `${item.assignedUser?.first_name || ""}`.trim(),
      role: item.assignedUser?.role?.name || "",
      departmentId: item.department?.id || null,
      departmentName: item.department?.departmentName || "",
      branchId: item.branch?.id || null,
      branchName: item.branch?.branchName || "",
    }));
  } catch (error) {
    console.error("Error filtering manages employees:", error);
    managesEmployeeOptions.value = [];
  }
}

async function filterApprovers() {
  try {
    const resolvedTenantId = await resolveTenantId();
    let allApprovers = [];
    let page = 1;
    const limit = 100;

    while (true) {
      let filters = [];

      if (
        selectedApproverDepartmentFilter.value &&
        selectedApproverDepartmentFilter.value !== "all"
      ) {
        const selectedDept = departmentOptions.value.find(
          (dept) => dept.id === selectedApproverDepartmentFilter.value
        );
        if (selectedDept) {
          filters.push(
            `filter[_and][0][department][departmentName][_icontains]=${encodeURIComponent(selectedDept.name)}`
          );
        }
      }

      if (searchApprover.value) {
        filters.push(
          `filter[_and][1][assignedUser][first_name][_icontains]=${encodeURIComponent(searchApprover.value)}`
        );
      }

      filters.push(`filter[_and][2][assignedUser][role][name][_neq]=Admin`);

      const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${resolvedTenantId}`;
      const fullFilter = `${baseFilter}${filters.length > 0 ? "&" + filters.join("&") : ""}`;

      const fields = [
        "id",
        "assignedUser.id",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "department.id",
        "department.departmentName",
        "accessOn",
      ].join(",");

      const pagination = `&limit=${limit}&page=${page}`;
      const url = `${import.meta.env.VITE_API_URL}/items/personalModule?${fullFilter}&fields=${fields}${pagination}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch approvers: ${response.statusText}`);
      }

      const data = await response.json();
      const currentPageApprovers = data.data || [];
      allApprovers = [...allApprovers, ...currentPageApprovers];
      console.log("approvers", allApprovers);
      if (currentPageApprovers.length < limit) {
        break;
      }
      page++;
    }

    approverOptions.value = allApprovers
      .filter((item) => item.assignedUser?.id && item.assignedUser?.first_name)
      .map((item) => ({
        id: item.assignedUser.id,
        name: item.assignedUser.first_name.trim(),
        role: item.assignedUser?.role?.name || "",
        departmentId: item.department?.id || null,
        departmentName: item.department?.departmentName || "",
      }));
  } catch (error) {
    console.error("Error filtering approvers:", error);
    approverOptions.value = [];
    showErrorMessage("Failed to load approvers. Please try again.");
  }
}

const markFieldAsTouched = (field) => {
  touchedFields.value[field] = true;
  if (!formData[field] && tabRequiredFields[currentTab.value].includes(field)) {
    formErrors.value[field] = "This field is required";
  }
};

const generateDefaultEmail = () => {
  const firstName = formData.firstName?.toLowerCase() || "user";
  const lastName = formData.lastName?.toLowerCase() || "";
  const employeeId = formData.employeeId || "001";

  // Clean the names and ID to ensure valid email format
  const cleanFirstName = firstName.replace(/[^a-z0-9]/g, "");
  const cleanLastName = lastName.replace(/[^a-z0-9]/g, "");
  const cleanEmployeeId = employeeId.replace(/[^a-z0-9]/g, "");

  if (cleanLastName) {
    return `${cleanFirstName}.${cleanLastName}.${cleanEmployeeId}@fieldops.com`;
  } else {
    return `${cleanFirstName}.${cleanEmployeeId}@fieldops.com`;
  }
};

async function saveEmployee() {
  formSubmitAttempted.value = true;

  const mandatoryFields = ["firstName", "gender", "employeeId"];
  let hasErrors = false;

  mandatoryFields.forEach((field) => {
    if (!formData[field]) {
      hasErrors = true;
      formErrors.value[field] = "This field is required";
      touchedFields.value[field] = true;
    }
  });

  let isPhoneValid = true;
  if (formData.phone && formData.phone.trim() !== "") {
    isPhoneValid = await validatePhone();
  }

  // Only validate email if it has a value
  let isEmailValid = true;
  if (formData.email && formData.email.trim() !== "") {
    isEmailValid = await validateEmail();
  }

  if (!isPhoneValid || !isEmailValid) {
    hasErrors = true;
  }

  if (formData.assignedUser.DOB) {
    const selectedDate = new Date(formData.assignedUser.DOB);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    const hasBirthdayOccurred =
      today.getMonth() > selectedDate.getMonth() ||
      (today.getMonth() === selectedDate.getMonth() &&
        today.getDate() >= selectedDate.getDate());
    const actualAge = hasBirthdayOccurred ? age : age - 1;

    if (actualAge < 18) {
      hasErrors = true;
      formErrors.value.DOB = "Employee must be at least 18 years old";
      touchedFields.value.DOB = true;
    } else {
      formErrors.value.DOB = "";
    }
  }

  if (
    formData.pan &&
    formData.pan.trim() !== "" &&
    !rules.panFormat(formData.pan)
  ) {
    hasErrors = true;
    formErrors.value.pan = "Invalid PAN format (e.g., ABCDE1234F)";
    touchedFields.value.pan = true;
  }

  if (
    formData.aadhar &&
    formData.aadhar.trim() !== "" &&
    !rules.aadharFormat(formData.aadhar)
  ) {
    hasErrors = true;
    formErrors.value.aadhar = "Invalid Aadhar format (12 digits required)";
    touchedFields.value.aadhar = true;
  }

  if (
    formData.voterID &&
    formData.voterID.trim() !== "" &&
    !rules.voterIdFormat(formData.voterID)
  ) {
    hasErrors = true;
    formErrors.value.voterID = "Invalid Voter ID format (e.g., ABC1234567)";
    touchedFields.value.voterID = true;
  }

  if (
    formData.drivingLicense &&
    formData.drivingLicense.trim() !== "" &&
    !rules.drivingLicenseFormat(formData.drivingLicense)
  ) {
    hasErrors = true;
    formErrors.value.drivingLicense =
      "Invalid Driving License format (e.g., AB1234567890123)";
    touchedFields.value.drivingLicense = true;
  }

  if (
    formData.uan &&
    formData.uan.trim() !== "" &&
    !rules.uanFormat(formData.uan)
  ) {
    hasErrors = true;
    formErrors.value.uan = "Invalid UAN format (12 digits required)";
    touchedFields.value.uan = true;
  }

  if (hasErrors) {
    showErrorMessage("Please fix all validation errors before saving");
    return;
  }

  await createNewEmployee();
}

const reportingManagerIds = Array.isArray(formData.reportingManager)
  ? formData.reportingManager
      .map((manager) => (typeof manager === "object" ? manager.id : manager))
      .filter((id) => id)
  : [];

async function createNewEmployee() {
  try {
    console.log("Starting createNewEmployee function");

    const resolvedTenantId = await resolveTenantId();
    console.log("Resolved Tenant ID:", resolvedTenantId);

    const cycleTypeToSave = formData.cycleType || 1;
    console.log("Cycle Type to Save:", cycleTypeToSave);

    const selectedDepartment = departmentOptions.value.find(
      (dept) => dept.id === formData.department
    );
    console.log("Selected Department:", selectedDepartment);

    const selectedBranchLocation = locationOptions.value.find(
      (loc) => loc.id === formData.branchLocation
    );
    console.log("Selected Branch Location:", selectedBranchLocation);

    const selectedRole = roleOptions.value.find(
      (role) => role.name === formData.role
    ) || { id: "f667b169-c66c-4ec1-bef9-1831c1647c0d" };
    console.log("Selected Role:", selectedRole);
    const leavesPayload = getLeavesPayload();
    const reportingManagerIds = Array.isArray(formData.reportingManager)
      ? formData.reportingManager
          .map((manager, index) => {
            console.log(`Processing Reporting Manager ${index + 1}:`, manager);
            if (typeof manager === "object") return manager.id;
            if (typeof manager === "string" && manager.trim() !== "")
              return manager;
            return null;
          })
          .filter((id) => id && typeof id === "string")
      : [];
    console.log("Reporting Manager IDs:", reportingManagerIds);

    const payload = {
      status: formData.status,
      employeeId: formData.employeeId,
      accessOn: formData.accessOn,
      QrAttendance: formData.QrAttendance,
      GeoAttendance: formData.GeoAttendance,
      faceAttendance: formData.faceAttendance,
      selfieAttendance: formData.selfieAttendance,
      uniqueId: `${resolvedTenantId}-${formData.employeeId}`,
      config: formData.attendanceCategory,
      attendancePolicyHistory: { status: "published" },
      workingRange: formData.workingRange,
      leaves: leavesPayload,
      reportingManager: reportingManagerIds,
      managesEmployees: Array.isArray(formData.managesEmployees)
        ? formData.managesEmployees
            .map((employee, index) => {
              console.log(
                `Processing Managed Employee ${index + 1}:`,
                employee
              );
              return typeof employee === "object" ? employee.id : employee;
            })
            .filter((id) => id)
        : [],
      cycleType: cycleTypeToSave,
      approver: formData.approver,
    };
    console.log("Main Payload:", payload);

    if (
      formData.employeeWorkingHours &&
      formData.employeeWorkingHours.length > 0
    ) {
      const attendanceSettingsData = { tenant: resolvedTenantId };
      formData.employeeWorkingHours.forEach((day, index) => {
        console.log(`Processing Working Hour Day ${index + 1}:`, day);
        attendanceSettingsData[`is${day.name}`] = !day.isWorking;
        if (day.isWorking && day.shifts && day.shifts.length > 0) {
          attendanceSettingsData[`${day.key}J`] = {
            shifts: day.shifts.map((s) => {
              console.log(`Processing Shift for ${day.name}:`, s);
              return s.id.toString();
            }),
          };
        } else {
          attendanceSettingsData[`${day.key}J`] = { shifts: [] };
        }
      });
      payload.attendanceSettings = attendanceSettingsData;
      console.log("Attendance Settings Data:", attendanceSettingsData);
    }

    if (selectedBranchLocation?.id) {
      payload.branchLocation = selectedBranchLocation.id;
      console.log("Added Branch Location to Payload:", payload.branchLocation);
    }
    if (selectedDepartment?.id) {
      payload.department = selectedDepartment.id;
      console.log("Added Department to Payload:", payload.department);
    }

    const userData = {
      first_name: formData.firstName,
      middle_name: formData.middleName,
      last_name: formData.lastName,
      email: formData.email || generateDefaultEmail(),
      phone: `+91${formData.phone}`,
      appAccess: formData.appAccess,
      password: `${formData.phone}`,
      role: selectedRole?.id,
      userApp: "accesseasy",
      tenant: resolvedTenantId,
      officeEmail: formData.officeEmail,
      designation: formData.designation,
      skilled: formData.skilled,
      permanent_Address: formData.permanentAddress,
      current_Address: formData.currentAddress,
      UAN: formData.uan,
      voter_ID: formData.voterID,
      driving_License: formData.drivingLicense,
      emergency_Contact_Address: formData.emergencyContactAddress,
      emergency_Contact_Relationship: formData.emergencyContactRelationship,
      emergency_Contact_Mobile_Number: formData.emergencyContactMobileNumber,
      guardians_Name: formData.guardiansName,
      ESIAccountNumber: formData.ESIAccountNumber,
      PFAccountNumber: formData.PFAccountNumber,
      shopAccount: formData.shopAccount,
      verification: [], // Assuming verifications array is still needed
      previousExperiences:
        formData.previousRecords.length > 0 ? formData.previousRecords : [],
      reportingManager: reportingManagerIds,
      approver: formData.approver,

      DOB: formData.assignedUser?.DOB || formData.DOB,
    };
    console.log("User Data:", userData);

    if (currentAvatarId.value) {
      userData.avatar = currentAvatarId.value;
      console.log("Added Avatar ID to User Data:", userData.avatar);
    }
    if (formData.gender) {
      userData.gender = formData.gender;
      console.log("Added Gender to User Data:", userData.gender);
    }
    if (formData.DOB) {
      userData.DOB = formData.DOB;
      console.log("Added DOB to User Data:", userData.DOB);
    }
    if (formData.maritalStatus) {
      userData.maritalStatus = formData.maritalStatus;
      console.log("Added Marital Status to User Data:", userData.maritalStatus);
    }
    if (formData.bloodGroup) {
      userData.bloodGroup = formData.bloodGroup;
      console.log("Added Blood Group to User Data:", userData.bloodGroup);
    }
    if (formData.dateOfJoining) {
      userData.dateOfJoining = formData.dateOfJoining;
      console.log(
        "Added Date of Joining to User Data:",
        userData.dateOfJoining
      );
    }
    if (formData.dateOfLeaving) {
      userData.dateOfLeaving = formData.dateOfLeaving;
      console.log(
        "Added Date of Leaving to User Data:",
        userData.dateOfLeaving
      );
    }
    payload.assignedUser = { ...userData };
    console.log("Final Payload before API call:", payload);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      }
    );
    console.log("API Response Status:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to save employee data"
      );
    }

    const responseData = await response.json();
    const createdEmployeeId = responseData.data.id;
    console.log("Created Employee ID:", createdEmployeeId);

    // Additional POST call to SalaryBreakdown using createdEmployeeId
    const salaryBreakdownPayload = {
      // TODO: Populate with actual salary breakdown data from formData or other sources
      // For example: basicSalary: formData.basicSalary, allowances: formData.allowances, etc.
      employee: createdEmployeeId, // Assuming this links to the employee
      // Add other required fields here based on your SalaryBreakdown schema
    };
    console.log("Salary Breakdown Payload:", salaryBreakdownPayload);

    const salaryResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(salaryBreakdownPayload),
      }
    );
    console.log(
      "Salary Breakdown API Response Status:",
      salaryResponse.status,
      salaryResponse.statusText
    );

    if (!salaryResponse.ok) {
      const salaryErrorData = await salaryResponse.json();
      console.error("Salary Breakdown API Error Response:", salaryErrorData);
      // Optionally, decide whether to throw or continue (e.g., if salary is optional)
      // throw new Error(salaryErrorData.errors?.[0]?.message || "Failed to save salary breakdown");
      console.warn(
        "Salary breakdown creation failed, but continuing with employee creation."
      );
    } else {
      const salaryResponseData = await salaryResponse.json();
      console.log("Salary Breakdown Created Successfully:", salaryResponseData);
    }

    if (selectedAvatarFile.value) {
      console.log("Starting Avatar Upload for Employee ID:", createdEmployeeId);
      try {
        const avatarId = await handleAvatarUpload(createdEmployeeId);
        console.log("Avatar Upload Result - Avatar ID:", avatarId);
        if (avatarId) {
          const personalModuleResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/personalModule/${createdEmployeeId}?fields[]=assignedUser.id`,
            {
              headers: {
                Authorization: `Bearer ${authService.getToken()}`,
              },
            }
          );
          console.log(
            "Personal Module Response Status:",
            personalModuleResponse.status
          );
          if (!personalModuleResponse.ok) {
            throw new Error("Failed to fetch personal module data");
          }
          const personalModuleData = await personalModuleResponse.json();
          console.log("Personal Module Data:", personalModuleData);
          const userId = personalModuleData.data.assignedUser.id;
          console.log("User ID from Personal Module:", userId);
          if (!userId) {
            throw new Error("User ID not found in personal module data");
          }
          const avatarUpdateResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/users/${userId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authService.getToken()}`,
              },
              body: JSON.stringify({ avatar: avatarId }),
            }
          );
          console.log(
            "Avatar Update Response Status:",
            avatarUpdateResponse.status
          );
          if (!avatarUpdateResponse.ok) {
            throw new Error("Failed to update user with avatar ID");
          }
          console.log("Avatar successfully updated for User ID:", userId);
        }
      } catch (error) {
        console.error("Error handling avatar upload:", error);
        showErrorMessage(
          `Avatar upload completed, but couldn't update profile picture: ${error.message}`
        );
      }
    }

    console.log("Employee Creation Successful");
    showSuccessMessage("Employee added successfully!");
    setTimeout(() => {
      console.log("Emitting save-success event");
      emit("save-success");
    }, 2000);
  } catch (error) {
    console.error("Error in createNewEmployee:", error);
    showErrorMessage(
      `An error occurred while saving the employee data: ${error.message}`
    );
  }
}

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      selectedAvatarFile.value = file;
      avatarImage.value = URL.createObjectURL(file);
      event.target.value = "";
    } catch (error) {
      console.error("Error handling avatar change:", error);
      alert("Failed to process avatar. Please try again.");
    }
  }
};

const handleAvatarUpload = async (personalModuleId) => {
  if (!selectedAvatarFile.value) return null;

  try {
    const file = selectedAvatarFile.value;
    const tenantId = await resolveTenantId();
    const profileFolderId = await getProfileFolderId(tenantId);

    const formData = new FormData();
    if (profileFolderId) {
      formData.append("folder", profileFolderId);
    }

    const fileExtension = file.name.split(".").pop();
    const customFileName = `${personalModuleId}-${tenantId}.${fileExtension}`;
    formData.append("file", file, customFileName);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload avatar");
    }

    const data = await response.json();
    return data.data.id;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
};

async function getProfileFolderId(tenantId) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields[]=foldersId`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tenant data");
    }

    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].foldersId) {
      const profilesFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Profiles"
      );
      return profilesFolder ? profilesFolder.id : null;
    }

    return null;
  } catch (error) {
    console.error("Error fetching profile folder ID:", error);
    return null;
  }
}

const activeTab = ref("working-hours");
const weekDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

onMounted(async () => {
  userRole.value = authService.getUserRole() || "Employee";

  // Load initial data for the first tab
  await loadTabData(currentTab.value);
  formData.tenantName = authService.getTenantName();
});

watch(
  () => formData.accessOn,
  (newValue) => {
    formData.status = newValue ? "true" : "false";
  },
  { immediate: true }
);

watch(
  [() => formData.faceAttendance, () => formData.selfieAttendance],
  ([faceValue, selfieValue], [prevFaceValue, prevSelfieValue]) => {
    if (faceValue && selfieValue) {
      // If both became true, revert the one that just changed
      if (faceValue !== prevFaceValue) {
        formData.selfieAttendance = false;
      } else if (selfieValue !== prevSelfieValue) {
        formData.faceAttendance = false;
      }
    }
  },
  { deep: true }
);

watch(
  formData,
  (newVal) => {
    Object.keys(newVal).forEach((field) => {
      if (newVal[field] && formErrors.value[field]) {
        formErrors.value[field] = "";
      }
    });
  },
  { deep: true }
);

watch(
  () => formData.role,
  (newRole, oldRole) => {
    if (newRole !== oldRole) {
      formData.approver = null;
      filterApprovers();
    }
  }
);

watch(currentTab, (newTab, oldTab) => {
  if (oldTab && tabRequiredFields[oldTab]) {
    const mandatoryFields = tabRequiredFields[oldTab];
    if (Array.isArray(mandatoryFields)) {
      mandatoryFields.forEach((field) => {
        if (!formData[field]) {
          touchedFields.value[field] = true;
          formErrors.value[field] = "This field is required";
        }
      });
    }
  }

  if (newTab === "company") {
    filterReportingManagers();
    filterManagesEmployee();
    filterApprovers();
  }

  if (newTab === "LeavePolicy") {
    fetchLeavePolicies();
  }
});

onUnmounted(() => {
  // Cleanup if needed
});
</script>

<style scoped>
.tab-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
}

.tab-loading-container p {
  margin-top: 16px;
  font-size: 14px;
}

.tab-loading-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tab-item--loading {
  opacity: 0.7;
  pointer-events: none;
}
.breadcrum {
  cursor: pointer;
}
.detail-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: #f8f9fa;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.card-body {
  padding: 24px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.avatar-section {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper-large {
  position: relative;
  margin-bottom: 16px;
}

/* Square Avatar Styles */
.avatar-large.square-avatar {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder-large {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.edit-avatar-btn-large {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.fields-container {
  flex: 1;
  margin-left: 24px;
}

.name-role-row,
.contact-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: 16px;
}

.field-group {
  flex: 1;
  min-width: 200px;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 0.875rem;
}

.field-group-column {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dob-gender-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sub-field {
  flex: 1;
}

.address-field {
  min-width: 250px;
}

.filter-dropdown {
  background: white;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
}

/* Rest of your existing styles remain the same */
.employee-form-container {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  width: 100%;
  max-width: 100%;
}

.approver-search {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-heade {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.form-content {
  flex: 1;
  /* height: calc(80vh - 70px); */
  /* overflow-y: auto; */
  overflow-x: hidden;
  border-radius: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.has-error {
  color: rgb(var(--v-theme-error));
}
tab-section {
}

.custom-tabs {
  background: transparent !important;
}

.custom-tabs :deep(.v-slide-group__container) {
  background: transparent !important;
}

.custom-tabs :deep(.v-slide-group__content) {
  background: transparent !important;
  padding: 0 !important;
  gap: 12px !important;
  width: fit-content;
  margin: 0 auto;
}

/* Individual tab as separate column with gaps */
.tab-item {
  background: #e8f5f0 !important; /* Light green background for unselected */
  /* border: 1px solid #d1e7dd !important; */
  border-radius: 8px !important;
  min-height: 48px !important;
  min-width: 200px !important;
  padding: 0 20px !important;
  margin: 0 !important;
  text-transform: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
}

/* Selected tab state */
.tab-item--active {
  background: #059367 !important; /* Your existing green */
  border-color: #059367 !important;
  box-shadow: 0 2px 8px rgba(5, 147, 103, 0.3);
}

/* Hover state for unselected tabs */
.tab-item:not(.tab-item--active):hover {
  background: #d1e7dd !important;
  border-color: #a3cfbb !important;
  transform: translateY(-1px);
}

.tab-conten {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

.tab-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-item--active .tab-text {
  color: white !important; /* White text for selected */
}
/* Unselected tab - black text and green icon */
.tab-item:not(.tab-item--active) .tab-icon {
  color: #059367 !important; /* Green icon for unselected */
}

.tab-item:not(.tab-item--active) .tab-text {
  color: #000000 !important; /* Black text for unselected */
}

/* Selected tab - white text and white icon */

.tab-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-error-icon {
  position: relative;
  z-index: 2;
}

/* Error state styles */
.tab-item--error:not(.tab-item--active) .tab-text {
  color: #d32f2f !important;
}

.tab-item--error:not(.tab-item--active) .tab-icon {
  color: #d32f2f !important;
}

.tab-item--error.tab-item--active .tab-error-icon {
  color: white !important;
}

/* Remove default Vuetify tab styles */
.custom-tabs :deep(.v-tab--selected) {
  color: transparent !important;
}

.custom-tabs :deep(.v-tab__slider) {
  display: none !important;
}

/* Ensure proper spacing and alignment */
.custom-tabs :deep(.v-tab) {
  opacity: 1 !important;
}

:deep(.v-list-item) {
  padding: 0px !important;
  margin-bottom: 4px;
  border-radius: 8px;
}

:deep(.v-input) {
  border-radius: 8px;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-input__prepend) {
  margin-right: 8px;
}

.v-list-item {
  padding: 0px !important;
  margin-bottom: 4px;
  border-radius: 8px;
}

.shift-details {
  padding: 8px 0;
}

.time-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

.no-shifts {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: #444343;
}

.leave-card {
  transition: transform 0.2s ease;
}

.leave-card:hover {
  transform: translateY(-2px);
}

:deep(.v-list-item.has-error) {
  background-color: rgba(244, 67, 54, 0.1) !important;
  color: #f44336 !important;
}

:deep(.v-list-item.has-error .v-list-item-title) {
  color: #f44336 !important;
}

:deep(.v-list-item.has-error .v-icon) {
  color: #f44336 !important;
}

:deep(.v-list-item.has-error.v-list-item--active) {
  background-color: rgba(244, 67, 54, 0.15) !important;
  color: #f44336 !important;
}

:deep(.v-list-item.has-error.v-list-item--active .v-list-item-title) {
  color: #f44336 !important;
}

:deep(.v-list-item.has-error.v-list-item--active .v-icon) {
  color: #f44336 !important;
}

.app-access-card,
.attendance-modes-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.app-access-switch :deep(.v-switch__track) {
  width: 48px;
  height: 24px;
  border-radius: 12px;
}

.app-access-switch :deep(.v-switch__thumb) {
  width: 20px;
  height: 20px;
}

.attendance-option {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.attendance-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.attendance-icon-wrapper.enabled {
  background-color: #059367;
}

.attendance-icon-wrapper.disabled {
  background-color: #f44336;
}

.attendance-switch {
  display: flex;
  justify-content: center;
}

.attendance-switch :deep(.v-switch__track) {
  width: 48px;
  height: 24px;
  border-radius: 12px;
}

.attendance-switch :deep(.v-switch__thumb) {
  width: 20px;
  height: 20px;
}

.attendance-switch :deep(.v-selection-control) {
  min-height: auto;
}

.v-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
@media (max-width: 768px) {
  .custom-tabs :deep(.v-slide-group__content) {
    gap: 8px !important;
  }

  .tab-item {
    min-width: 160px !important;
    padding: 0 16px !important;
    min-height: 44px !important;
  }

  .tab-text {
    font-size: 13px;
  }

  .tab-icon {
    size: 18px;
  }
}

/* Focus states for accessibility */
.tab-item:focus-visible {
  outline: 2px solid #059367;
  outline-offset: 2px;
}

.tab-item--active:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
</style>

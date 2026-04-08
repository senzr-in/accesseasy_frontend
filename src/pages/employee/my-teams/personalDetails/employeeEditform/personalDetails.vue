<template>
  <ToastNotification
    v-if="showSuccessToast"
    :show="showSuccessToast"
    :message="successMessage"
    type="success"
    @close="showSuccessToast = false"
  />
  <ToastNotification
    v-if="showErrorToast"
    :show="showErrorToast"
    :message="errorMessage"
    type="error"
    @close="showErrorToast = false"
  />

  <div class="personal-details">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="#059367"
          ></v-progress-circular>
          <p>Loading personal details...</p>
        </v-col>
      </v-row>
    </v-container>
    <v-container
      v-else-if="employeeData && employeeData.assignedUser"
      class="pa-4"
    >
      <!-- Employee Details Card -->
      <v-card class="mb-6" flat>
        <v-card-title class="text-h6 d-flex justify-space-between align-center">
          <span>Employee Details</span>
          <BaseButton
            :text="'Update'"
            variant="primary"
            :disabled="
              !hasChanges || phoneErrorMessage.value || emailErrorMessage.value
            "
            @click="updatePersonalDetails"
          />
        </v-card-title>
        <v-card-text>
          <v-row class="mb-6">
            <v-col cols="12" sm="3" class="d-flex justify-center">
              <div class="avatar-section">
                <div class="avatar-container">
                  <v-avatar size="160" class="avatar-image">
                    <v-img
                      v-if="avatarImage"
                      :src="avatarImage"
                      alt="Avatar"
                    ></v-img>
                    <v-icon
                      v-else
                      size="150"
                      color="grey lighten-1"
                      class="default-avatar"
                    >
                      mdi-account-tie
                    </v-icon>
                  </v-avatar>
                  <v-btn
                    icon
                    class="edit-avatar-btn"
                    @click="triggerFileInput"
                    color="white"
                  >
                    <v-icon>mdi-camera</v-icon>
                  </v-btn>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  style="display: none"
                  accept="image/*"
                  @change="handleAvatarChange"
                />
              </div>
            </v-col>
            <v-col cols="12" sm="9">
              <div class="profile-info">
                <!-- Editable Name Fields -->
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="employeeData.assignedUser.first_name"
                      :label="'First Name *'"
                      required
                      :error-messages="getFieldErrorMessage('first_name')"
                      variant="outlined"
                      density="comfortable"
                      @blur="markFieldAsTouched('first_name')"
                      @input="capitalizeFirstLetterEachWord('first_name')"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="employeeData.assignedUser.middleName"
                      :label="'Middle Name'"
                      variant="outlined"
                      density="comfortable"
                      @input="capitalizeFirstLetterEachWord('middleName')"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="employeeData.assignedUser.last_name"
                      :label="'Last Name'"
                      :error-messages="getFieldErrorMessage('last_name')"
                      variant="outlined"
                      density="comfortable"
                      @blur="markFieldAsTouched('last_name')"
                      @input="capitalizeFirstLetterEachWord('last_name')"
                    />
                  </v-col>
                </v-row>
                <!-- Editable Employee ID, Designation, Role -->
                <v-row class="mt-4">
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="employeeData.employeeId"
                      label="Employee ID *"
                      required
                      :error-messages="getFieldErrorMessage('employeeId')"
                      variant="outlined"
                      density="comfortable"
                      :disabled="isRoleDisabled"
                      @blur="markFieldAsTouched('employeeId')"
                      @input="handleInputChange('employeeId')"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="employeeData.assignedUser.designation"
                      label="Designation"
                      variant="outlined"
                      density="comfortable"
                      @input="capitalizeFirstLetterEachWord('designation')"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="selectedRole"
                      :items="roleOptions"
                      item-title="name"
                      item-value="id"
                      label="Role"
                      variant="outlined"
                      density="comfortable"
                      :disabled="isRoleDisabled"
                      @update:model-value="handleRoleChange"
                    />
                  </v-col>
                </v-row>
                <!-- Editable Phone and Email -->
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="displayPhone"
                      :label="'Phone'"
                      type="tel"
                      :error-messages="phoneErrorMessage"
                      variant="outlined"
                      density="comfortable"
                      @blur="validatePhone"
                      @input="clearPhoneError"
                      maxlength="10"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employeeData.assignedUser.email"
                      :label="'Email'"
                      :error-messages="emailErrorMessage"
                      variant="outlined"
                      density="comfortable"
                      @blur="validateEmail"
                      @input="
                        clearEmailError();
                        toLowerCase('email');
                      "
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row class="mt-4">
                  <v-col cols="12">
                    <v-card variant="outlined" class="pa-4">
                      <v-card-title
                        class="text-subtitle-1 font-weight-medium pa-0 mb-4"
                      >
                        Register Face Image
                      </v-card-title>
                      <v-card-text class="pa-0">
                        <v-row align="center">
                          <v-col cols="12" md="6">
                            <v-file-input
                              v-model="faceImageFile"
                              :label="'Upload Face Image'"
                              accept="image/*"
                              prepend-icon="mdi-camera"
                              variant="outlined"
                              density="comfortable"
                              :show-size="true"
                              :clearable="true"
                              @update:model-value="handleFaceImageUpload"
                              :error-messages="faceImageError"
                            ></v-file-input>
                          </v-col>
                          <v-col cols="12" md="6" class="text-center">
                            <div
                              v-if="faceImagePreview"
                              class="face-image-preview"
                            >
                              <v-img
                                :src="faceImagePreview"
                                max-width="150"
                                max-height="150"
                                class="mx-auto rounded"
                              ></v-img>
                              <v-btn
                                small
                                color="error"
                                variant="text"
                                @click="removeFaceImage"
                                class="mt-2"
                              >
                                Remove
                              </v-btn>
                            </div>
                            <div v-else class="text-caption text-grey">
                              No image selected
                            </div>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Personal Details Card -->
      <v-card class="mb-6" flat>
        <v-card-title class="text-h6">Personal Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="employeeData.assignedUser.bloodGroup"
                :items="['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']"
                label="Blood Group"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="employeeData.assignedUser.gender"
                :items="['Female', 'Male', 'Other']"
                label="Gender *"
                variant="outlined"
                density="comfortable"
                :error-messages="getFieldErrorMessage('gender')"
                @blur="markFieldAsTouched('gender')"
                @update:model-value="validateField('gender')"
                required
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="employeeData.assignedUser.maritalStatus"
                :items="['Single', 'Unmarried', 'Married']"
                label="Marital Status"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="employeeData.assignedUser.DOB"
                label="Date of Birth"
                type="date"
                variant="outlined"
                density="comfortable"
                :error-messages="getFieldErrorMessage('DOB')"
                :max="maxDate"
                :min="minDate"
                @input="handleInputChange('assignedUser.DOB')"
                @blur="markFieldAsTouched('DOB')"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="employeeData.assignedUser.permanent_Address"
                label="Permanent Address"
                rows="3"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-textarea>
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="employeeData.assignedUser.current_Address"
                label="Communications Address"
                rows="3"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Company Details Card -->
      <v-card flat>
        <v-card-title class="text-h6">Company Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="employeeData.assignedUser.dateOfJoining"
                label="Date of Joining"
                type="date"
                variant="outlined"
                density="comfortable"
                @input="handleDateOfJoiningChange"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedBranchLocation"
                :items="branchLocationOptions"
                item-title="name"
                item-value="id"
                label="Branch"
                variant="outlined"
                density="comfortable"
                @update:model-value="handleBranchLocationChange"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedDepartment"
                :items="departmentOptions"
                item-title="name"
                item-value="id"
                label="Department"
                variant="outlined"
                density="comfortable"
                @update:model-value="handleDepartmentChange"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedCycleType"
                :items="cycleTypeOptions"
                item-title="cycleName"
                item-value="cycleId"
                label="Attendance Cycle"
                variant="outlined"
                density="comfortable"
                @update:model-value="handleCycleTypeChange"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedReportingTo"
                :items="reportingToOptions"
                item-title="name"
                item-value="id"
                label="Approver"
                variant="outlined"
                density="comfortable"
                @update:model-value="handleReportingToChange"
                hide-details
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import SensitiveDataInput from "@/components/sensitiveData/sensitiveDataInput.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import ToastNotification from "@/components/common/notifications/ToastNotification.vue";
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
const orgOptions = ref([]);
const selectedOrganization = ref(null);
const dobMenu = ref(false);
const fileInput = ref(null);
const avatarImage = ref(null);
const loading = ref(true);
const originalEmployeeData = ref(null);
const roleOptions = ref([]);
const selectedRole = ref(null);
const showSuccessToast = ref(false);
const showErrorToast = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const isPanChecking = ref(false);
const isAadharChecking = ref(false);
const profilesFolderId = ref(null);
const currentAvatarFileId = ref(null);

const phoneErrorMessage = ref("");
const emailErrorMessage = ref("");
const workingRangeError = ref(""); // New ref for working range error

// Company details refs
const branchLocationOptions = ref([]);
const selectedBranchLocation = ref(null);
const departmentOptions = ref([]);
const selectedDepartment = ref(null);
const reportingToOptions = ref([]);
const selectedReportingTo = ref(null);
const cycleTypeOptions = ref([]);
const selectedCycleType = ref(null);
const changedFields = ref({});
const faceImageFile = ref(null);
const faceImagePreview = ref(null);
const faceImageError = ref("");
const faceImageBase64 = ref("");

// Add validation rules
const rules = {
  required: (v) => !!v || "This field is required",
  email: (v) => /.+@.+\..+/.test(v) || "Invalid email address",
  phone: (v) => /^\d{10}$/.test(v) || "Phone number must be 10 digits",
  panFormat: (v) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v) || "Invalid PAN format",
  aadharFormat: (v) => /^\d{12}$/.test(v) || "Invalid Aadhar format",
};
// Add validation state
const validationErrors = ref({});
const touchedFields = ref(new Set());

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessToast.value = true;
  // Auto hide after 3 seconds
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorToast.value = true;
  // Auto hide after 3 seconds
  setTimeout(() => {
    showErrorToast.value = false;
  }, 3000);
};

const isRoleDisabled = computed(() => {
  const currentUserRole = authService.getUserRole()?.toLowerCase();

  // If current user is not admin, disable the role field
  if (currentUserRole !== "admin") {
    return true;
  }

  return false;
});
// Add this method to handle image upload and conversion
const handleFaceImageUpload = (file) => {
  faceImageError.value = "";

  if (!file) {
    removeFaceImage();
    return;
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    faceImageError.value = "Please select a valid image file";
    removeFaceImage();
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    faceImageError.value = "Image size should be less than 5MB";
    removeFaceImage();
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    faceImagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  // Convert to Base64 for API
  const base64Reader = new FileReader();
  base64Reader.onload = (e) => {
    const base64String = e.target.result.split(",")[1]; // This extracts only the base64 part
    faceImageBase64.value = base64String;

    // Update the employee data with base64 string
    const updatedData = {
      ...props.employeeData,
      registeredFace: base64String,
    };
    emit("update:employeeData", updatedData);
  };
  base64Reader.onerror = () => {
    faceImageError.value = "Failed to process image";
    removeFaceImage();
  };
  base64Reader.readAsDataURL(file);
};

// Method to remove the uploaded image
const removeFaceImage = () => {
  faceImageFile.value = null;
  faceImagePreview.value = null;
  faceImageBase64.value = "";
  faceImageError.value = "";

  // Remove from employee data
  const updatedData = {
    ...props.employeeData,
    registeredFace: null,
  };
  emit("update:employeeData", updatedData);
};

// Add validation for face image if needed
const validateFaceImage = () => {
  if (faceImageFile.value && !faceImageBase64.value) {
    faceImageError.value = "Image processing failed. Please try again.";
    return false;
  }
  return true;
};
const showAadhaarView = ref(false);

const aadhaarData = ref({
  fullName: "",
  dateOfBirth: "",
  gender: "",
  fatherName: "",
  address: "",
  maskedAadhaar: "",
  verificationDate: "",
  status: "",
});

function toggleAadhaarView() {
  showAadhaarView.value = !showAadhaarView.value;
}

// async function fetchAadhaarData() {
//   try {
//     const user = props.employeeData.assignedUser;

//     aadhaarData.value = {
//       fullName: `${user.first_name} ${user.last_name || ""}`,
//       dateOfBirth: user.DOB || "",
//       gender: user.gender || "",
//       fatherName: "RAMAN KUMAR", // Replace with API value
//       address: "123, Main Street, Bangalore, Karnataka - 560001", // Replace with API value
//       maskedAadhaar: "XXXX-XXXX-1234", // Replace with API value
//       verificationDate: "15 March 2024", // Replace with API value
//       status: "Active",
//     };
//   } catch (error) {
//     console.error("Error fetching Aadhaar data:", error);
//   }
// }

const displayPhone = computed({
  get: () => {
    if (!props.employeeData?.assignedUser?.phone) return "";
    return props.employeeData.assignedUser.phone.replace(/^\+91/, "");
  },
  set: (value) => {
    const updatedData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        phone: value,
      },
    };
    emit("update:employeeData", updatedData);
    if (value && !/^\d{10}$/.test(value)) {
      phoneErrorMessage.value = "Phone number must be 10 digits";
    } else {
      phoneErrorMessage.value = "";
    }

    // Only validate uniqueness if the field has been touched
    if (touchedFields.value.has("phone")) {
      validateField("phone");
    }
  },
});

const maxDate = computed(() => {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18;
  return `${maxYear}-12-31`; // Set to the last day of the year 18 years ago
});

// Computed property for minDate (e.g., 100 years ago for reasonable range)
const minDate = computed(() => {
  const currentYear = new Date().getFullYear();
  return `${currentYear - 100}-01-01`; // Set to 100 years ago
});

// Set default DOB to January 1, 2000, if not set
const setDefaultDOB = () => {
  if (!props.employeeData?.assignedUser?.DOB) {
    const updatedData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        DOB: "2000-01-01",
      },
    };
    emit("update:employeeData", updatedData);
  }
};
const formattedDOB = computed(() => {
  if (!props.employeeData?.assignedUser?.DOB) return "";
  const date = new Date(props.employeeData.assignedUser.DOB);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const hasChanges = computed(() => {
  if (!originalEmployeeData.value || !props.employeeData) return false;

  const dataChanged =
    JSON.stringify(originalEmployeeData.value) !==
    JSON.stringify(props.employeeData);

  const faceImageChanged =
    faceImageBase64.value !== originalEmployeeData.value?.registerFaceImages;
  // Check all validation errors
  const hasValidationErrors =
    Object.values(validationErrors.value).some(
      (error) => error !== null && error !== ""
    ) ||
    phoneErrorMessage.value ||
    emailErrorMessage.value ||
    workingRangeError.value;

  return dataChanged && !hasValidationErrors;
});

// Handle working range slider change
const handleWorkingRangeChange = (newValue) => {
  const updatedData = {
    ...props.employeeData,
    workingRange: newValue,
  };
  emit("update:employeeData", updatedData);

  // Validate the new value
  if (newValue < 0 || newValue > 500) {
    workingRangeError.value = "Range must be between 0 and 500 meters";
  } else {
    workingRangeError.value = "";
  }
};

// Generate default email function
const generateDefaultEmail = () => {
  const firstName =
    props.employeeData?.assignedUser?.first_name?.toLowerCase() || "";
  const lastName =
    props.employeeData?.assignedUser?.last_name?.toLowerCase() || "";
  const employeeId = props.employeeData?.employeeId || "";

  if (lastName) {
    return `${firstName}${lastName}${employeeId}@samay.com`;
  } else {
    return `${firstName}${employeeId}@samay.com`;
  }
};

// Handle sensitive input changes (PAN, Aadhar)
// const handleSensitiveInputChange = (field) => {
//   touchedFields.value.add(field);
//   validateField(field);

//   if (field === "pan") {
//     toUpperCase("pan");
//   }
// };

// const checkPanExists = async () => {
//   const pan = props.employeeData?.assignedUser?.pan;
//   if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
//     return; // Don't check if PAN is invalid
//   }

//   // Skip check if it's the same as original PAN
//   if (originalEmployeeData.value?.assignedUser?.pan === pan) {
//     return;
//   }

//   isPanChecking.value = true;
//   try {
//     const token = authService.getToken();
//     const response = await fetch(
//       `${import.meta.env.VITE_API_URL}/users?filter[_and][0][pan][_eq]=${pan}&fields[]=pan`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     if (data.data && data.data.length > 0) {
//       validationErrors.value["pan"] = "PAN number already exists";
//       touchedFields.value.add("pan");

//       const updatedData = {
//         ...props.employeeData,
//         _validationState: {
//           ...props.employeeData._validationState,
//           personalDetails: false,
//         },
//       };

//       emit("update:employeeData", updatedData);
//     }
//   } catch (error) {
//     console.error("Error checking PAN:", error);
//   } finally {
//     isPanChecking.value = false;
//   }
// };

// Check if Aadhar already exists
// const checkAadharExists = async () => {
//   const aadhar = props.employeeData?.assignedUser?.aadhar;
//   if (!aadhar || !/^\d{12}$/.test(aadhar)) {
//     return; // Don't check if Aadhar is invalid
//   }

//   // Skip check if it's the same as original Aadhar
//   if (originalEmployeeData.value?.assignedUser?.aadhar === aadhar) {
//     return;
//   }

//   isAadharChecking.value = true;
//   try {
//     const token = authService.getToken();
//     const response = await fetch(
//       `${import.meta.env.VITE_API_URL}/users?filter[_and][0][aadhar][_eq]=${aadhar}&fields[]=aadhar`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     if (data.data && data.data.length > 0) {
//       validationErrors.value["aadhar"] = "Aadhar number already exists";
//       touchedFields.value.add("aadhar");

//       const updatedData = {
//         ...props.employeeData,
//         _validationState: {
//           ...props.employeeData._validationState,
//           personalDetails: false,
//         },
//       };

//       emit("update:employeeData", updatedData);
//     }
//   } catch (error) {
//     console.error("Error checking Aadhar:", error);
//   } finally {
//     isAadharChecking.value = false;
//   }
// };

// Fetch the Profiles folder ID from tenant data
const fetchProfilesFolderId = async () => {
  try {
    const token = authService.getToken();
    const tenantId = props.employeeData?.assignedUser?.tenant;

    if (!tenantId) {
      return null;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?limit=25&fields[]=tenantName&fields[]=tenantId&fields[]=foldersId&filter[_and][0][_and][0][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.length > 0 && data.data[0].foldersId) {
      // Find the Profiles folder
      const profilesFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Profiles"
      );

      if (profilesFolder) {
        profilesFolderId.value = profilesFolder.id;
        return profilesFolder.id;
      } else {
        console.error("Profiles folder not found in tenant data");
        return null;
      }
    } else {
      console.error("No folder structure found for tenant");
      return null;
    }
  } catch (error) {
    console.error("Error fetching profiles folder ID:", error);
    return null;
  }
};

const fetchEmployeeData = async () => {
  const token = authService.getToken();
  try {
    const fields = [
      "id",
      "employeeId",
      "assignedUser.id",
      "assignedUser.first_name",
      "assignedUser.middleName",
      "assignedUser.last_name",
      "assignedUser.phone",
      "assignedUser.email",
      "assignedUser.avatar.id",
      "assignedUser.avatar.type",
      "assignedUser.avatar.title",
      "assignedUser.gender",
      "assignedUser.DOB",
      "assignedUser.maritalStatus",
      "assignedUser.bloodGroup",
      "assignedUser.permanentAddress",
      "assignedUser.pan",
      "assignedUser.aadhar",
      "assignedUser.skilled",
      "assignedUser.officeEmail",
      "assignedUser.role.id",
      "assignedUser.role.name",
      "assignedUser.appAccess",
      "assignedUser.designation",
      "workingRange",
      "assignedUser.tenant",
      "assignedUser.permanent_Address",
      "assignedUser.current_Address",
      "assignedUser.organization.orgName",
      "assignedUser.emergency_Contact_Name",
      "assignedUser.emergency_Contact_Mobile_Number",
      "assignedUser.emergency_Contact_Relationship",
      "assignedUser.emergency_Contact_Address",
      "assignedUser.guardians_Name",
      "assignedUser.dateOfJoining",
      "assignedUser.dateOfLeaving",
      "department.id",
      "department.departmentName",
      "branchLocation.id",
      "branchLocation.locdetail",
      "branchLocation.locType",
      "reportingTo.id",
      "reportingTo.first_name",
      "cycleType",
      "registeredFace",
    ];

    const queryString = `fields[]=${fields.join("&fields[]=")}`;
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data) {
      if (!data.data.assignedUser?.id) {
        showErrorMessage(
          "Employee data is incomplete. Please refresh the page."
        );
        return;
      }

      // Ensure workingRange has a default value of 0 if null/undefined
      if (
        data.data.workingRange === null ||
        data.data.workingRange === undefined
      ) {
        data.data.workingRange = 0;
      }

      originalEmployeeData.value = JSON.parse(JSON.stringify(data.data));
      emit("update:employeeData", data.data);

      if (data.data.assignedUser?.avatar?.id) {
        currentAvatarFileId.value = data.data.assignedUser.avatar.id;
        await fetchAndSetAvatar();
      }
      if (data.data.registerFaceImages) {
        faceImageBase64.value = data.data.registeredFace;
        faceImagePreview.value = data.data.registeredFace; // This will show the image preview
      }
      selectedRole.value = data.data.assignedUser?.role?.id || null;

      // Set company details selected values
      selectedDepartment.value = data.data.department?.id || null;
      if (!selectedDepartment.value && data.data.department?.departmentName) {
        matchDepartmentByName(data.data.department.departmentName);
      }

      selectedBranchLocation.value = data.data.branchLocation?.id || null;
      if (
        !selectedBranchLocation.value &&
        data.data.branchLocation?.locdetail?.locationName
      ) {
        matchBranchLocationByName(
          data.data.branchLocation.locdetail.locationName
        );
      }

      selectedReportingTo.value = data.data.reportingTo?.id || null;
      await fetchCycleTypes();
      if (data.data.cycleType !== undefined && data.data.cycleType !== null) {
        selectedCycleType.value =
          typeof data.data.cycleType === "string"
            ? Number(data.data.cycleType)
            : data.data.cycleType;
      } else {
        selectedCycleType.value = null;
      }

      await fetchProfilesFolderId();
      await fetchBranchLocations();
      await fetchDepartments();
    } else {
      throw new Error("No employee data found");
    }
  } catch (err) {
    console.error("Error fetching employee data:", err);
  } finally {
    loading.value = false;
  }
};
const convertCycleType = (value) => {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const num = Number(value);
    return isNaN(num) ? value : num;
  }

  return value; // fallback for other types
};
async function fetchDepartments() {
  try {
    const tenantId = await currentUserTenant.getTenantId();
    const filterQuery = `filter[tenant][tenantId][_eq]=${tenantId}`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch departments");
    }

    const data = await response.json();
    departmentOptions.value = data.data.map((dept) => ({
      id: dept.id,
      name: dept.departmentName || "Unnamed Department",
    }));

    // Match department by name if needed
    if (
      props.employeeData?.department?.departmentName &&
      !selectedDepartment.value
    ) {
      matchDepartmentByName(props.employeeData.department.departmentName);
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    departmentOptions.value = [];
    showErrorMessage("Failed to load department options");
  }
}

const matchDepartmentByName = (departmentName) => {
  if (!departmentName || !departmentOptions.value.length) return;
  const matchedDept = departmentOptions.value.find(
    (dept) => dept.name.toLowerCase() === departmentName.toLowerCase()
  );
  if (matchedDept) {
    selectedDepartment.value = matchedDept.id;
  }
};

async function fetchBranchLocations() {
  try {
    const tenantId = await currentUserTenant.getTenantId();
    const filterQuery = `filter[tenant][tenantId][_eq]=${tenantId}&filter[locType][_eq]=branch`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch branch locations");
    }

    const data = await response.json();
    branchLocationOptions.value = data.data.map((loc) => ({
      id: loc.id,
      name: `${loc.locdetail?.locationName || ""} (${loc.locType || ""})`,
    }));

    // Match branch location by name if needed
    if (
      props.employeeData?.branchLocation?.locdetail?.locationName &&
      !selectedBranchLocation.value
    ) {
      matchBranchLocationByName(
        props.employeeData.branchLocation.locdetail.locationName
      );
    }
  } catch (error) {
    console.error("Error fetching branch locations:", error);
    branchLocationOptions.value = [];
    showErrorMessage("Failed to load branch location options");
  }
}

const matchBranchLocationByName = (locationName) => {
  if (!locationName || !branchLocationOptions.value.length) return;
  const matchedLoc = branchLocationOptions.value.find((loc) =>
    loc.name.toLowerCase().includes(locationName.toLowerCase())
  );
  if (matchedLoc) {
    selectedBranchLocation.value = matchedLoc.id;
  }
};

async function fetchReportingTo() {
  try {
    const tenantId = await currentUserTenant.getTenantId();
    let allReportingTo = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      let filters = [
        `filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}`,
      ];

      const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${tenantId}`;
      const fullFilter = `${filters.length > 0 ? "&" + filters.join("&") : ""}`;
      const fields = [
        "id",
        "assignedUser.id",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "department.id",
        "department.departmentName",
        "branchLocation.id",
        "branchLocation.locdetail",
      ].join("&fields[]=");

      const pagination = `&limit=${limit}&page=${page}`;
      const url = `${import.meta.env.VITE_API_URL}/items/personalModule?${fullFilter}&fields[]=${fields}${pagination}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reporting to: ${response.statusText}`);
      }

      const data = await response.json();
      const currentPage = data.data || [];
      allReportingTo = [...allReportingTo, ...currentPage];

      if (currentPage.length < limit) {
        hasMore = false;
      } else {
        page++;
      }
    }

    reportingToOptions.value = allReportingTo
      .filter(
        (item) => item.assignedUser?.id && item.assignedUser?.first_name && true // Adjust accessOn if needed
      )
      .map((item) => ({
        id: item.assignedUser.id,
        name: item.assignedUser.first_name.trim(),
        role: item.assignedUser?.role?.name || "",
        departmentId: item.department?.id || null,
        departmentName: item.department?.departmentName || "",
        branchLocationId: item.branchLocation?.id || null,
        branchLocationName: item.branchLocation?.locdetail?.locationName || "",
      }));
  } catch (error) {
    console.error("Error fetching reporting to:", error);
    reportingToOptions.value = [];
    showErrorMessage("Failed to load reporting to options. Please try again.");
  }
}

async function fetchCycleTypes() {
  try {
    const tenantId = await currentUserTenant.getTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[tenant][tenantId][_eq]=${tenantId}`,
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
    if (data.data && data.data.length > 0) {
      const firstItem = data.data[0];
      const multiAttendanceCycle = firstItem.multi_attendance_cycle;
      if (
        multiAttendanceCycle &&
        multiAttendanceCycle.cycles &&
        Array.isArray(multiAttendanceCycle.cycles)
      ) {
        cycleTypeOptions.value = multiAttendanceCycle.cycles.map((cycle) => ({
          cycleId: cycle.cycleId,
          cycleName: cycle.cycleName,
        }));

        // After fetching options, match the current cycleType to set selectedCycleType
        if (props.employeeData?.cycleType) {
          const matchedCycle = cycleTypeOptions.value.find(
            (cycle) => cycle.cycleId === props.employeeData.cycleType
          );
          if (matchedCycle) {
            selectedCycleType.value = matchedCycle.cycleId;
          }
        }
      } else {
        console.warn("No cycles found in multi_attendance_cycle");
      }
    } else {
      console.warn("No data found in response");
    }
  } catch (error) {
    console.error("Error fetching attendance cycles:", error);
    showErrorMessage("Failed to load attendance cycle options");
  }
}

// Company details change handlers
const handleBranchLocationChange = (newValue) => {
  const originalBranchLocation = originalEmployeeData.value.branchLocation?.id;
  if (newValue !== originalBranchLocation) {
    changedFields.value.branchLocation = newValue;
    const selectedLoc = branchLocationOptions.value.find(
      (l) => l.id === newValue
    );
    if (selectedLoc) {
      props.employeeData.branchLocation = {
        id: newValue,
        locdetail: { locationName: selectedLoc.name.split(" (")[0] },
        locType: selectedLoc.name.match(/\(([^)]+)\)/)?.[1] || "",
      };
    }
  } else {
    delete changedFields.value.branchLocation;
  }
};

const handleDepartmentChange = (newValue) => {
  const originalDept = originalEmployeeData.value.department?.id;
  if (newValue !== originalDept) {
    changedFields.value.department = newValue;
    const selectedDept = departmentOptions.value.find((d) => d.id === newValue);
    if (selectedDept) {
      props.employeeData.department = {
        id: newValue,
        departmentName: selectedDept.name,
      };
    }
  } else {
    delete changedFields.value.department;
  }
};

const handleReportingToChange = (newValue) => {
  const originalReportingTo =
    originalEmployeeData.value.reportingTo?.id || null;
  if (newValue !== originalReportingTo) {
    changedFields.value.reportingTo = newValue ? { id: newValue } : null;
  } else {
    delete changedFields.value.reportingTo;
  }
};

const handleDateOfJoiningChange = (newValue) => {
  if (newValue === "") {
    props.employeeData.assignedUser.dateOfJoining = null;
  }
  if (
    props.employeeData.assignedUser.dateOfJoining !==
    originalEmployeeData.value.assignedUser.dateOfJoining
  ) {
    changedFields.value["assignedUser.dateOfJoining"] =
      props.employeeData.assignedUser.dateOfJoining;
  } else {
    delete changedFields.value["assignedUser.dateOfJoining"];
  }
};

const handleDateOfLeavingChange = (newValue) => {
  if (newValue === "") {
    props.employeeData.assignedUser.dateOfLeaving = null;
  }
  if (
    props.employeeData.assignedUser.dateOfLeaving !==
    originalEmployeeData.value.assignedUser.dateOfLeaving
  ) {
    changedFields.value["assignedUser.dateOfLeaving"] =
      props.employeeData.assignedUser.dateOfLeaving;
  } else {
    delete changedFields.value["assignedUser.dateOfLeaving"];
  }
};

const handleCycleTypeChange = (newValue) => {
  const originalCycle = originalEmployeeData.value.cycleType;
  if (newValue !== originalCycle) {
    changedFields.value.cycleType = newValue;

    // Update the employee data with the selected cycle ID
    const updatedData = {
      ...props.employeeData,
      cycleType: newValue,
    };
    emit("update:employeeData", updatedData);
  } else {
    delete changedFields.value.cycleType;
  }
};
const verifiedGovData = ref({});
const fetchVerifiedGovernmentData = async () => {
  const token = authService.getToken();

  try {
    const tenantId = currentUserTenant.getTenantId();
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "id",
      "employee.id",
      "aadharDetails",
      "panDetails",
      // "voterIdDetails",
      // "uanDetails",
      // "drivingLicenseDetails",
      // "gstDetails",
    ];

    const queryString = `fields[]=${fields.join("&fields[]=")}&filter[employee][_eq]=${props.id}`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/verifiedGovernmentData?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if data exists and has the expected structure
    if (data.data && data.data.length > 0) {
      const rawData = data.data[0];

      // Transform the data to match your UI structure
      verifiedGovData.value = {
        id: rawData.id,
        employee: rawData.employee,
        // Map aadharDetails if it exists
        aadharDetails: rawData.aadharDetails
          ? {
              full_name: rawData.aadharDetails.full_name || "",
              care_of:
                rawData.aadharDetails.care_of ||
                rawData.aadharDetails.father_name ||
                "",
              dob: rawData.aadharDetails.dob || "",
              yob: rawData.aadharDetails.yob || "",
              zip: rawData.aadharDetails.zip || "",
              profile_image: rawData.aadharDetails.profile_image || "",
              gender: rawData.aadharDetails.gender || "",
              masked_aadhaar: rawData.aadharDetails.masked_aadhaar || "",
              full_address: rawData.aadharDetails.full_address || "",
              father_name:
                rawData.aadharDetails.father_name ||
                rawData.aadharDetails.care_of ||
                "",
              address: rawData.aadharDetails.address
                ? {
                    country: rawData.aadharDetails.address.country || "",
                    dist: rawData.aadharDetails.address.dist || "",
                    state: rawData.aadharDetails.address.state || "",
                    po: rawData.aadharDetails.address.po || "",
                    house: rawData.aadharDetails.address.house || "",
                    loc: rawData.aadharDetails.address.loc || "",
                    vtc: rawData.aadharDetails.address.vtc || "",
                    subdist: rawData.aadharDetails.address.subdist || "",
                    street: rawData.aadharDetails.address.street || "",
                    landmark: rawData.aadharDetails.address.landmark || "",
                  }
                : {},
            }
          : null,
        // Map panDetails if it exists
        panDetails: rawData.panDetails || null,
      };
    }
  } catch (err) {
    console.error("Error fetching verifiedGovernmentData:", err);
    showErrorMessage("Failed to load verified government data");

    // Set empty data structure on error
    verifiedGovData.value = {
      id: null,
      employee: null,
      aadharDetails: null,
      panDetails: null,
      voterIdDetails: null,
      uanDetails: null,
      drivingLicenseDetails: null,
      gstDetails: null,
      full_name: "",
      gender: "",
      dob: "",
      masked_aadhaar: "",
      care_of: "",
      address: {},
    };
  }
};

const fetchRoles = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/roles?filter[_and][0][name][_neq]=Administrator&filter[_and][1][name][_neq]=esslAdmin&&filter[_and][2][name][_neq]=Dealer`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );
    const data = await response.json();
    roleOptions.value = data.data.map((role) => ({
      id: role.id,
      name: role.name || "Unnamed Role",
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
    roleOptions.value = [];
  }
};

const fetchAuthorizedImage = async (url) => {
  const token = authService.getToken();
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

// Delete the previous avatar file if it exists
const deleteOldAvatarFile = async (fileId) => {
  if (!fileId) return;

  try {
    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/files/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to delete old avatar file: ${response.status}`);
    } else {
      console.log("Old avatar file deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting old avatar file:", error);
  }
};

const validatePhone = async () => {
  const phone = displayPhone.value;

  if (!phone) {
    phoneErrorMessage.value = "";
    return true;
  }

  // First check format
  if (!/^\d{10}$/.test(phone)) {
    phoneErrorMessage.value = "Phone number must be 10 digits";
    return false;
  }

  const originalPhone =
    originalEmployeeData.value?.assignedUser?.phone?.replace(/^\+91/, "");
  if (originalPhone === phone) {
    phoneErrorMessage.value = "";
    return true;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[phone][_eq]=+91${phone}&filter[id][_neq]=${props.employeeData?.assignedUser?.id}`,
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
  const email = props.employeeData?.assignedUser?.email;

  if (!email) {
    emailErrorMessage.value = "";
    return true;
  }

  // Apply the email validation rule
  if (!rules.email(email)) {
    emailErrorMessage.value = "Invalid email address";
    return false;
  }

  if (originalEmployeeData.value?.assignedUser?.email === email) {
    emailErrorMessage.value = "";
    return true;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[email][_eq]=${email}&filter[id][_neq]=${props.employeeData?.assignedUser?.id}`,
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

const clearPhoneError = () => {
  phoneErrorMessage.value = "";
};

const clearEmailError = () => {
  emailErrorMessage.value = "";
};

const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Check if we have the Profiles folder ID
    if (!profilesFolderId.value) {
      await fetchProfilesFolderId();
      if (!profilesFolderId.value) {
        showErrorMessage(
          "Could not find Profiles folder. Using default upload location."
        );
      }
    }
    const formData = new FormData();

    // If we have a profiles folder ID, use it
    if (profilesFolderId.value) {
      formData.append("folder", profilesFolderId.value);
    }

    // Use employee ID in the filename for better organization
    const fileExtension = file.name.split(".").pop();
    const employeeId = props.employeeData.employeeId || "profile";
    const customFileName = `${employeeId}_profile.${fileExtension}`;

    formData.append("file", file, customFileName);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload image");

    const result = await response.json();
    const newAvatarId = result.data.id;

    // Delete the old avatar file if it exists
    if (currentAvatarFileId.value) {
      await deleteOldAvatarFile(currentAvatarFileId.value);
    }

    // Update the current avatar file ID
    currentAvatarFileId.value = newAvatarId;

    const updatedEmployeeData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        avatar: { id: newAvatarId },
      },
    };

    const newAvatarUrl = `${import.meta.env.VITE_API_URL}/assets/${newAvatarId}`;
    avatarImage.value = await fetchAuthorizedImage(newAvatarUrl);

    emit("update:employeeData", updatedEmployeeData);
  } catch (error) {
    console.error("Error uploading avatar:", error);
    showErrorMessage("Failed to upload profile picture. Please try again.");
  }
};

const handleDateChange = (newDate) => {
  dobMenu.value = false;
  const selectedDate = new Date(newDate);
  const today = new Date();
  const age = today.getFullYear() - selectedDate.getFullYear();

  const hasBirthdayOccurred =
    today.getMonth() > selectedDate.getMonth() ||
    (today.getMonth() === selectedDate.getMonth() &&
      today.getDate() >= selectedDate.getDate());

  const actualAge = hasBirthdayOccurred ? age : age - 1;

  if (actualAge < 20) {
    validationErrors.value["DOB"] = "Employee must be at least 20 years old";
    touchedFields.value.add("DOB");
  } else {
    validationErrors.value["DOB"] = null;
  }

  const updatedData = {
    ...props.employeeData,
    _validationState: {
      ...props.employeeData._validationState,
      personalDetails: Object.keys(validationErrors.value).length === 0,
    },
  };

  emit("update:employeeData", updatedData);
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const validateField = (fieldName) => {
  touchedFields.value.add(fieldName);
  let value;

  // Special handling for employeeId
  if (fieldName === "employeeId") {
    value = props.employeeData[fieldName];
  } else {
    value = props.employeeData?.assignedUser?.[fieldName];
  }

  validationErrors.value[fieldName] = null;

  // Check for required fields - only first_name, gender, and employeeId are required
  if (["first_name", "gender", "employeeId"].includes(fieldName) && !value) {
    validationErrors.value[fieldName] = "This field is required";
  }

  // Additional validations for other fields (but not required)
  if (fieldName === "email" && value && !/.+@.+\..+/.test(value)) {
    validationErrors.value[fieldName] = "Invalid email address";
  }

  if (fieldName === "phone") {
    const phoneWithoutPrefix = value ? value.replace(/^\+91/, "") : "";
    if (phoneWithoutPrefix && !/^\d{10}$/.test(phoneWithoutPrefix)) {
      validationErrors.value[fieldName] = "Phone number must be 10 digits";
    }
  }

  if (fieldName === "pan" && value && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) {
    validationErrors.value[fieldName] = "Invalid PAN format";
  }

  if (fieldName === "aadhar" && value && !/^\d{12}$/.test(value)) {
    validationErrors.value[fieldName] = "Invalid Aadhar format";
  }

  if (fieldName === "DOB" && value) {
    const selectedDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    const hasBirthdayOccurred =
      today.getMonth() > selectedDate.getMonth() ||
      (today.getMonth() === selectedDate.getMonth() &&
        today.getDate() >= selectedDate.getDate());
    const actualAge = hasBirthdayOccurred ? age : age - 1;

    if (actualAge < 18) {
      // Changed from 20 to 18
      validationErrors.value[fieldName] =
        "Employee must be at least 18 years old";
    }
  }

  const updatedData = {
    ...props.employeeData,
    _validationState: {
      ...props.employeeData._validationState,
      personalDetails: Object.values(validationErrors.value).every(
        (error) => error === null
      ),
    },
  };

  emit("update:employeeData", updatedData);
};

const getFieldErrorMessage = (fieldName) => {
  if (fieldName === "employeeId") {
    return touchedFields.value.has(fieldName)
      ? validationErrors.value[fieldName] || ""
      : "";
  }
  return touchedFields.value.has(fieldName)
    ? validationErrors.value[fieldName] || ""
    : "";
};

const markFieldAsTouched = (fieldName) => {
  touchedFields.value.add(fieldName);
  validateField(fieldName);
};

const capitalizeFirstLetterEachWord = (field) => {
  if (props.employeeData?.assignedUser?.[field]) {
    const updatedValue = props.employeeData.assignedUser[field]
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    const updatedData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        [field]: updatedValue,
      },
    };

    emit("update:employeeData", updatedData);
    validateField(field);
  }
};

const toLowerCase = (field) => {
  if (props.employeeData?.assignedUser?.[field]) {
    const updatedValue = props.employeeData.assignedUser[field].toLowerCase();

    const updatedData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        [field]: updatedValue,
      },
    };

    emit("update:employeeData", updatedData);
    validateField(field);
  }
};

const toUpperCase = (field) => {
  if (props.employeeData?.assignedUser?.[field]) {
    const updatedValue = props.employeeData.assignedUser[field].toUpperCase();

    const updatedData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        [field]: updatedValue,
      },
    };

    emit("update:employeeData", updatedData);
    validateField(field);
  }
};

const fetchAndSetAvatar = async () => {
  if (props.employeeData?.assignedUser?.avatar?.id) {
    const imageUrl = await fetchAuthorizedImage(
      `${import.meta.env.VITE_API_URL}/assets/${props.employeeData.assignedUser.avatar.id}`
    );
    avatarImage.value = imageUrl;
  }
};

const handleRoleChange = (newValue) => {
  if (newValue !== originalEmployeeData.value.assignedUser?.role?.id) {
    props.employeeData.assignedUser.role = { id: newValue };
    validateField("role");
    // Refetch reporting to options based on new role
    fetchReportingTo();
  }
};

const handleInputChange = (field) => {
  if (field === "pan" || field === "aadhar") {
    validationErrors.value[field] = null;
  }
};

const updatePersonalDetails = async () => {
  const token = authService.getToken();
  if (!props.employeeData?.assignedUser?.id) {
    showErrorMessage(
      "Employee data is incomplete. Please refresh the page and try again."
    );
    return;
  }
  if (!validateFaceImage()) {
    showErrorMessage("Please fix image upload errors before updating");
    return;
  }
  const requiredFields = ["first_name", "gender", "employeeId"];
  requiredFields.forEach((field) => {
    touchedFields.value.add(field);
    validateField(field);
  });

  const isPhoneValid = await validatePhone();
  const isEmailValid = await validateEmail();

  const phone = displayPhone.value;
  if (phone && !/^\d{10}$/.test(phone)) {
    phoneErrorMessage.value = "Phone number must be 10 digits";
    showErrorMessage("Please fix phone number format before updating");
    return;
  }
  const mandatoryFields = ["first_name", "gender", "employeeId"];
  const missingFields = mandatoryFields.filter((field) =>
    field === "employeeId"
      ? !props.employeeData[field]
      : !props.employeeData.assignedUser[field]
  );

  if (missingFields.length > 0) {
    showErrorMessage("Please fill in all required fields");
    return;
  }

  if (
    Object.values(validationErrors.value).some(
      (error) => error !== null && error !== ""
    ) ||
    phoneErrorMessage.value ||
    emailErrorMessage.value
  ) {
    if (validationErrors.value["pan"] === "PAN number already exists") {
      showErrorMessage(
        "PAN number already exists in the system. Please use a different PAN number."
      );
      return;
    }

    if (validationErrors.value["aadhar"] === "Aadhar number already exists") {
      showErrorMessage(
        "Aadhar number already exists in the system. Please use a different Aadhar number."
      );
      return;
    }

    showErrorMessage("Please fix all validation errors before updating");
    return;
  }

  if (isPanChecking.value || isAadharChecking.value) {
    showErrorMessage(
      "Please wait while we validate your PAN and Aadhar numbers"
    );
    return;
  }

  try {
    const personalModuleFieldsToUpdate = {};
    const assignedUserFieldsToUpdate = {};

    // Handle face image if uploaded
    if (
      faceImageBase64.value &&
      faceImageBase64.value !== originalEmployeeData.value?.registeredFace
    ) {
      personalModuleFieldsToUpdate.registeredFace = faceImageBase64.value;
    } else if (
      !faceImageBase64.value &&
      originalEmployeeData.value?.registeredFace
    ) {
      // If image was removed, set to null
      personalModuleFieldsToUpdate.registeredFace = null;
    }
    // Handle workingRange
    const currentWorkingRange = props.employeeData.workingRange;
    const originalWorkingRange = originalEmployeeData.value.workingRange;

    // Normalize empty string to null for comparison and payload
    const normalizedCurrentWorkingRange =
      currentWorkingRange === "" ? null : currentWorkingRange;
    const normalizedOriginalWorkingRange =
      originalWorkingRange === "" ? null : originalWorkingRange;

    if (normalizedCurrentWorkingRange !== normalizedOriginalWorkingRange) {
      personalModuleFieldsToUpdate.workingRange = normalizedCurrentWorkingRange;
    }

    // Handle employeeId
    if (
      props.employeeData.employeeId !== originalEmployeeData.value.employeeId
    ) {
      personalModuleFieldsToUpdate.employeeId = props.employeeData.employeeId;
    }

    // Handle company details changes
    if (changedFields.value.branchLocation) {
      personalModuleFieldsToUpdate.branchLocation =
        changedFields.value.branchLocation;
    }
    if (changedFields.value.department) {
      personalModuleFieldsToUpdate.department = changedFields.value.department;
    }
    if (changedFields.value.reportingTo) {
      personalModuleFieldsToUpdate.reportingTo =
        changedFields.value.reportingTo;
    }
    if (changedFields.value.cycleType) {
      personalModuleFieldsToUpdate.cycleType = changedFields.value.cycleType;
    }

    for (const [key, value] of Object.entries(
      props.employeeData.assignedUser
    )) {
      const originalValue = originalEmployeeData.value.assignedUser[key];
      const hasChanged = value !== originalValue;

      if (key === "appAccess") {
        if (value !== originalEmployeeData.value.assignedUser[key]) {
          assignedUserFieldsToUpdate[key] = value;
        }
      } else if (hasChanged) {
        if (key === "avatar" && value?.id) {
          assignedUserFieldsToUpdate[key] = value.id;
        } else if (key === "phone") {
          assignedUserFieldsToUpdate[key] = value
            ? value.startsWith("+91")
              ? value
              : `+91${value}`
            : null;
        } else if (key === "role") {
          const roleId =
            value?.id ||
            selectedRole.value ||
            "f667b169-c66c-4ec1-bef9-1831c1647c0d";
          assignedUserFieldsToUpdate[key] = roleId;
        } else if (key === "email") {
          // Handle email - generate default if empty
          const emailValue = value || generateDefaultEmail();
          assignedUserFieldsToUpdate[key] = emailValue;
        } else if (key === "dateOfJoining" || key === "dateOfLeaving") {
          assignedUserFieldsToUpdate[key] = value === "" ? null : value;
        } else {
          assignedUserFieldsToUpdate[key] = value === "" ? null : value;
        }
      }
    }

    // Handle role if not already processed and is empty/null
    if (
      !assignedUserFieldsToUpdate.role &&
      (!props.employeeData.assignedUser.role?.id || !selectedRole.value)
    ) {
      assignedUserFieldsToUpdate.role = "f667b169-c66c-4ec1-bef9-1831c1647c0d";
    }

    // Handle email if not already processed and is empty
    if (
      !assignedUserFieldsToUpdate.email &&
      !props.employeeData.assignedUser.email
    ) {
      assignedUserFieldsToUpdate.email = generateDefaultEmail();
    }

    // Construct the final payload
    const payload = {};
    if (Object.keys(assignedUserFieldsToUpdate).length > 0) {
      payload.assignedUser = {
        id: props.employeeData.assignedUser.id,
        ...assignedUserFieldsToUpdate,
      };
    }
    Object.assign(payload, personalModuleFieldsToUpdate); // Add top-level fields

    if (Object.keys(payload).length === 0) {
      showErrorMessage(
        "No changes to update in personal details, please make any changes to update"
      );
      return;
    }

    console.log("Update payload:", payload);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.errors) {
        const errorMessages = errorData.errors
          .map((err) => err.message)
          .join(", ");
        throw new Error(errorMessages);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Update successful", result);
    originalEmployeeData.value = JSON.parse(JSON.stringify(props.employeeData));
    changedFields.value = {};
    showSuccessMessage("Personal details updated successfully!");
  } catch (error) {
    console.error("Error updating personal details:", error);
    if (error.message.includes("assignedUser.id")) {
      showErrorMessage(
        "Error: User ID is missing. Please refresh the page and try again."
      );
    } else if (
      error.message.includes("duplicate") ||
      error.message.includes("already exists")
    ) {
      showErrorMessage(error.message);
    } else {
      showErrorMessage("Failed to update personal details. Please try again.");
    }
  }
};

watch(
  () => props.employeeData?.assignedUser,
  (newValue) => {
    if (newValue && !newValue.id && props.employeeData) {
    }
  },
  { deep: true, immediate: false }
);

// Watch for changes in workingRange to validate its value
watch(
  () => props.employeeData.workingRange,
  (newValue) => {
    if (newValue === null || newValue === undefined || newValue === "") {
      workingRangeError.value = ""; // Clear error if empty
    } else if (typeof newValue === "number") {
      if (newValue < 0 || newValue > 500) {
        workingRangeError.value = "Range must be between 0 and 500 meters";
      } else {
        workingRangeError.value = "";
      }
    } else {
      // If it's not a number (e.g., string that couldn't be parsed), treat as invalid
      workingRangeError.value = "Invalid number format";
    }
  },
  { immediate: true } // Run immediately to validate initial value
);

onMounted(async () => {
  await Promise.all([
    fetchEmployeeData(),
    fetchRoles(),
    fetchAadhaarData(),

    fetchReportingTo(),
  ]);
  setDefaultDOB();
});

watch(
  () => props.employeeData?.assignedUser?.avatar?.id,
  (newAvatarId, oldAvatarId) => {
    if (newAvatarId && newAvatarId !== oldAvatarId) {
      fetchAndSetAvatar();
    }
  }
);

watch(
  () => props.employeeData,
  (newVal) => {
    if (newVal) {
      if (newVal.department?.id) {
        selectedDepartment.value = newVal.department.id;
      } else if (newVal.department?.departmentName) {
        matchDepartmentByName(newVal.department.departmentName);
      }
      if (newVal.branchLocation?.id) {
        selectedBranchLocation.value = newVal.branchLocation.id;
      } else if (newVal.branchLocation?.locdetail?.locationName) {
        matchBranchLocationByName(newVal.branchLocation.locdetail.locationName);
      }
      if (newVal.reportingTo) {
        selectedReportingTo.value = newVal.reportingTo.id;
      } else {
        selectedReportingTo.value = null;
      }
      if (newVal.cycleType) {
        selectedCycleType.value = newVal.cycleType.cycleId || newVal.cycleType;
      }
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => props.employeeData?.assignedUser?.role?.name,
  (newRole) => {
    if (newRole) {
      selectedReportingTo.value = null;
      fetchReportingTo();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* Custom styling for Aadhaar information display */
.aadhaar-info-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.aadhaar-info-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.personal-details {
  height: calc(90vh - 170px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
}

.avatar-section {
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  gap: 16px;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.avatar-image {
  /* border: 2px solid #e0e0e0; */
  border-radius: 0; /* Changed to 0 for square shape */
  overflow: hidden;
  width: 150px; /* Ensure square dimensions */
  height: 150px;
}

.default-avatar {
  border: 2px solid #e0e0e0;
  border-radius: 0; /* Changed to 0 for square shape */
  padding: 5px;
  background-color: #f5f5f5;
  width: 150px; /* Ensure square dimensions */
  height: 150px;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  background-color: #059367 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
  transition: all 0.3s ease;
}

.edit-avatar-btn:hover {
  background-color: #059367 !important;
  transform: scale(1.1);
}

.edit-avatar-btn .v-icon {
  font-size: 18px;
  color: white;
}

/* Profile Info Styling */
.profile-info {
  padding: 1rem 0;
}

.profile-name {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.profile-meta {
  margin-bottom: 1rem;
}

.profile-contact {
  font-size: 1rem;
  color: #666;
}

.contact-item {
  display: flex;
  align-items: center;
}

.contact-item .v-icon {
  color: #999;
}

:deep(.v-input--error) {
  color: rgb(var(--v-theme-error)) !important;
}

:deep(.v-input--error .v-field) {
  border-color: rgb(var(--v-theme-error)) !important;
}

:deep(.error--text) {
  color: rgb(var(--v-theme-error)) !important;
}

:deep(.v-card) {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

:deep(.v-card-title) {
  font-size: 1.25rem;
  font-weight: 600;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.v-card-text) {
  padding: 1rem;
}
</style>

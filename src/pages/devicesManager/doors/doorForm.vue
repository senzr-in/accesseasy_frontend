<template>
  <div class="door-form-container">
    <!-- Success message notification -->
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
    <!-- Header -->
    <div class="form-header">
      <div class="header-content">
        <v-btn icon variant="text" @click="$emit('cancel')" class="back-button">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h6">
          {{ isEditing ? "Edit Door" : "Add Door" }}
        </h2>
      </div>
      <div class="action-buttons">
        <v-btn color="error" variant="text" @click="$emit('cancel')"
          >CANCEL</v-btn
        >
        <v-btn color="black" @click="saveDoor">SAVE</v-btn>
      </div>
    </div>

    <div class="form-content-wrapper">
      <div class="sidebar">
        <v-list>
          <v-list-item
            v-for="(tab, index) in tabs"
            :key="index"
            :value="tab"
            :active="currentTab === tab.id"
            @click="currentTab = tab.id"
            :class="{ 'has-error': tabHasError(tab.id) }"
          >
            <template v-slot:prepend>
              <v-icon :color="tabHasError(tab.id) ? 'error' : 'default'">
                {{ tab.icon }}
              </v-icon>
            </template>

            <v-list-item-title>
              {{ tab.title }}
              <v-icon
                v-if="tabHasError(tab.id)"
                color="error"
                size="small"
                class="ms-2"
              >
                mdi-alert-circle
              </v-icon>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Right Content Area -->
      <div class="form-content">
        <v-form ref="form" v-model="valid" @submit.prevent="saveDoor">
          <div v-show="currentTab === 'basic'" class="form-section">
            <v-row>
              <!-- Door Name -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.doorName"
                  label="Door Name *"
                  required
                  :error-messages="getFieldErrorMessage('doorName')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('doorName')"
                ></v-text-field>
              </v-col>
              <!-- Door Type -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.doorType"
                  :items="['Sub door', 'Main door']"
                  label="Door Type"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <!-- Door Group Dropdown -->
              <v-col cols="12" md="6">
                <div class="door-group-container">
                  <div class="custom-dropdown">
                    <div
                      class="dropdown-trigger"
                      @click="toggleDoorGroupDropdown"
                      :class="{ 'dropdown-active': showDoorGroupDropdown }"
                    >
                      <span v-if="formData.doorGroup">{{
                        formData.doorGroup
                      }}</span>
                      <span v-else class="placeholder">Select door group</span>
                      <v-icon>{{
                        showDoorGroupDropdown
                          ? "mdi-chevron-up"
                          : "mdi-chevron-down"
                      }}</v-icon>
                    </div>

                    <div v-if="showDoorGroupDropdown" class="dropdown-content">
                      <div class="search-container">
                        <input
                          type="text"
                          v-model="doorGroupSearch"
                          placeholder="Search groups..."
                          @input="filterDoorGroups"
                          class="search-input"
                        />
                      </div>

                      <div class="dropdown-items">
                        <div
                          v-for="group in filteredDoorGroups"
                          :key="group"
                          class="dropdown-item"
                          @click="selectDoorGroup(group)"
                          :class="{ selected: formData.doorGroup === group }"
                        >
                          {{ group }}
                        </div>

                        <div
                          class="dropdown-item add-new"
                          @click="showAddDoorGroupPopup = true"
                        >
                          <v-icon size="small" class="me-2">mdi-plus</v-icon>
                          Add
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Department -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.assignedDepts"
                  :items="departmentOptions"
                  item-title="name"
                  item-value="name"
                  label="Department"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <!-- Branch -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.branch"
                  :items="branchOptions"
                  item-title="name"
                  item-value="name"
                  label="Branch"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </div>

          <!-- Access Control Section -->
          <div v-show="currentTab === 'access'" class="form-section">
            <v-row>
              <!-- Time Settings -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.accessStartTime"
                  label="Access Start Time"
                  type="time"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.accessEndTime"
                  label="Access End Time"
                  type="time"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
        </v-form>
      </div>
    </div>

    <!-- Add Door Group Popup -->
    <div
      v-if="showAddDoorGroupPopup"
      class="popup-overlay"
      @click.self="showAddDoorGroupPopup = false"
    >
      <div class="popup-container">
        <div class="popup-header">
          <h3>Add New Door Group</h3>
          <v-icon @click="showAddDoorGroupPopup = false" class="close-icon"
            >mdi-close</v-icon
          >
        </div>
        <div class="popup-content">
          <div class="input-group">
            <label for="newGroupName">Group Name</label>
            <input
              type="text"
              id="newGroupName"
              v-model="newDoorGroup"
              placeholder="Enter group name"
              ref="newDoorGroupInput"
              @keyup.enter="addNewDoorGroup"
            />
          </div>
          <div class="popup-actions">
            <button class="cancel-btn" @click="showAddDoorGroupPopup = false">
              Cancel
            </button>
            <button
              class="add-btn"
              @click="addNewDoorGroup"
              :disabled="!newDoorGroup.trim()"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { onMounted, reactive, ref, watch, nextTick, onUnmounted } from "vue";

const props = defineProps({
  isEditing: Boolean,
  doorData: Object,
  tenantId: String,
});

const emit = defineEmits(["save-success", "cancel"]);

// Initialize reactive references
const currentTab = ref("basic");
const formSubmitAttempted = ref(false);
const formErrors = ref({});
const touchedFields = ref({});
const form = ref(null);
const valid = ref(false);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Door group refs
const doorGroups = ref([]);
const filteredDoorGroups = ref([]);
const doorGroupSearch = ref("");
const showDoorGroupDropdown = ref(false);
const newDoorGroup = ref("");
const newDoorGroupInput = ref(null);
const showAddDoorGroupPopup = ref(false);

const tabs = [{ id: "basic", title: "Basic Details", icon: "mdi-door" }];

const tabRequiredFields = {
  basic: ["doorName"],
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};
const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const formData = reactive({
  doorName: "",
  doorNumber: "",
  doorType: "",
  assignedDepts: "",
  branch: "",
  accessLevel: "",
  status: true,
  accessStartTime: "",
  accessEndTime: "",
  tenant: "",
  doorGroup: "", // Add doorGroup field
});

const departmentOptions = ref([]);
const branchOptions = ref([]);
const accessLevelOptions = ref([]);

const tabHasError = (tabId) => {
  if (!formSubmitAttempted.value) return false;
  const requiredFields = tabRequiredFields[tabId];
  return requiredFields.some((field) => !formData[field]);
};

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

const markFieldAsTouched = (field) => {
  touchedFields.value[field] = true;
  if (!formData[field] && tabRequiredFields[currentTab.value].includes(field)) {
    formErrors.value[field] = "This field is required";
  }
};

async function fetchDepartments() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/department?filter[tenant][tenantId][_eq]=${resolvedTenantId}&fields[]=id&fields[]=departmentName`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    departmentOptions.value = data.data.map((dept) => ({
      id: dept.id,
      name: dept.departmentName,
    }));
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
}

async function fetchBranches() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/branch?filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    branchOptions.value = data.data.map((branch) => ({
      id: branch.id,
      name: branch.branchName,
    }));
  } catch (error) {
    console.error("Error fetching branches:", error);
  }
}

async function fetchAccessLevels() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/accesslevels?filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    accessLevelOptions.value = data.data.map((level) => ({
      id: level.id,
      accessLevelName: level.accessLevelName,
      accessLevelNumber: level.accessLevelNumber,
      accessType: level.accessType,
    }));
  } catch (error) {
    console.error("Error fetching access levels:", error);
  }
}

// Door group functions
const toggleDoorGroupDropdown = () => {
  showDoorGroupDropdown.value = !showDoorGroupDropdown.value;
  if (showDoorGroupDropdown.value) {
    fetchDoorGroups();
  }
};

const fetchDoorGroups = async () => {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?filter[tenant][tenantId][_eq]=${resolvedTenantId}&fields=doorGroup`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch door groups");
    }

    const data = await response.json();

    const uniqueGroups = [
      ...new Set(
        data.data
          .map((item) => item.doorGroup)
          .filter((group) => group && group.trim() !== ""),
      ),
    ];

    doorGroups.value = uniqueGroups;
    filteredDoorGroups.value = uniqueGroups;
  } catch (error) {
    console.error("Error fetching door groups:", error);
    showErrorMessage("Failed to load door groups");
  }
};

const filterDoorGroups = () => {
  if (!doorGroupSearch.value) {
    filteredDoorGroups.value = doorGroups.value;
  } else {
    filteredDoorGroups.value = doorGroups.value.filter((group) =>
      group.toLowerCase().includes(doorGroupSearch.value.toLowerCase()),
    );
  }
};

const selectDoorGroup = (group) => {
  formData.doorGroup = group;
  showDoorGroupDropdown.value = false;
  showAddDoorGroupPopup.value = false;
};

const addNewDoorGroup = async () => {
  if (!newDoorGroup.value.trim()) {
    return;
  }

  try {
    const newGroup = newDoorGroup.value.trim();

    doorGroups.value.push(newGroup);
    filteredDoorGroups.value = doorGroups.value;

    formData.doorGroup = newGroup;

    showAddDoorGroupPopup.value = false;
    showDoorGroupDropdown.value = false;
    newDoorGroup.value = "";

    showSuccessMessage("Door group added successfully!");
  } catch (error) {
    console.error("Error creating door group:", error);
    showErrorMessage(error.message || "Failed to create door group");
  }
};

async function resolveTenantId() {
  if (props.tenantId instanceof Promise) {
    return await props.tenantId;
  }
  return props.tenantId;
}

async function saveDoor() {
  if (props.isEditing) {
    await editDoor();
  } else {
    await createNewDoor();
  }
}

async function createNewDoor() {
  formSubmitAttempted.value = true;
  const mandatoryFields = ["doorName"];
  let hasErrors = false;

  mandatoryFields.forEach((field) => {
    if (!formData[field]) {
      hasErrors = true;
      formErrors.value[field] = "This field is required";
      touchedFields.value[field] = true;
    }
  });

  if (hasErrors) {
    showErrorMessage("Please fill in all required fields before saving");
    return;
  }

  try {
    const resolvedTenantId = await resolveTenantId();
    const DoorNumber = await generateSequentialDoorNumber();

    const selectedDepartment = departmentOptions.value.find(
      (dept) => dept.name === formData.assignedDepts,
    );
    const selectedBranch = branchOptions.value.find(
      (branch) => branch.name === formData.branch,
    );
    const selectedAccessLevel = accessLevelOptions.value.find(
      (level) => level.accessLevelName === formData.accessLevel,
    );

    const payload = {
      doorName: formData.doorName,
      doorNumber: DoorNumber,
      doorType: formData.doorType,
      status: formData.status ? "active" : "inactive",
      tenant: resolvedTenantId,
      assignedDepts: selectedDepartment?.id,
      branch: selectedBranch?.id,
      accessLevel: selectedAccessLevel?.id,
      accessStartTime: formData.accessStartTime,
      accessEndTime: formData.accessEndTime,
      doorGroup: formData.doorGroup || null,
    };
    if (selectedDepartment?.id) {
      payload.assignedDepartment = {
        create: [
          {
            doors_id: "+",
            department_id: { id: selectedDepartment.id },
          },
        ],
        update: [],
        delete: [],
      };
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to save door data");
    }

    showSuccessMessage("Door added successfully!");
    setTimeout(() => {
      emit("save-success");
    }, 2000);
  } catch (error) {
    console.error("Error saving door data:", error);
    showErrorMessage(
      "An error occurred while saving the door data. Please try again.",
    );
  }
}

async function editDoor() {
  formSubmitAttempted.value = true;
  const mandatoryFields = ["doorName", "doorNumber"];
  let hasErrors = false;

  mandatoryFields.forEach((field) => {
    if (!formData[field]) {
      hasErrors = true;
      formErrors.value[field] = "This field is required";
      touchedFields.value[field] = true;
    }
  });

  if (hasErrors) {
    showErrorMessage(`Please fill in all required fields before saving`);
    return;
  }

  try {
    const resolvedTenantId = await resolveTenantId();

    const selectedDepartment = departmentOptions.value.find(
      (dept) => dept.name === formData.department,
    );
    const selectedBranch = branchOptions.value.find(
      (branch) => branch.name === formData.branch,
    );
    const selectedAccessLevel = accessLevelOptions.value.find(
      (level) => level.accessLevelName === formData.accessLevel,
    );

    const payload = {
      doorName: formData.doorName,
      doorNumber: formData.doorNumber,
      doorType: formData.doorType,
      status: formData.status ? "active" : "inactive",
      tenant: resolvedTenantId,
      assignedDepts: selectedDepartment?.id,
      branch: selectedBranch?.id,
      accessLevel: selectedAccessLevel?.id,
      accessStartTime: formData.accessStartTime,
      accessEndTime: formData.accessEndTime,
      doorGroup: formData.doorGroup || null,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors/${props.doorData.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update door data");
    }

    showSuccessMessage("Door updated successfully!");
    setTimeout(() => {
      emit("save-success");
    }, 2000);
  } catch (error) {
    console.error("Error updating door data:", error);
    showErrorMessage(
      "An error occurred while updating the door data. Please try again.",
    );
  }
}
async function generateSequentialDoorNumber() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/doors?filter[tenant][tenantId][_eq]=${resolvedTenantId}&sort[]=-doorNumber&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return "1";
    }
    const lastDoorNumber = data.data[0].doorNumber;
    const lastNumber = parseInt(lastDoorNumber.replace(/\D/g, "")) || 0;
    return (lastNumber + 1).toString();
  } catch (error) {
    console.error("Error generating door number:", error);
    return "1";
  }
}
async function deleteDoor() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors/${props.doorData.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to delete door");
    }

    showSuccessMessage("Door deleted successfully!");
    emit("save-success");
  } catch (error) {
    console.error("Error deleting door:", error);
    showErrorMessage(
      "An error occurred while deleting the door. Please try again.",
    );
  }
}

onMounted(async () => {
  await fetchDepartments();
  await fetchBranches();
  await fetchAccessLevels();
  await fetchDoorGroups();

  formData.tenant = authService.getTenantId();

  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

watch(
  () => props.doorData,
  (newVal) => {
    if (props.isEditing && newVal) {
      console.log("Populating form with door data:", newVal);

      try {
        // Reset form data
        Object.keys(formData).forEach((key) => {
          if (typeof formData[key] === "boolean") {
            formData[key] = true;
          } else {
            formData[key] = "";
          }
        });

        // Basic fields
        formData.doorName = newVal.doorName || "";
        // formData.assignedDepts = newVal.assignedDepts.departmentName || "";
        // formData.branch = newVal.branch.branchName || "";
        formData.doorNumber = newVal.doorNumber || "";
        formData.doorType = newVal.doorType || "";
        formData.status = newVal.status === "active";
        formData.accessStartTime = newVal.accessStartTime || "";
        formData.accessEndTime = newVal.accessEndTime || "";
        formData.doorGroup = newVal.doorGroup || ""; // Add doorGroup

        // Handle department
        if (newVal.assignedDepts) {
          formData.assignedDepts = newVal.assignedDepts.departmentName || "";
        }

        // Handle branch
        if (newVal.branch) {
          formData.branch = newVal.branch.branchName || "";
        }

        // Access Level
        if (newVal.accessLevel) {
          const accessLevel = accessLevelOptions.value.find(
            (level) => level.id === newVal.accessLevel,
          );
          formData.accessLevel = accessLevel?.accessLevelName || "";
        }

        console.log("Form data populated:", formData);
      } catch (error) {
        console.error("Error populating form data:", error);
        showErrorMessage("Error loading door data. Please try again.");
      }
    }
  },
  { immediate: true, deep: true },
);

// Watch for form data changes
watch(
  formData,
  (newVal, oldVal) => {
    Object.keys(newVal).forEach((field) => {
      if (newVal[field] && formErrors.value[field]) {
        formErrors.value[field] = "";
      }
    });
  },
  { deep: true },
);

// Watch for tab changes
watch(currentTab, (newTab, oldTab) => {
  if (oldTab) {
    const mandatoryFields = tabRequiredFields[oldTab];
    mandatoryFields.forEach((field) => {
      if (!formData[field]) {
        touchedFields.value[field] = true;
        formErrors.value[field] = "This field is required";
      }
    });
  }
});

// Add click outside handler to close dropdown and popup
const handleClickOutside = (event) => {
  const dropdowns = document.querySelectorAll(".custom-dropdown");
  let clickedOutside = true;

  dropdowns.forEach((dropdown) => {
    if (dropdown.contains(event.target)) {
      clickedOutside = false;
    }
  });

  if (clickedOutside && showDoorGroupDropdown.value) {
    showDoorGroupDropdown.value = false;
  }
};
</script>

<style scoped>
.door-form-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  width: 100%;
  max-width: 100%;
}

.form-header {
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

.form-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.form-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 64px);
}

.form-section {
  margin-bottom: 24px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.has-error {
  color: rgb(var(--v-theme-error));
}

:deep(.v-list-item--active) {
  background-color: #eee;
}

:deep(.v-list-item:hover) {
  background-color: #f0f0f0;
}

:deep(.v-switch__track) {
  opacity: 0.2;
}

:deep(.v-switch__thumb) {
  color: #000;
}

:deep(.v-checkbox .v-selection-control) {
  min-height: 40px;
}

:deep(.v-input--error) {
  color: rgb(var(--v-theme-error));
}

:deep(.v-messages) {
  font-size: 12px;
  min-height: 14px;
  padding-top: 2px;
}
:deep(.v-field--error) {
  --v-field-border-width: 2px;
  border-color: rgb(var(--v-theme-error));
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

:deep(.v-field--focused .v-field__outline__start) {
  border-color: #000;
}

:deep(.v-field--focused .v-field__outline__end) {
  border-color: #000;
}

:deep(.v-text-field .v-input__details) {
  padding-inline-start: 16px;
  border-color: #000;
}

:deep(.v-text-field .v-input__details) {
  padding-inline-start: 16px;
}

:deep(.v-switch .v-label) {
  opacity: 1;
}

:deep(.v-field__input) {
  padding-top: 6px;
  padding-bottom: 6px;
}

/* Door group dropdown styles */
.door-group-container {
  position: relative;
  width: 100%;
}

.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  min-height: 40px;
}

.dropdown-active {
  border-color: #2196f3;
}

.placeholder {
  color: #999;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 1000;
  margin-top: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-container {
  padding: 8px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dropdown-items {
  padding: 8px 0;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.selected {
  background-color: #e3f2fd;
  color: #2196f3;
}

.dropdown-item.add-new {
  display: flex;
  align-items: center;
  color: #2196f3;
  border-top: 1px solid #eee;
  margin-top: 8px;
}

/* Popup styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.popup-container {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-icon {
  cursor: pointer;
  color: #666;
}

.popup-content {
  padding: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.add-btn {
  padding: 8px 16px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.add-btn:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}
</style>

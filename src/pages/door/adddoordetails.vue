<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">{{
        isEditing ? "Edit Door" : "Add New Door"
      }}</span>
    </v-card-title>

    <v-card-text>
      <v-row dense>
        <!-- Full width content area -->
        <v-col cols="12">
          <v-card variant="flat" class="mt-2">
            <v-card-text>
              <v-form ref="formRef" @submit.prevent="handleSave">
                <!-- Row 1: Door Name, Door Type, and Location -->
                <v-row dense>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="formData.doorName"
                      label="Door Name *"
                      placeholder="Enter door name"
                      variant="outlined"
                      density="comfortable"
                      class="small-field"
                      :rules="[
                        (v) => !!v || 'Door name is required',
                        (v) =>
                          (v && v.length <= 50) ||
                          'Door name must be 50 characters or less',
                      ]"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-select
                      v-model="formData.doorType"
                      label="Door Type *"
                      :items="doorTypes"
                      placeholder="Select door type"
                      variant="outlined"
                      density="comfortable"
                      class="small-select"
                      :rules="[(v) => !!v || 'Door type is required']"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="formData.location"
                      label="Location"
                      placeholder="Enter location details"
                      variant="outlined"
                      density="comfortable"
                      class="small-field"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <!-- Row 2: Branch and Departments -->
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="formData.branchLocation"
                      label="Branch"
                      :items="branchOptions"
                      item-title="branchName"
                      item-value="id"
                      placeholder="Select branch location"
                      variant="outlined"
                      density="comfortable"
                      class="small-select"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="formData.assignedDepts"
                      label="Departments"
                      :items="departmentItems"
                      item-title="title"
                      item-value="value"
                      placeholder="Select departments"
                      variant="outlined"
                      density="comfortable"
                      class="small-select"
                      multiple
                      chips
                      closable-chips
                      :menu-props="{ maxHeight: 200 }"
                    >
                      <template v-slot:prepend-item>
                        <v-list-item>
                          <v-list-item-title>
                            <span class="text-caption">
                              Selected:
                              {{
                                formData.assignedDepts
                                  ? formData.assignedDepts.length
                                  : 0
                              }}
                            </span>
                          </v-list-item-title>
                          <template v-slot:append>
                            <v-btn
                              v-if="
                                formData.assignedDepts &&
                                formData.assignedDepts.length > 0
                              "
                              variant="text"
                              size="small"
                              @click.stop="clearAllDepts"
                              class="text-caption"
                            >
                              Clear All
                            </v-btn>
                          </template>
                        </v-list-item>
                        <v-divider class="mt-2"></v-divider>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <BaseButton
        variant="ghost"
        text="Cancel"
        @click="handleCancel"
      ></BaseButton>
      <BaseButton
        variant="primary"
        :text="isEditing ? 'Update' : 'Save'"
        :loading="isSaving"
        @click="handleSave"
      ></BaseButton>
    </v-card-actions>

    <!-- Snackbar for Toasts -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.type" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  watch,
  defineProps,
  defineEmits,
  nextTick,
  computed,
} from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { authService } from "@/services/authService";

// Define props
const props = defineProps({
  isEditing: Boolean,
  doorData: Object,
  tenantId: String,
});

const emit = defineEmits(["save-success", "cancel"]);

const isSaving = ref(false);
const formRef = ref(null);
const snackbar = ref({ show: false, message: "", type: "success" });
const ALL_DEPARTMENTS_ID = "ALL_DEPARTMENTS";
const doorTypes = ref(["Main Door", "Sub Door"]);
const statusOptions = ref(["Active", "Inactive"]);
const departmentOptions = ref([]);
const branchOptions = ref([]);

const formData = reactive({
  doorName: "",
  doorType: "",
  branchLocation: null,
  location: "",
  assignedDepts: [],
  status: "Active",
});
const departmentItems = computed(() => {
  const items = departmentOptions.value.map((d) => ({
    title: d.deptName,
    value: d.id,
  }));
  items.unshift({ title: "All Departments", value: ALL_DEPARTMENTS_ID });
  return items;
});

const clearAllDepts = () => {
  formData.assignedDepts = [];
};
// Initialize form data
const initializeForm = () => {
  formData.doorName = "";
  formData.doorType = "";
  formData.branchLocation = null;
  formData.location = "";
  formData.assignedDepts = [];
  formData.status = "Active";
};

// Populate form with door data
const populateForm = async () => {
  if (props.isEditing && props.doorData) {
    console.log("Populating form with door data:", props.doorData);

    // Wait for next tick to ensure options are loaded
    await nextTick();

    formData.doorName = props.doorData.doorName || "";
    formData.doorType = props.doorData.doorType || "";
    formData.location = props.doorData.location || "";

    // Handle branch location - check if it's an object or ID
    if (props.doorData.branchLocation) {
      if (typeof props.doorData.branchLocation === "object") {
        formData.branchLocation = props.doorData.branchLocation.id;
      } else {
        formData.branchLocation = props.doorData.branchLocation;
      }
    } else {
      formData.branchLocation = null;
    }

    // Handle assigned departments
    if (props.doorData.departmentIds) {
      try {
        if (typeof props.doorData.departmentIds === "string") {
          formData.assignedDepts = JSON.parse(props.doorData.departmentIds);
        } else if (Array.isArray(props.doorData.departmentIds)) {
          formData.assignedDepts = [...props.doorData.departmentIds];
        } else if (typeof props.doorData.departmentIds === "object" && props.doorData.departmentIds !== null) {
             // It might be a single object if not an array, but usually it's an array or string
             // If it has an ID, use it
             if (props.doorData.departmentIds.id) {
                 formData.assignedDepts = [props.doorData.departmentIds.id];
             } else {
                 // Fallback or empty
                 formData.assignedDepts = [];
             }
        } else {
          formData.assignedDepts = [];
        }
      } catch (error) {
        console.error("Error parsing departmentIds:", error);
        formData.assignedDepts = [];
      }
    } else if (props.doorData.assignedDepts) {
      if (Array.isArray(props.doorData.assignedDepts)) {
          formData.assignedDepts = [...props.doorData.assignedDepts];
      } else if (typeof props.doorData.assignedDepts === "object" && props.doorData.assignedDepts !== null) {
        formData.assignedDepts = [props.doorData.assignedDepts.id];
      } else {
        formData.assignedDepts = [props.doorData.assignedDepts];
      }
    } else {
      formData.assignedDepts = [];
    }

    formData.status = props.doorData.status || "Active";

    console.log("Form populated:", { ...formData });
  } else {
    initializeForm();
  }
};

// Check for duplicate door name
const checkDoorName = async (doorName) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?filter[doorName][_eq]=${encodeURIComponent(
        doorName
      )}&filter[tenant][tenantId][_eq]=${props.tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (props.isEditing && props.doorData) {
      return data.data.some((door) => door.id !== props.doorData.id);
    }

    return data.data.length > 0;
  } catch (error) {
    console.error("Error checking door name:", error);
    return false;
  }
};

// Generate sequential door number
const generateSequentialDoorNumber = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?filter[tenant][tenantId][_eq]=${props.tenantId}&fields=doorNumber`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch door numbers: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      return "1";
    }

    let maxDoorNumber = 0;
    for (const door of data.data) {
      if (door.doorNumber) {
        const numericPart = parseInt(door.doorNumber.replace(/\D/g, ""), 10);
        if (!isNaN(numericPart) && numericPart > maxDoorNumber) {
          maxDoorNumber = numericPart;
        }
      }
    }

    return (maxDoorNumber + 1).toString();
  } catch (error) {
    console.error("Error generating door number:", error);
    return "1";
  }
};

// Create a new door
const createDoor = async () => {
  if (await checkDoorName(formData.doorName)) {
    showToast("Door name already exists.", "error");
    throw new Error("Duplicate door name");
  }

  const doorNumber = await generateSequentialDoorNumber();
  const payload = {
    doorName: formData.doorName,
    doorNumber,
    doorType: formData.doorType,
    location: formData.location || null,
    status: formData.status,
    tenant: props.tenantId,
    departmentIds: formData.assignedDepts.includes(ALL_DEPARTMENTS_ID)
      ? JSON.stringify(departmentOptions.value.map((d) => d.id))
      : formData.assignedDepts.length > 0
        ? JSON.stringify(
            formData.assignedDepts.filter((id) => id !== ALL_DEPARTMENTS_ID)
          )
        : null,
    branchLocation: formData.branchLocation,
    uniqueId: `${props.tenantId}-${doorNumber}`,
  };

  console.log("Creating door with payload:", JSON.stringify(payload, null, 2));

  const url = `${import.meta.env.VITE_API_URL}/items/doors`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error response:", errorData);
      throw new Error(`Failed to create door: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("API response:", responseData);

    emit("save-success");
    initializeForm();
    if (formRef.value) {
      formRef.value.resetValidation();
    }
    showToast("Door created successfully!", "success");
  } catch (error) {
    console.error("Error creating door:", error);
    showToast(
      error.message || "Failed to create door. Please try again.",
      "error"
    );
    throw error;
  }
};

// Update an existing door
const editDoor = async () => {
  if (
    formData.doorName !== props.doorData.doorName &&
    (await checkDoorName(formData.doorName))
  ) {
    showToast("Door name already exists.", "error");
    throw new Error("Duplicate door name");
  }

  const payload = {
    doorName: formData.doorName,
    doorNumber: props.doorData.doorNumber,
    doorType: formData.doorType,
    location: formData.location || null, // NEW LOCATION FIELD IN PAYLOAD
    status: formData.status,
    tenant: props.tenantId,
    departmentIds: formData.assignedDepts.includes(ALL_DEPARTMENTS_ID)
      ? JSON.stringify(departmentOptions.value.map((d) => d.id))
      : formData.assignedDepts.length > 0
        ? JSON.stringify(
            formData.assignedDepts.filter((id) => id !== ALL_DEPARTMENTS_ID)
          )
        : null,
    branchLocation: formData.branchLocation,
    uniqueId: props.doorData.uniqueId,
  };

  console.log("Updating door with payload:", JSON.stringify(payload, null, 2));

  const url = `${import.meta.env.VITE_API_URL}/items/doors/${props.doorData.id}`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error response:", errorData);
      throw new Error(`Failed to update door: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("API response:", responseData);

    emit("save-success");
    showToast("Door updated successfully!", "success");
  } catch (error) {
    console.error("Error updating door:", error);
    showToast(
      error.message || "Failed to update door. Please try again.",
      "error"
    );
    throw error;
  }
};

// Handle save action
const handleSave = async () => {
  if (!formRef.value) {
    showToast("Form reference not available.", "error");
    return;
  }

  const { valid } = await formRef.value.validate();
  if (!valid) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  isSaving.value = true;
  try {
    if (props.isEditing) {
      await editDoor();
    } else {
      await createDoor();
    }
  } catch (error) {
    console.error("Save error:", error);
  } finally {
    isSaving.value = false;
  }
};

// Handle cancel action
const handleCancel = () => {
  initializeForm();
  if (formRef.value) {
    formRef.value.resetValidation();
  }
  emit("cancel");
};

// Fetch departments
async function fetchDepartments() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${props.tenantId}&fields[]=id&fields[]=departmentName`,
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
      deptName: dept.departmentName,
    }));
    console.log("Departments loaded:", departmentOptions.value);
  } catch (error) {
    console.error("Error fetching departments:", error);
    showToast("Failed to load departments.", "error");
  }
}

// Fetch branches from locationManagement
async function fetchBranches() {
  try {
    const url = new URL(
      `${import.meta.env.VITE_API_URL}/items/locationManagement`
    );

    const params = {
      "fields[]": ["locdetail", "locType", "id"],
      "filter[_and][0][_and][0][tenant][tenantId][_eq]": props.tenantId,
      "filter[_and][0][_and][1][locType][_contains]": "branch",
    };

    Object.keys(params).forEach((key) => {
      if (Array.isArray(params[key])) {
        params[key].forEach((value) => {
          url.searchParams.append(key, value);
        });
      } else {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch branches");
    }

    const data = await response.json();

    branchOptions.value = data.data.map((location) => ({
      id: location.id,
      branchName: location.locdetail?.locationName || `Branch ${location.id}`,
    }));

    console.log(
      "Branches loaded from locationManagement:",
      branchOptions.value
    );
  } catch (error) {
    console.error("Error fetching branches:", error);
    showToast("Failed to load branches.", "error");
  }
}

// Show toast notification
const showToast = (message, type = "success") => {
  snackbar.value = { show: true, message, type };
};

// Watch for changes in doorData and isEditing
watch(
  () => [props.doorData, props.isEditing],
  async ([newDoorData, newIsEditing]) => {
    console.log(
      "Props changed - isEditing:",
      newIsEditing,
      "doorData:",
      newDoorData
    );

    if (newIsEditing && newDoorData) {
      if (
        branchOptions.value.length === 0 ||
        departmentOptions.value.length === 0
      ) {
        await Promise.all([fetchDepartments(), fetchBranches()]);
      }
      await populateForm();
    } else if (!newIsEditing) {
      initializeForm();
    }
  },
  { immediate: true, deep: true }
);

// Load initial data
onMounted(async () => {
  console.log("Component mounted");
  await Promise.all([fetchDepartments(), fetchBranches()]);

  if (props.isEditing && props.doorData) {
    await populateForm();
  }
});
</script>

<style scoped>
.small-select,
.small-field {
  max-width: 100%;
  font-size: 14px;
}
.small-select :deep(.v-field),
.small-field :deep(.v-field) {
  min-height: 40px;
  padding: 4px 8px;
}
.small-select :deep(.v-select__selection-text),
.small-field :deep(.v-input__control) {
  font-size: 14px;
}
.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}
</style>

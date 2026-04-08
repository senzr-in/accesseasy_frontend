<template>
  <div>
    <v-form ref="form" v-model="valid" @submit.prevent="handleSave">
      <v-toolbar density="compact" color="grey-lighten-4">
        <div class="d-flex align-center">
          <span class="text-h7">Edit Access Level</span>
          <div class="access-level-name ml-2">
            <v-icon size="medium" color="black">mdi-account-lock</v-icon>
            <span class="ml-1">{{ formData.accessLevelName }}</span>
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          class="mr-2"
          @click="$emit('close')"
        >
          CANCEL
        </v-btn>
        <v-btn
          v-if="selectedTab === 'basic'"
          style="background-color: black"
          color="white"
          @click="handleSave"
        >
          SAVE
        </v-btn>
      </v-toolbar>

      <div class="d-flex content-wrapper">
        <div class="side-nav pa-4">
          <v-list density="compact" nav>
            <v-list-item
              v-for="(item, i) in menuItems"
              :key="i"
              :value="item"
              :active="selectedTab === item.value"
              @click="selectedTab = item.value"
              color="black"
              rounded
              :class="{ 'has-error': tabHasError(item.value) }"
            >
              <template v-slot:prepend>
                <v-icon
                  :icon="item.icon"
                  :color="tabHasError(item.value) ? 'error' : 'default'"
                ></v-icon>
              </template>
              <v-list-item-title>
                {{ item.title }}
                <v-icon
                  v-if="tabHasError(item.value)"
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

        <!-- Content Area -->
        <div class="content-area pa-4">
          <v-card flat>
            <v-window v-model="selectedTab">
              <v-window-item value="basic">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData.accessType"
                      label="Access Type"
                      color="black"
                      hide-details
                      inset
                      disabled
                      class="mr-6"
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData.holidays"
                      label="Holidays"
                      color="black"
                      hide-details
                      inset
                      class="mr-6"
                      @update:model-value="handleHolidaysChange"
                    ></v-switch>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData._24hrs"
                      label="24 Hours"
                      color="black"
                      hide-details
                      inset
                      class="mr-6"
                      @update:model-value="handle24HrsChange"
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData.workingHours"
                      label="Working Hours"
                      color="black"
                      hide-details
                      inset
                      class="mr-6"
                      @update:model-value="handleWorkingHoursChange"
                    ></v-switch>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.maxWorkHours"
                      label="Max Work Hours"
                      type="number"
                      variant="outlined"
                      :rules="[maxWorkHoursRule]"
                      :disabled="!formData.workingHours"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-autocomplete
                      v-model="formData.assignedDoors"
                      label="Assigned Doors"
                      :items="availableDoors"
                      item-title="doorName"
                      item-value="id"
                      return-object
                      variant="outlined"
                      multiple
                      chips
                      closable-chips
                      :loading="loadingDoors"
                      :error-messages="getFieldErrorMessage('assignedDoors')"
                      required
                    >
                      <template v-slot:prepend-item>
                        <v-list-item>
                          <v-select
                            v-model="selectedDoorBranch"
                            :items="availableBranches"
                            item-title="branchName"
                            item-value="branchId"
                            label="Filter by Branch"
                            variant="outlined"
                            clearable
                            dense
                            hide-details
                            class="mb-2"
                          ></v-select>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>
                </v-row>

                <!-- Group Type and Assignment in same row -->
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="group-type-section">
                      <div class="section-title font-weight-bold mb-2">
                        Group Type
                      </div>
                      <v-radio-group v-model="formData.groupType" inline>
                        <v-radio
                          label="Doors"
                          value="doors"
                          color="black"
                        ></v-radio>
                        <v-radio
                          label="Devices"
                          value="devices"
                          color="black"
                        ></v-radio>
                      </v-radio-group>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <div class="group-assignment-section">
                      <v-autocomplete
                        v-if="formData.groupType === 'doors'"
                        v-model="formData.assignDoorsGroup"
                        label="Select Door Groups"
                        :items="doorGroups"
                        variant="outlined"
                        multiple
                        chips
                        closable-chips
                        :loading="loadingDoorGroups"
                      >
                        <template v-slot:selection="{ item, index }">
                          <v-chip
                            v-if="index < 3"
                            closable
                            @click:close="removeDoorGroup(item.raw)"
                          >
                            {{ item.title }}
                          </v-chip>
                          <span
                            v-else-if="index === 3"
                            class="text-caption text-grey-darken-1 mx-2"
                          >
                            (+{{ formData.assignDoorsGroup.length - 3 }} more)
                          </span>
                        </template>
                      </v-autocomplete>

                      <v-autocomplete
                        v-else
                        v-model="formData.assignDevicesGroup"
                        label="Select Device Groups"
                        :items="deviceGroups"
                        variant="outlined"
                        multiple
                        chips
                        closable-chips
                        :loading="loadingDeviceGroups"
                      >
                        <template v-slot:selection="{ item, index }">
                          <v-chip
                            v-if="index < 3"
                            closable
                            @click:close="removeDeviceGroup(item.raw)"
                          >
                            {{ item.title }}
                          </v-chip>
                          <span
                            v-else-if="index === 3"
                            class="text-caption text-grey-darken-1 mx-2"
                          >
                            (+{{ formData.assignDevicesGroup.length - 3 }} more)
                          </span>
                        </template>
                      </v-autocomplete>
                    </div>
                  </v-col>
                </v-row>
              </v-window-item>
              <v-window-item value="assignEmployee">
                <AssignToEmployee :accessLevelId="formData.id" />
              </v-window-item>
            </v-window>
          </v-card>
        </div>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import AssignToEmployee from "@/pages/devicesManager/accesslevel/assignToEmployee.vue";

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const form = ref(null);
const selectedTab = ref("basic");
const doors = ref([]);
const branches = ref([]);
const loadingDoors = ref(false);
const loadingBranches = ref(false);
const tenantId = currentUserTenant.getTenantId();
const valid = ref(false);
const formSubmitAttempted = ref(false);
const formErrors = ref({});
const touchedFields = ref({});
const originalForm = ref(null);

// Door and device group refs
const doorGroups = ref([]);
const deviceGroups = ref([]);
const loadingDoorGroups = ref(false);
const loadingDeviceGroups = ref(false);

const formData = ref({
  accessLevelName: "",
  maxWorkHours: 0,
  accessType: false,
  holidays: false,
  _24hrs: false,
  workingHours: false,
  wrkHrs: [],
  assignedDoors: [],
  assignedBranches: [],
  groupType: "doors",
  assignDoorsGroup: [],
  assignDevicesGroup: [],
});

const handleHolidaysChange = (value) => {
  if (value) {
    formData.value._24hrs = false;
    formData.value.workingHours = false;
  }
};

const handle24HrsChange = (value) => {
  if (value) {
    formData.value.holidays = false;
    formData.value.workingHours = false;
  }
};

const handleWorkingHoursChange = (value) => {
  if (value) {
    formData.value.holidays = false;
    formData.value._24hrs = false;
  }
};

const tabRequiredFields = {
  basic: ["accessLevelName", "assignedBranches"],
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const fetchDoors = async () => {
  loadingDoors.value = true;
  const token = getToken();
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/doors?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch doors");
    const data = await response.json();
    doors.value = data.data || [];
  } catch (error) {
    console.error("Error fetching doors:", error);
  } finally {
    loadingDoors.value = false;
  }
};

const fetchBranches = async () => {
  loadingBranches.value = true;
  const token = getToken();
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/branch?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch branches");
    const data = await response.json();
    branches.value = data.data || [];
  } catch (error) {
    console.error("Error fetching branches:", error);
  } finally {
    loadingBranches.value = false;
  }
};

const fetchDoorGroups = async () => {
  loadingDoorGroups.value = true;
  const token = getToken();
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/doors?filter[tenant][tenantId][_eq]=${tenantId}&fields=doorGroup`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch door groups");
    const data = await response.json();

    const uniqueGroups = [
      ...new Set(
        data.data
          .map((item) => item.doorGroup)
          .filter((group) => group && group.trim() !== ""),
      ),
    ];

    doorGroups.value = uniqueGroups.map((group) => group);
  } catch (error) {
    console.error("Error fetching door groups:", error);
  } finally {
    loadingDoorGroups.value = false;
  }
};

const fetchDeviceGroups = async () => {
  loadingDeviceGroups.value = true;
  const token = getToken();
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/controllers?filter[tenant][tenantId][_eq]=${tenantId}&fields=deviceGroup`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch device groups");
    const data = await response.json();

    const uniqueGroups = [
      ...new Set(
        data.data
          .map((item) => item.deviceGroup)
          .filter((group) => group && group.trim() !== ""),
      ),
    ];

    deviceGroups.value = uniqueGroups.map((group) => group);
  } catch (error) {
    console.error("Error fetching device groups:", error);
  } finally {
    loadingDeviceGroups.value = false;
  }
};

const removeDoorGroup = (group) => {
  formData.value.assignDoorsGroup = formData.value.assignDoorsGroup.filter(
    (g) => g !== group,
  );
};

const removeDeviceGroup = (group) => {
  formData.value.assignDevicesGroup = formData.value.assignDevicesGroup.filter(
    (g) => g !== group,
  );
};

const selectedState = ref(null);
const selectedDoorBranch = ref(null);

const availableBranches = computed(() => {
  return branches.value.filter(
    (branch) =>
      (!selectedState.value || branch.state === selectedState.value) &&
      !formData.value.assignedBranches.some(
        (assignedBranch) => assignedBranch.branchId === branch.branchId,
      ),
  );
});

const availableDoors = computed(() => {
  return doors.value.filter(
    (door) =>
      (!selectedDoorBranch.value ||
        door.branchId === selectedDoorBranch.value) &&
      !formData.value.assignedDoors.some(
        (assignedDoor) =>
          assignedDoor.id === door.id || assignedDoor.doors_id?.id === door.id,
      ),
  );
});

onMounted(async () => {
  await fetchDoors();
  await fetchBranches();
  await fetchDoorGroups();
  await fetchDeviceGroups();

  if (props.category) {
    const preparedAssignedDoors = props.category.assignedDoors
      ? props.category.assignedDoors.map((door) => ({
          id: door.id,
          doorName: door.doorName,
          doorNumber: door.doorNumber,
        }))
      : [];

    const preparedAssignedBranches = props.category.assignedBranches
      ? props.category.assignedBranches.map((branch) => ({
          id: branch.id,
          branchId: branch.branchId,
          branchName: branch.branchName,
          state: branch.state,
        }))
      : [];

    formData.value = {
      ...props.category,
      accessLevelName: props.category.name,
      assignedDoors: preparedAssignedDoors,
      accessType: Boolean(props.category.accessType),
      holidays: Boolean(props.category.holidays),
      _24hrs: Boolean(props.category._24hrs),
      workingHours: Boolean(props.category.workingHours),
      groupType: props.category.groupType || "doors",
      assignDoorsGroup: props.category.assignDoorsGroup || [],
      assignDevicesGroup: props.category.assignDevicesGroup || [],
    };

    originalForm.value = { ...formData.value };
  }
});

const transformPayload = (form, originalForm = {}) => {
  const payload = {
    accessType: form.accessType ? 1 : 0,
  };

  originalForm = originalForm || {};
  originalForm.assignedDoors = originalForm.assignedDoors || [];
  originalForm.assignedBranches = originalForm.assignedBranches || [];

  if (form.accessLevelName !== originalForm.accessLevelName) {
    payload.accessLevelName = form.accessLevelName;
  }
  if (form._24hrs !== originalForm._24hrs) {
    payload._24hrs = form._24hrs ? 1 : 0;
  }
  if (form.maxWorkHours !== originalForm.maxWorkHours) {
    payload.maxWorkHours = form.maxWorkHours || 0;
  }
  if (form.workingHours !== originalForm.workingHours) {
    payload.workingHours = form.workingHours ? 1 : 0;
  }
  if (form.holidays !== originalForm.holidays) {
    payload.holidays = form.holidays ? 1 : 0;
  }

  if (form.groupType !== originalForm.groupType) {
    payload.groupType = form.groupType;
  }

  if (form.groupType === "doors" && form.assignDoorsGroup) {
    payload.assignDoorsGroup = form.assignDoorsGroup;
    payload.assignDevicesGroup = [];
  }

  if (form.groupType === "devices" && form.assignDevicesGroup) {
    payload.assignDevicesGroup = form.assignDevicesGroup;
    payload.assignDoorsGroup = [];
  }

  const assignedDoorsChanges = {
    create: [],
    delete: originalForm.assignedDoors
      .filter(
        (origDoor) =>
          !form.assignedDoors.some(
            (door) =>
              (door.id || door.doors_id?.id) ===
              (origDoor.id || origDoor.doors_id?.id),
          ),
      )
      .map((door) => door.id || door.doors_id?.id)
      .filter(Boolean),
  };

  form.assignedDoors.forEach((door) => {
    const doorId = door.id || door.doors_id?.id;
    if (
      doorId &&
      !originalForm.assignedDoors.some(
        (origDoor) => (origDoor.id || origDoor.doors_id?.id) === doorId,
      )
    ) {
      assignedDoorsChanges.create.push({
        accesslevels_id: "+",
        doors_id: { id: doorId },
      });
    }
  });

  if (
    assignedDoorsChanges.create.length > 0 ||
    assignedDoorsChanges.delete.length > 0
  ) {
    payload.assignedDoors = assignedDoorsChanges;
  }

  const assignedBranchesChanges = {
    create: [],
    delete: originalForm.assignedBranches
      .filter(
        (origBranch) =>
          !form.assignedBranches.some(
            (branch) =>
              (branch.branchId || branch.branch_id?.branchId) ===
              (origBranch.branchId || origBranch.branch_id?.branchId),
          ),
      )
      .map((branch) => branch.id || branch.branch_id?.id)
      .filter(Boolean),
  };

  form.assignedBranches.forEach((branch) => {
    const branchId = branch.branchId || branch.branch_id?.branchId;
    if (
      branchId &&
      !originalForm.assignedBranches.some(
        (origBranch) =>
          (origBranch.branchId || origBranch.branch_id?.branchId) === branchId,
      )
    ) {
      assignedBranchesChanges.create.push({
        accesslevels_id: "+",
        branch_id: { id: branchId },
      });
    }
  });

  if (
    assignedBranchesChanges.create.length > 0 ||
    assignedBranchesChanges.delete.length > 0
  ) {
    payload.assignedBranches = assignedBranchesChanges;
  }

  return payload;
};

const handleSave = async () => {
  formSubmitAttempted.value = true;
  if (!validateForm()) {
    return;
  }

  try {
    const payload = transformPayload(formData.value, originalForm.value);
    const token = getToken();

    console.log("Saving with payload:", payload);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels/${formData.value.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update access level");
    }
    const userResponse = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][assignedAccessLevels][accesslevels_id][accessLevelName][_contains]=${props.category.name}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch users");
    }

    const userData = await userResponse.json();

    if (userData.data && userData.data.length > 0) {
      const updatePromises = userData.data.map(async (user) => {
        try {
          const updateResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/personalModule/${user.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                accessOn: payload.accessType ? 1 : 0,
              }),
            },
          );

          if (!updateResponse.ok) {
            throw new Error(`Failed to update user ${user.id}`);
          }
          return updateResponse;
        } catch (error) {
          throw error;
        }
      });

      await Promise.all(updatePromises);
    } else {
      console.log("No users found to update");
    }
    window.location.href = "/deviceManager/accesslevelCatagory";
    emit("close");
  } catch (error) {
    console.error("Error in handleSave:", error);
  }
};

const menuItems = [
  {
    title: "Basic Details",
    icon: "mdi-card-text-outline",
    value: "basic",
  },
  {
    title: "Assign to Employee",
    icon: "mdi-account-multiple-plus",
    value: "assignEmployee",
  },
];

const tabHasError = (tabId) => {
  if (!formSubmitAttempted.value) return false;
  const requiredFields = tabRequiredFields[tabId];
  return requiredFields.some((field) => !formData.value[field]);
};

const getFieldErrorMessage = (field) => {
  if (formData.value[field]) {
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
  if (
    !formData.value[field] &&
    tabRequiredFields[selectedTab.value].includes(field)
  ) {
    formErrors.value[field] = "This field is required";
  }
};

const validateForm = () => {
  let isValid = true;
  Object.keys(tabRequiredFields).forEach((tab) => {
    tabRequiredFields[tab].forEach((field) => {
      if (!formData.value[field]) {
        formErrors.value[field] = "This field is required";
        touchedFields.value[field] = true;
        isValid = false;
      }
    });
  });
  return isValid;
};

const maxWorkHoursRule = (value) => {
  const numValue = Number(value);
  return numValue <= 9 || "Max working hours cannot exceed 9";
};

watch(
  () => formData.value.groupType,
  (newType) => {
    if (newType === "doors" && doorGroups.value.length === 0) {
      fetchDoorGroups();
    } else if (newType === "devices" && deviceGroups.value.length === 0) {
      fetchDeviceGroups();
    }
  },
);

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

watch(selectedTab, (newTab, oldTab) => {
  if (oldTab && tabRequiredFields[oldTab]) {
    const mandatoryFields = tabRequiredFields[oldTab];
    mandatoryFields.forEach((field) => {
      if (!formData.value[field]) {
        touchedFields.value[field] = true;
        formErrors.value[field] = "This field is required";
      }
    });
  }
});
</script>

<style scoped>
.content-wrapper {
  display: flex;
  flex-direction: row;
}
.side-nav {
  width: 250px;
  margin-left: 1rem;
  border-right: 1px solid #e0e0e0;
}
.content-area {
  flex: 1;
}
.has-error {
  color: rgb(var(--v-theme-error));
}
.v-row {
  margin-top: 1rem;
}
.v-toolbar_content {
  background-color: white;
}
.access-level-name {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background-color: #c2d9ec;
  color: black;
  border-radius: 4px;
  font-size: 14px;
}
.text-h7 {
  margin-left: 1rem;
}

.group-type-section,
.group-assignment-section {
  padding: 16px;
  height: 100%;
}

.section-title {
  font-size: 1rem;
  margin-bottom: 12px;
}

.v-radio-group {
  margin-top: 0;
}

@media (max-width: 600px) {
  .group-type-section,
  .group-assignment-section {
    padding: 12px 0;
  }
}
</style>

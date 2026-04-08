<template>
  <div class="company-details">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="black"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="scroll-container" v-else-if="localEmployeeData">
      <div class="d-flex justify-space-between align-center mb-4">
        <h3>Company Details</h3>
        <BaseButton
          variant="primary"
          :disabled="!hasChanges"
          :title="!hasChanges ? 'No changes to save' : 'Save changes'"
          :loading="isUpdating"
          @click="updateCompanyDetails"
        >
          Update
        </BaseButton>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedDepartment"
            :items="departmentOptions"
            item-title="name"
            item-value="id"
            label="Department"
            variant="outlined"
            density="comfortable"
            @update:model-value="handleDepartmentChange"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedBranchLocation"
            :items="locationOptions"
            item-title="name"
            item-value="id"
            label="Branch Location"
            variant="outlined"
            density="comfortable"
            @update:model-value="handleBranchLocationChange"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localEmployeeData.assignedUser.designation"
            label="Designation"
            variant="outlined"
            density="comfortable"
            @input="handleInputChange('assignedUser.designation')"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedCycleType"
            :items="cycleTypeOptions"
            item-title="cycleName"
            item-value="cycleId"
            label="Attendance Cycle Type"
            variant="outlined"
            density="comfortable"
            @update:model-value="handleCycleTypeChange"
            @blur="markFieldAsTouched('cycleType')"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localEmployeeData.assignedUser.dateOfJoining"
            label="Date of Joining"
            type="date"
            variant="outlined"
            density="comfortable"
            @input="handleInputChange('assignedUser.dateOfJoining')"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localEmployeeData.assignedUser.dateOfLeaving"
            label="Date of Leaving"
            type="date"
            variant="outlined"
            density="comfortable"
            @input="handleInputChange('assignedUser.dateOfLeaving')"
          ></v-text-field>
        </v-col>

        <v-select
          v-model="selectedApprover"
          :items="approverOptions"
          item-title="name"
          item-value="id"
          label="Approver"
          variant="outlined"
          density="comfortable"
          clearable
          @update:model-value="handleApproverChange"
        >
          <template v-slot:prepend-item>
            <div class="d-flex align-center">
              <v-text-field
                v-model="searchApprover"
                label="Search by name"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                hide-details
                class="flex-grow-1 mr-2"
                @input="debounceFilterApprover"
              ></v-text-field>
              <v-btn
                variant="text"
                density="compact"
                :icon="showApproverFilters ? 'mdi-chevron-up' : 'mdi-filter'"
                @click.stop="showApproverFilters = !showApproverFilters"
              ></v-btn>
            </div>
            <v-expand-transition>
              <v-card
                v-if="showApproverFilters"
                class="filter-dropdown mt-2"
                elevation="4"
              >
                <v-card-text class="pa-2">
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
                    @update:modelValue="filterApprovers"
                  ></v-select>
                </v-card-text>
              </v-card>
            </v-expand-transition>
            <v-divider class="mt-2"></v-divider>
          </template>
        </v-select>
      </v-row>
    </v-container>

    <v-container v-else>
      <v-row>
        <v-col cols="12" class="text-center">
          <p>No employee data found.</p>
        </v-col>
      </v-row>
    </v-container>

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
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { debounce } from "lodash";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

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

const emit = defineEmits(["update:employeeData", "has-unsaved-changes"]);

const loading = ref(true);
const error = ref(null);
const departmentOptions = ref([]);
const selectedDepartment = ref(null);
const locationOptions = ref([]);
const selectedBranchLocation = ref(null);
const originalData = ref(null);
const changedFields = ref({});
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const localEmployeeData = ref(JSON.parse(JSON.stringify(props.employeeData)));
const validationErrors = ref({});
const touchedFields = ref(new Set());
const cycleTypeOptions = ref([]);
const selectedCycleType = ref(null);
const selectedApprover = ref(null);
const approverOptions = ref([]);
const searchApprover = ref("");
const showApproverFilters = ref(false);
const selectedApproverDepartmentFilter = ref("all");
const debounceFilterApprover = debounce(filterApprovers, 300);
const isUpdating = ref(false);

const handleApproverChange = (newValue) => {
  const originalApprover = originalData.value.approver?.id || null;

  if (newValue !== originalApprover) {
    changedFields.value.approver = newValue ? { id: newValue } : null;
  } else {
    delete changedFields.value.approver;
  }

  emit("has-unsaved-changes", hasChanges.value);
};

const markFieldAsTouched = (fieldName) => {
  touchedFields.value.add(fieldName);
  validateField(fieldName);
};

const validateField = (fieldName) => {
  touchedFields.value.add(fieldName);
  validationErrors.value[fieldName] = null;
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const handleCycleTypeChange = (newValue) => {
  const currentCycleType = originalData.value.cycleType;
  if (newValue !== currentCycleType) {
    changedFields.value.cycleType = newValue;
  } else {
    delete changedFields.value.cycleType;
  }

  if (newValue) {
    validationErrors.value.cycleType = null;
  }
  emit("has-unsaved-changes", hasChanges.value);
};

async function fetchCycleTypes() {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
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

const fetchEmployeeData = async () => {
  const token = authService.getToken();
  try {
    const tenantId = currentUserTenant.getTenantId();
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "id",
      "assignedUser.id",
      "assignedUser.designation",
      "assignedUser.dateOfLeaving",
      "assignedUser.dateOfJoining",
      "assignedUser.PFAccountNumber",
      "assignedUser.ESIAccountNumber",
      "department.id",
      "department.departmentName",
      "branchLocation.id",
      "branchLocation.locdetail.locationName",
      "branchLocation.locType",
      "cycleType",
      "approver",
      "approver.id",
      "approver.first_name",
      "assignedUser.role.name",
    ];

    const queryString = `fields[]=${fields.join("&fields[]=")}&filter[id][_eq]=${props.id}`;
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`;

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
    if (data.data && data.data.length > 0) {
      const employee = data.data[0];
      if (!employee.assignedUser) {
        employee.assignedUser = { id: "" };
      } else if (!employee.assignedUser.id) {
        employee.assignedUser.id = employee.user_id || "";
      }
      localEmployeeData.value = JSON.parse(JSON.stringify(employee));
      emit("update:employeeData", employee);
      originalData.value = JSON.parse(JSON.stringify(employee));

      if (employee.cycleType) {
        selectedCycleType.value = Number(
          employee.cycleType.cycleId || employee.cycleType,
        );
      }

      if (employee.approver) {
        selectedApprover.value = employee.approver.id;
      } else {
        selectedApprover.value = null;
      }

      if (employee.department) {
        selectedDepartment.value = employee.department.id;
      }

      if (employee.branchLocation) {
        selectedBranchLocation.value = employee.branchLocation.id;
      }

      if (!selectedDepartment.value && employee.department?.departmentName) {
        matchDepartmentByName(employee.department.departmentName);
      }

      if (
        !selectedBranchLocation.value &&
        employee.branchLocation?.locdetail?.locationName
      ) {
        matchBranchByName(employee.branchLocation.locdetail.locationName);
      }
    } else {
      throw new Error("No employee data found");
    }
  } catch (err) {
    console.error("Error fetching employee data:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const matchDepartmentByName = (departmentName) => {
  if (!departmentName || !departmentOptions.value.length) return;
  const matchedDept = departmentOptions.value.find(
    (dept) => dept.name.toLowerCase() === departmentName.toLowerCase(),
  );
  if (matchedDept) {
    selectedDepartment.value = matchedDept.id;
  }
};

const matchBranchByName = (locationName) => {
  if (!locationName || !locationOptions.value.length) return;
  const matchedLoc = locationOptions.value.find((loc) =>
    loc.name.toLowerCase().includes(locationName.toLowerCase()),
  );
  if (matchedLoc) {
    selectedBranchLocation.value = matchedLoc.id;
  }
};

const fetchDepartments = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const filterQuery = `filter[tenant][tenantId][_eq]=${tenantId}`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch departments");
    }

    const data = await response.json();
    departmentOptions.value = data.data.map((dept) => ({
      id: dept.id,
      name: dept.departmentName || "Unnamed Department",
    }));

    if (
      localEmployeeData.value?.department?.departmentName &&
      !selectedDepartment.value
    ) {
      matchDepartmentByName(localEmployeeData.value.department.departmentName);
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    departmentOptions.value = [];
    showErrorMessage("Failed to load department options");
  }
};

const fetchLocations = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const filterQuery = `filter[tenant][tenantId][_eq]=${tenantId}`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch locations");
    }

    const data = await response.json();
    locationOptions.value = data.data.map((loc) => ({
      id: loc.id,
      name: `${loc.locdetail.locationName} (${loc.locType})`,
    }));

    if (
      localEmployeeData.value?.branchLocation?.locdetail?.locationName &&
      !selectedBranchLocation.value
    ) {
      matchBranchByName(
        localEmployeeData.value.branchLocation.locdetail.locationName,
      );
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    locationOptions.value = [];
    showErrorMessage("Failed to load location options");
  }
};

const BATCH_SIZE = 100;
const MAX_RECORDS = 1000;

async function fetchAllPaginatedData(baseUrl) {
  let allData = [];
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const paginatedUrl = `${baseUrl}&limit=${BATCH_SIZE}&page=${page}`;
      console.log(`📡 Fetching page ${page} from: ${paginatedUrl}`);

      const response = await fetch(paginatedUrl, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      allData = [...allData, ...data.data];

      if (data.data.length < BATCH_SIZE) {
        hasMore = false;
      } else {
        page++;
      }

      if (page > 100 || allData.length >= MAX_RECORDS) {
        console.warn("⚠️ Reached maximum fetch limit");
        break;
      }
    }

    console.log(`✅ Fetched ${allData.length} total records`);
    return allData;
  } catch (error) {
    console.error("❌ Error in fetchAllPaginatedData:", error);
    return [];
  }
}

async function filterApprovers() {
  try {
    const tenantId = currentUserTenant.getTenantId();
    let allApprovers = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      let filters = [];

      const selectedUserRole =
        localEmployeeData.value?.assignedUser?.role?.name;
      if (selectedUserRole === "Manager") {
        filters.push(
          `filter[_and][0][assignedUser][role][name][_icontains]=Admin`,
        );
      } else if (selectedUserRole === "Employee") {
        filters.push(
          `filter[_and][0][assignedUser][role][name][_icontains]=Admin`,
        );
      } else if (selectedUserRole === "Admin") {
        filters.push(
          `filter[_and][0][assignedUser][role][name][_icontains]=Admin`,
        );
      }

      if (
        selectedApproverDepartmentFilter.value &&
        selectedApproverDepartmentFilter.value !== "all"
      ) {
        const selectedDept = departmentOptions.value.find(
          (dept) => dept.id === selectedApproverDepartmentFilter.value,
        );
        if (selectedDept) {
          filters.push(
            `filter[_and][1][department][departmentName][_icontains]=${encodeURIComponent(selectedDept.name)}`,
          );
        }
      }

      if (searchApprover.value) {
        filters.push(
          `filter[_and][2][assignedUser][first_name][_icontains]=${encodeURIComponent(searchApprover.value)}`,
        );
      }

      const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${tenantId}`;
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
        "role.roleName",
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

      if (currentPageApprovers.length < limit) {
        hasMore = false;
      } else {
        page++;
      }
    }

    approverOptions.value = allApprovers
      .filter(
        (item) =>
          item.assignedUser?.id &&
          item.assignedUser?.first_name &&
          item.accessOn !== false,
      )
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
    console.error("Error filtering approvers:", error);
    approverOptions.value = [];
    showErrorMessage("Failed to load approvers. Please try again.");
  }
}

const handleInputChange = (field) => {
  if (field.includes(".")) {
    const [parent, child] = field.split(".");
    if (child === "dateOfJoining" || child === "dateOfLeaving") {
      if (localEmployeeData.value[parent][child] === "") {
        localEmployeeData.value[parent][child] = null;
      }
    }

    if (
      localEmployeeData.value[parent][child] !==
      originalData.value[parent][child]
    ) {
      changedFields.value[parent] = changedFields.value[parent] || {};
      changedFields.value[parent][child] =
        localEmployeeData.value[parent][child];
    } else {
      if (changedFields.value[parent]) {
        delete changedFields.value[parent][child];
        if (Object.keys(changedFields.value[parent]).length === 0) {
          delete changedFields.value[parent];
        }
      }
    }
  } else {
    if (localEmployeeData.value[field] !== originalData.value[field]) {
      changedFields.value[field] = localEmployeeData.value[field];
    } else {
      delete changedFields.value[field];
    }
  }
  emit("has-unsaved-changes", hasChanges.value);
};

const handleBranchLocationChange = (newValue) => {
  const currentBranchId = originalData.value.branchLocation?.id;
  if (newValue !== currentBranchId) {
    changedFields.value.branchLocation = newValue;
    const selectedLoc = locationOptions.value.find((l) => l.id === newValue);
    if (selectedLoc) {
      localEmployeeData.value.branchLocation = {
        id: newValue,
        locdetail: { locationName: selectedLoc.name.split(" (")[0] },
        locType: selectedLoc.name.match(/\(([^)]+)\)/)?.[1] || "",
      };
    }
  } else {
    delete changedFields.value.branchLocation;
  }
  if (newValue) {
    validationErrors.value.branchLocation = null;
  }
  emit("has-unsaved-changes", hasChanges.value);
};

const hasChanges = computed(() => Object.keys(changedFields.value).length > 0);

const updateCompanyDetails = async () => {
  if (!hasChanges.value) {
    showErrorMessage("No changes to update.");
    return;
  }

  const token = authService.getToken();
  const employeeId = props.id;

  try {
    isUpdating.value = true;
    const payload = {};
    let updateAccess = null;

    const originalDateOfLeaving = originalData.value.assignedUser.dateOfLeaving;
    const newDateOfLeaving = localEmployeeData.value.assignedUser.dateOfLeaving;

    if (newDateOfLeaving && !originalDateOfLeaving) {
      updateAccess = false;
    } else if (!newDateOfLeaving && originalDateOfLeaving) {
      updateAccess = true;
    } else if (
      newDateOfLeaving &&
      originalDateOfLeaving &&
      newDateOfLeaving !== originalDateOfLeaving
    ) {
      updateAccess = false;
    }

    Object.keys(changedFields.value).forEach((key) => {
      if (key === "assignedUser") {
        const assignedUserChanges = { ...changedFields.value.assignedUser };
        if (
          "PFAccountNumber" in assignedUserChanges &&
          assignedUserChanges.PFAccountNumber === ""
        ) {
          assignedUserChanges.PFAccountNumber = null;
        }
        if (
          "ESIAccountNumber" in assignedUserChanges &&
          assignedUserChanges.ESIAccountNumber === ""
        ) {
          assignedUserChanges.ESIAccountNumber = null;
        }
        if (
          "dateOfJoining" in assignedUserChanges &&
          assignedUserChanges.dateOfJoining === ""
        ) {
          assignedUserChanges.dateOfJoining = null;
        }
        if (
          "dateOfLeaving" in assignedUserChanges &&
          assignedUserChanges.dateOfLeaving === ""
        ) {
          assignedUserChanges.dateOfLeaving = null;
        }
        if (
          "designation" in assignedUserChanges &&
          assignedUserChanges.designation === ""
        ) {
          assignedUserChanges.designation = null;
        }
        payload.assignedUser = {
          id: localEmployeeData.value.assignedUser.id,
          ...assignedUserChanges,
        };
      } else if (key === "department") {
        payload.department = changedFields.value.department;
      } else if (key === "branchLocation") {
        payload.branchLocation = changedFields.value.branchLocation;
      } else if (key === "approver") {
        payload.approver = changedFields.value.approver;
      } else if (key === "cycleType") {
        payload.cycleType = changedFields.value.cycleType;
      } else {
        payload[key] =
          changedFields.value[key] !== "" ? changedFields.value[key] : null;
      }
    });

    if (updateAccess !== null) {
      payload.accessOn = updateAccess;
      if (!payload.assignedUser) {
        payload.assignedUser = { id: localEmployeeData.value.assignedUser.id };
      }
      payload.assignedUser.appAccess = updateAccess;
    }

    console.log("Sending personalModule payload:", payload);

    const personalModuleResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${employeeId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!personalModuleResponse.ok) {
      const errorData = await personalModuleResponse.json();
      throw new Error(
        `Failed to update personal module: ${errorData.errors?.[0]?.message || personalModuleResponse.statusText}`,
      );
    }

    if (updateAccess !== null) {
      await updateCardAccess(employeeId, updateAccess);
    }

    await fetchEmployeeData();
    changedFields.value = {};
    emit("has-unsaved-changes", false);
    showSuccessMessage("Company details updated successfully!");
  } catch (error) {
    console.error("Error updating company details:", error);
    showErrorMessage(
      `Failed to update company details. Please try again: ${error.message}`,
    );
  } finally {
    isUpdating.value = false;
  }
};

const updateCardAccess = async (employeeId, enableAccess) => {
  const token = authService.getToken();
  try {
    const cardsResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][_eq]=${employeeId}&fields=id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!cardsResponse.ok) {
      const errorData = await cardsResponse.json();
      throw new Error(
        `Failed to fetch cards: ${errorData.errors?.[0]?.message || cardsResponse.statusText}`,
      );
    }

    const cardsData = await cardsResponse.json();
    const cardsToUpdate = cardsData.data;

    if (cardsToUpdate.length > 0) {
      const bulkUpdatePayload = cardsToUpdate.map((card) => ({
        id: card.id,
        cardAccess: enableAccess,
      }));

      console.log(
        "Sending cardManagement bulk update payload:",
        bulkUpdatePayload,
      );

      const cardPatchResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/cardManagement`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bulkUpdatePayload),
        },
      );

      if (!cardPatchResponse.ok) {
        const errorData = await cardPatchResponse.json();
        throw new Error(
          `Failed to update card access: ${errorData.errors?.[0]?.message || cardPatchResponse.statusText}`,
        );
      }
      console.log("Card access updated successfully.");
    } else {
      console.log("No cards found for this employee to update access.");
    }
  } catch (error) {
    console.error("Error in updateCardAccess:", error);
    throw error;
  }
};

const handleDepartmentChange = (newValue) => {
  const currentDeptId = originalData.value.department?.id;
  if (newValue !== currentDeptId) {
    changedFields.value.department = newValue;
    const selectedDept = departmentOptions.value.find((d) => d.id === newValue);
    if (selectedDept) {
      localEmployeeData.value.department = {
        id: newValue,
        departmentName: selectedDept.name,
      };
    }
  } else {
    delete changedFields.value.department;
  }
  if (newValue) {
    validationErrors.value.department = null;
  }
  emit("has-unsaved-changes", hasChanges.value);
};

onMounted(async () => {
  await Promise.all([fetchCycleTypes(), fetchDepartments(), fetchLocations()]);
  await fetchEmployeeData();
  await filterApprovers();
});

watch(
  () => props.employeeData,
  (newVal) => {
    if (newVal) {
      localEmployeeData.value = JSON.parse(JSON.stringify(newVal));
      if (newVal.department?.id) {
        selectedDepartment.value = newVal.department.id;
      } else if (newVal.department?.departmentName) {
        matchDepartmentByName(newVal.department.departmentName);
      }
      if (newVal.branchLocation?.id) {
        selectedBranchLocation.value = newVal.branchLocation.id;
      } else if (newVal.branchLocation?.locdetail?.locationName) {
        matchBranchByName(newVal.branchLocation.locdetail.locationName);
      }
      if (newVal.approver) {
        selectedApprover.value = newVal.approver.id;
      } else {
        selectedApprover.value = null;
      }
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => props.id,
  () => {
    fetchEmployeeData();
  },
);

watch(
  () => localEmployeeData.value?.assignedUser?.role?.name,
  (newRole) => {
    if (newRole) {
      selectedApprover.value = null;
      filterApprovers();
    }
  },
  { immediate: true },
);

watch(departmentOptions, (newOptions) => {
  if (
    newOptions.length &&
    localEmployeeData.value?.department?.departmentName &&
    !selectedDepartment.value
  ) {
    matchDepartmentByName(localEmployeeData.value.department.departmentName);
  }
});

watch(locationOptions, (newOptions) => {
  if (
    newOptions.length &&
    localEmployeeData.value?.branchLocation?.locdetail?.locationName &&
    !selectedBranchLocation.value
  ) {
    matchBranchByName(
      localEmployeeData.value.branchLocation.locdetail.locationName,
    );
  }
});
</script>

<style scoped>
.company-details {
  padding: 20px;
}
.scroll-container {
  height: calc(90vh - 170px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
}
.v-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

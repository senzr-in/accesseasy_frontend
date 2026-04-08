<!-- /senzrGo/senzrfieldopsfrontend/src/components/WorkOrdeForm_Components/form/FieldRenderer.vue -->
<template>
  <!-- Wrap the entire field wrapper with v-if to control visibility -->
  <div v-if="isFieldVisible" class="field-wrapper">
    <v-label class="field-label">
      {{ field.label }}
      <span v-if="isFieldMandatory(field, userRole)" class="required-indicator"
        >*</span
      >
    </v-label>

    <!-- Special handling for orgId field type -->
    <div v-if="isOrgIdField">
      <v-autocomplete
        v-model="formData[field.key]"
        :items="filteredOrganizations"
        :loading="loadingOrganizations"
        item-title="orgName"
        item-value="id"
        variant="outlined"
        density="comfortable"
        :error-messages="touchedFields[field.key] ? fieldErrors : []"
        clearable
        class="field-input"
        :menu-props="{ maxHeight: 400 }"
        @update:model-value="handleOrgSelection"
        @blur="markFieldTouched(field.key)"
      >
        <template #prepend-inner>
          <v-icon>mdi-domain</v-icon>
        </template>

        <!-- Search box inside dropdown menu -->
        <template #prepend-item>
          <v-text-field
            v-model="orgSearchQuery"
            placeholder="Search organizations..."
            density="compact"
            variant="outlined"
            hide-details
            clearable
            class="ma-2"
            @click.stop
            @keydown.stop
          >
          </v-text-field>
          <v-divider class="mb-2"></v-divider>
        </template>

        <template #item="{ props: itemProps, item }">
          <v-list-item v-bind="itemProps">
            <template #append>
              <v-chip
                size="x-small"
                :color="orgTypeColor(item.raw.orgType)"
                variant="tonal"
              >
                {{ orgTypeLabel(item.raw.orgType) }}
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-autocomplete>
    </div>

    <!-- UsersId special select -->
    <v-autocomplete
      v-else-if="isUsersField"
      :items="searchedUsers"
      :loading="loadingUsers"
      item-title="label"
      item-value="id"
      v-model="formData.UsersId"
      :hint="formData?.UsersId ? 'Personal ID selected' : 'Select employee'"
      persistent-hint
      clearable
      variant="outlined"
      density="comfortable"
      class="field-input"
      :menu-props="{ maxHeight: 400 }"
      :error-messages="touchedFields[field.key] ? fieldErrors : []"
      @update:model-value="handleUserSelection"
      @blur="markFieldTouched(field.key)"
    >
      <!-- Search box inside dropdown menu -->
      <template #prepend-item>
        <v-text-field
          v-model="userSearchQuery"
          placeholder="Search by name or employee ID..."
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="ma-2"
          @click.stop
          @keydown.stop
        >
        </v-text-field>
        <v-divider class="mb-2"></v-divider>
      </template>

      <template #item="{ props: itemProps, item }">
        <v-list-item v-bind="itemProps">
          <template #append>
            <v-chip
              size="x-small"
              :color="statusColor(item?.raw?.attendance?.status)"
              variant="tonal"
              :prepend-icon="statusIcon(item?.raw?.attendance?.status)"
            >
              {{ statusLabel(item?.raw?.attendance?.status) }}
            </v-chip>
          </template>
        </v-list-item>
      </template>
    </v-autocomplete>

    <!-- Team/Department field -->
    <v-autocomplete
      v-else-if="isTeamField && teamEnabled"
      :items="searchedDepartments"
      :loading="loadingDepartments"
      item-title="departmentName"
      item-value="id"
      v-model="formData.team"
      hint="Select department"
      persistent-hint
      clearable
      variant="outlined"
      density="comfortable"
      class="field-input"
      :menu-props="{ maxHeight: 400 }"
      :error-messages="touchedFields[field.key] ? fieldErrors : []"
      @update:model-value="handleDepartmentSelection"
      @blur="markFieldTouched(field.key)"
    >
      <!-- Search box inside dropdown menu -->
      <template #prepend-item>
        <v-text-field
          v-model="departmentSearchQuery"
          placeholder="Search departments..."
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="ma-2"
          @click.stop
          @keydown.stop
        >
          <template #prepend-inner>
            <v-icon size="20">mdi-magnify</v-icon>
          </template>
        </v-text-field>
        <v-divider class="mb-2"></v-divider>
      </template>
    </v-autocomplete>

    <!-- gps-currentLocation -->
    <div v-else-if="field.type === 'gps-currentLocation'">
      <v-text-field
        v-model="formData[field.key]"
        variant="outlined"
        density="comfortable"
        readonly
        :class="{ 'captured-location': !!formData[field.key] }"
        append-inner-icon="mdi-crosshairs-gps"
        :error-messages="touchedFields[field.key] ? fieldErrors : []"
        @click:append-inner="() => captureCurrentLocation(field)"
        @blur="markFieldTouched(field.key)"
      />
      <v-alert
        v-if="locationError"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-2"
      >
        {{ locationError }}
      </v-alert>
    </div>

    <!-- Client Location (using gps type/key as dropdown) -->
    <div v-else-if="isClientLocationField">
      <v-select
        :disabled="disableClientLocation"
        v-model="formData[field.key]"
        :items="clientLocations"
        item-title="name"
        item-value="id"
        variant="outlined"
        density="comfortable"
        :hint="disableClientLocation ? 'Select a Client first' : ''"
        persistent-hint
        class="field-input"
        :error-messages="touchedFields[field.key] ? fieldErrors : []"
        @update:model-value="onLocationSelect"
        @blur="markFieldTouched(field.key)"
      />
    </div>

    <!-- Date fields -->
    <v-text-field
      v-else-if="getFieldTypeString(field.type) === 'date'"
      v-model="formData[field.key]"
      type="datetime-local"
      variant="outlined"
      density="comfortable"
      class="field-input"
      :min="getDateMin(field)"
      :error-messages="touchedFields[field.key] ? fieldErrors : []"
      @update:model-value="markFieldTouched(field.key)"
      @blur="markFieldTouched(field.key)"
    />

    <!-- Image field -->
    <div v-else-if="getFieldTypeString(field.type) === 'image'">
      <v-file-input
        v-model="selectedFiles"
        :label="field.label || 'Upload Images'"
        variant="outlined"
        density="comfortable"
        multiple
        accept="image/jpeg, image/jpg, image/png"
        prepend-icon="mdi-camera"
        class="field-input"
        :error-messages="touchedFields[field.key] ? fieldErrors : []"
        @update:model-value="handleMultipleImageSelect"
        @blur="markFieldTouched(field.key)"
      />
      <div v-if="imagePreviews.length > 0" class="preview-container mt-4">
        <div
          v-for="(preview, index) in imagePreviews"
          :key="index"
          class="preview-item"
        >
          <img :src="preview.url" alt="Preview" class="preview-image" />
          <v-btn
            icon
            size="small"
            color="red"
            class="delete-btn"
            @click="deleteImage(index)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <span v-if="preview.id" class="file-id">ID: {{ preview.id }}</span>
        </div>
      </div>
      <v-alert v-if="uploadError" type="error" variant="tonal" class="mt-2">{{
        uploadError
      }}</v-alert>
    </div>

    <!-- Generic dynamic field (exclude gps/clientLocation from fallback) -->
    <component
      v-else
      :is="getFieldComponent(field)"
      v-bind="resolvedProps"
      v-model="formData[field.key]"
      :error-messages="touchedFields[field.key] ? fieldErrors : []"
      @click:append-inner="handleFieldAction"
      @update:model-value="markFieldTouched(field.key)"
      @blur="markFieldTouched(field.key)"
      class="field-input"
    />

    <!-- Field-specific additional content -->
    <div
      v-if="field.type === 'otp' || field.type === 'happy-code'"
      class="mt-3"
    >
      <v-btn
        color="orange-darken-1"
        variant="tonal"
        block
        @click="$emit('generate-code', field)"
        prepend-icon="mdi-key-variant"
        class="generate-code-btn"
      >
        Generate/Resend Code
      </v-btn>
    </div>

    <!-- Unsupported field type warning -->
    <v-alert
      v-if="!isFieldTypeSupported(field.type)"
      type="warning"
      variant="tonal"
      density="compact"
      class="mt-2"
    >
      <template #prepend>
        <v-icon>mdi-alert-circle-outline</v-icon>
      </template>
      Unsupported field type: {{ getFieldTypeDisplay(field.type) }}
    </v-alert>
  </div>
</template>

<script setup>
import { computed, ref, watch, inject } from "vue";
import {
  getValidationRules,
  isFieldMandatory,
} from "@/utils/createWOF/validationRules";
import {
  getFieldComponent,
  getFieldProps,
  getFieldTypeString,
  getFieldTypeDisplay,
  isFieldTypeSupported,
  getFieldIcon,
} from "@/utils/createWOF/fieldUtils";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useFormApi } from "@/composables/workorder/createWorkOrderForm/useFormApi";

const props = defineProps({
  field: Object,
  formData: Object,
  clients: Array,
  users: Array,
  departments: Array,
  userRole: String,
  options: Object,
  sharedProperties: Object,
});

const emit = defineEmits([
  "field-action",
  "generate-code",
  "validation-change",
]);

const touchedFields = inject("touchedFields", ref({}));

// Organization selection state
const filteredOrganizations = ref([]);
const loadingOrganizations = ref(false);
const orgSearchQuery = ref("");

// Location state
const locationError = ref(null);
const clientLocations = ref([]);
const loadingClientLocations = ref(false);

// Image upload state
const selectedFiles = ref([]);
const imagePreviews = ref([]);
const uploadError = ref(null);

// User search state
const searchedUsers = ref([]);
const loadingUsers = ref(false);
const userSearchQuery = ref("");

// Department search state
const searchedDepartments = ref([]);
const loadingDepartments = ref(false);
const departmentSearchQuery = ref("");

// Get composable functions
const { searchOrganizations, searchUsers, searchDepartments } = useFormApi();

// New computed property to determine field visibility based on roleBasedRequired
const isFieldVisible = computed(() => {
  const required = props.field?.roleBasedRequired;
  if (required && typeof required === "object" && props.userRole) {
    // If role exists in roleBasedRequired, return its value (true = show, false = hide)
    if (required[props.userRole] !== undefined) {
      return required[props.userRole] === true;
    }
  }
  // Default to true if roleBasedRequired is not defined or role is not found
  return true;
});

const fieldErrors = computed(() => {
  if (!touchedFields.value[props.field?.key]) {
    return [];
  }

  if (!props.field || !props.field.key) {
    console.warn("[v0] fieldErrors computed with invalid field");
    return [];
  }

  const value = props.formData[props.field.key];

  try {
    const rules = getValidationRules(
      props.field,
      props.userRole,
      props.formData,
    );

    const errors = [];
    for (const rule of rules) {
      if (typeof rule === "function") {
        const result = rule(value);
        if (result !== true) {
          errors.push(result);
        }
      }
    }

    return errors;
  } catch (error) {
    console.error("[v0] Error in fieldErrors computed:", error);
    return [];
  }
});

const isOrgIdField = computed(() => {
  const key = props.field?.key || "";
  return key === "orgId" || getFieldTypeString(props.field?.type) === "orgId";
});

const isUsersField = computed(() => {
  const key = props.field?.key || props.field?.name || "";
  return key === "UsersId";
});

const usersLabel = computed(() => props.field?.label || "Assign to (Employee)");

const isClientLocationField = computed(() => {
  const type = getFieldTypeString(props.field.type);
  return type === "gps" || props.field.key === "gps";
});

const hasClientSelected = computed(() => {
  const m = props.formData || {};
  return Boolean(
    m.clientId || m.clientID || m.client || m.client_id || m.orgId,
  );
});

const disableClientLocation = computed(
  () => isClientLocationField.value && !hasClientSelected.value,
);

const teamEnabled = computed(() => {
  return props.sharedProperties?.booleans?.team === true;
});

const isTeamField = computed(() => {
  const key = props.field?.key || "";
  return key === "team";
});

// New functions for orgType chip display
const orgTypeLabel = (orgType) => {
  return orgType === "clientorg" ? "Client" : "Contact";
};

const orgTypeColor = (orgType) => {
  return orgType === "clientorg" ? "blue" : "purple";
};

const resolvedProps = computed(() => {
  const base = getFieldProps(props.field);
  const typeString = getFieldTypeString(props.field?.type);
  const key = props.field?.key;

  const defaults = {
    hideDetails: "auto",
  };

  if (typeString === "clientSelector" || key === "orgId") {
    return {
      ...base,
      ...defaults,
      items: props.clients || [],
      itemTitle: "orgName",
      itemValue: "id",
      returnObject: false,
      variant: base?.variant || "outlined",
      density: base?.density || "comfortable",
      clearable: true,
    };
  }

  if (
    typeString === "gps" ||
    (props.field?.label || "").toLowerCase().includes("location")
  ) {
    return {
      ...base,
      ...defaults,
      clearable: true,
    };
  }

  return {
    ...base,
    ...defaults,
  };
});

const markFieldTouched = (fieldKey) => {
  if (!fieldKey) {
    console.warn("[v0] markFieldTouched called with undefined fieldKey");
    return;
  }

  touchedFields.value[fieldKey] = true;
  validateField();
};

const validateField = () => {
  if (!props.field || !props.field.key) {
    console.warn("[v0] validateField called with invalid field");
    return;
  }

  const isValid = fieldErrors.value.length === 0;
  const isMandatory = isFieldMandatory(props.field, props.userRole);
  const value = props.formData[props.field.key];
  const hasValue = value !== null && value !== undefined && value !== "";

  emit("validation-change", {
    fieldKey: props.field.key,
    isValid,
    isMandatory,
    hasValue,
    errors: fieldErrors.value,
  });
};

const fetchFilteredOrganizations = async () => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  if (!token || !tenantId) {
    console.error("Token or Tenant ID not available");
    return;
  }

  loadingOrganizations.value = true;

  try {
    const params = new URLSearchParams([
      ["limit", "100"],
      ["fields[]", "orgName"],
      ["fields[]", "id"],
      ["fields[]", "orgType"],
      ["filter[_and][0][tenant][tenantId][_eq]", tenantId],
      ["filter[_and][1][status][_neq]", "archived"],
      ["sort", "orgName"],
    ]).toString();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    filteredOrganizations.value = (data?.data || []).map((org) => ({
      id: org.id,
      orgName: org.orgName,
      orgType: org.orgType,
    }));
  } catch (error) {
    console.error("Error fetching organizations:", error);
    filteredOrganizations.value = [];
  } finally {
    loadingOrganizations.value = false;
  }
};

// Handlers for selections (to prevent search trigger on selection)
const handleOrgSelection = (value) => {
  markFieldTouched(props.field.key);
  // Don't trigger search when selecting
};

const handleUserSelection = (value) => {
  markFieldTouched(props.field.key);
  // Don't trigger search when selecting
};

const handleDepartmentSelection = (value) => {
  markFieldTouched(props.field.key);
  // Don't trigger search when selecting
};

const captureCurrentLocation = (field) => {
  if (!navigator.geolocation) {
    locationError.value = "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);

      locationError.value = null;
      props.formData[field.key] = `${lat}, ${lng}`;
      props.formData.lat = lat;
      props.formData.lng = lng;

      markFieldTouched(field.key);
    },
    (error) => {
      console.error("Location error:", error);
      locationError.value =
        "Failed to capture location. Please allow location access or try again.";
    },
  );
};

const handleMultipleImageSelect = async (files) => {
  uploadError.value = null;
  const newPreviews = [];
  for (const file of files) {
    try {
      const id = await uploadImage(file);
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push({ url: previewUrl, id, file });
    } catch (err) {
      uploadError.value = err.message;
    }
  }
  imagePreviews.value = [...imagePreviews.value, ...newPreviews];
  props.formData[props.field.key] = imagePreviews.value.map((p) => p.id);
  markFieldTouched(props.field.key);
};

const deleteImage = (index) => {
  const preview = imagePreviews.value[index];
  const fileId = preview?.id;
  const previewUrl = preview?.url;

  const updatedPreviews = imagePreviews.value.filter((_, i) => i !== index);
  imagePreviews.value = updatedPreviews;

  const updatedIds = updatedPreviews.map((p) => p.id);
  props.formData[props.field.key] = updatedIds;

  markFieldTouched(props.field.key);

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  if (fileId) {
    deleteFileFromServer(fileId);
  }
};

const deleteFileFromServer = async (fileId) => {
  try {
    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/files/${fileId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) throw new Error("Failed to delete file");
  } catch (err) {
    console.error("Error deleting file:", err);
    uploadError.value = "Failed to delete file from server.";
  }
};

const getWorkOrdersFolderId = async () => {
  try {
    const token = authService.getToken();
    const tenantId = currentUserTenant.getTenantId();
    if (!tenantId) throw new Error("Tenant ID not found");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields[]=foldersId`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.ok) throw new Error("Failed to fetch tenant data");

    const data = await response.json();
    if (data.data?.[0]?.foldersId) {
      const workordersFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Workorders",
      );
      if (workordersFolder) return workordersFolder.id;
    }
    return null;
  } catch (err) {
    console.error("Error fetching Workorders folder ID:", err);
    return null;
  }
};

const uploadImage = async (file) => {
  try {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, JPEG, or PNG files are allowed");
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Image size must be less than 5MB");
    }

    const tenantIdValue = currentUserTenant.getTenantId();
    if (!tenantIdValue) throw new Error("Tenant ID not found");

    const workOrdersFolderId = await getWorkOrdersFolderId();
    const tokenValue = authService.getToken();

    const formData = new FormData();
    if (workOrdersFolderId) {
      formData.append("folder", workOrdersFolderId);
    }
    const fileExtension = file.name.split(".").pop();
    const customFileName = `task-${tenantIdValue}-${Date.now()}.${fileExtension}`;
    formData.append("file", file, customFileName);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenValue}` },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    const result = await response.json();
    return result.data.id;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

async function fetchClientLocations(orgId) {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  if (!token || !tenantId) {
    console.error("Token or Tenant ID not available");
    return;
  }

  loadingClientLocations.value = true;

  try {
    const filterParam = `filter[_and][0][orgLocation][id][_eq]=${orgId}`;
    const params =
      new URLSearchParams([
        ["limit", "-1"],
        ["fields[]", "locSize"],
        ["fields[]", "locType"],
        ["fields[]", "locdetail"],
        ["fields[]", "locmark"],
        ["fields[]", "id"],
        ["fields[]", "orgLocation.orgName"],
        ["fields[]", "contactDetails"],
        [`filter[_and][1][tenant][tenantId][_eq]`, tenantId],
      ]).toString() +
      "&" +
      filterParam;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    clientLocations.value = (data?.data || [])
      .filter((loc) => loc.locType !== "serviceable_area")
      .map((loc) => ({
        id: loc.id,
        name: loc.locdetail?.locationName || "Unnamed Location",
        locmark: loc.locmark,
        locSize: loc.locSize,
      }));
  } catch (error) {
    console.error("Error fetching client locations:", error);
    clientLocations.value = [];
  } finally {
    loadingClientLocations.value = false;
  }
}

const onLocationSelect = (locId) => {
  const selectedLoc = clientLocations.value.find((l) => l.id === locId);
  if (selectedLoc) {
    const coords = selectedLoc.locmark?.coordinates || [];
    props.formData.currentLat = coords[1] || null;
    props.formData.currentLng = coords[0] || null;
    props.formData.radiusInMeters = selectedLoc.locSize || null;
  } else {
    props.formData.currentLat = null;
    props.formData.currentLng = null;
    props.formData.radiusInMeters = null;
  }
  markFieldTouched(props.field.key);
};

const handleFieldAction = () => {
  emit("field-action", props.field);
};

const getDateMin = (field) => {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + offset);
  const minDate = nowIST.toISOString().slice(0, 16);

  if (isDueDate(field)) {
    return props.formData?.fromDate || minDate;
  }
  return minDate;
};

const isDueDate = (field) => {
  const key = (field?.key || "").toLowerCase();
  return key.includes("due") || key.includes("end");
};

const statusLabel = (s) =>
  s === "in" ? "Punched In" : s === "out" ? "Punched Out" : "Not Punched In";
const statusColor = (s) =>
  s === "in" ? "green" : s === "out" ? "red" : "orange";
const statusIcon = (s) =>
  s === "in"
    ? "mdi-login-variant"
    : s === "out"
      ? "mdi-logout-variant"
      : "mdi-clock-outline";

watch(
  () => props.formData.orgId,
  async (newOrgId) => {
    if (isClientLocationField.value && newOrgId) {
      await fetchClientLocations(newOrgId);
    } else if (!newOrgId) {
      clientLocations.value = [];
      props.formData.clientLocationId = null;
      props.formData.currentLat = null;
      props.formData.currentLng = null;
      props.formData.radiusInMeters = null;
    }
  },
  { immediate: true },
);

// Organization search with backend API
let orgSearchTimeout = null;
watch(orgSearchQuery, (newQuery) => {
  if (orgSearchTimeout) clearTimeout(orgSearchTimeout);

  orgSearchTimeout = setTimeout(async () => {
    if (newQuery && newQuery.trim()) {
      console.log("[v0] Searching organizations:", newQuery);
      loadingOrganizations.value = true;
      try {
        const results = await searchOrganizations(newQuery, null);
        filteredOrganizations.value = results;
        console.log("[v0] Organization search results:", results.length);
      } catch (error) {
        console.error("[v0] Error searching organizations:", error);
      } finally {
        loadingOrganizations.value = false;
      }
    } else {
      await fetchFilteredOrganizations();
    }
  }, 500);
});

// Initialize users from props
watch(
  () => props.users,
  (newUsers) => {
    if (newUsers && newUsers.length > 0) {
      searchedUsers.value = newUsers;
    }
  },
  { immediate: true },
);

// User search with backend API
let userSearchTimeout = null;
watch(userSearchQuery, (newQuery) => {
  if (userSearchTimeout) clearTimeout(userSearchTimeout);

  userSearchTimeout = setTimeout(async () => {
    if (newQuery && newQuery.trim()) {
      console.log("[v0] Searching users:", newQuery);
      loadingUsers.value = true;
      try {
        const results = await searchUsers(newQuery);
        searchedUsers.value = results;
        console.log("[v0] User search results:", results.length);
      } catch (error) {
        console.error("[v0] Error searching users:", error);
      } finally {
        loadingUsers.value = false;
      }
    } else {
      searchedUsers.value = props.users || [];
    }
  }, 500);
});

// Initialize departments from props
watch(
  () => props.departments,
  (newDepartments) => {
    if (newDepartments && newDepartments.length > 0) {
      searchedDepartments.value = newDepartments;
    }
  },
  { immediate: true },
);

// Department search with backend API
let departmentSearchTimeout = null;
watch(departmentSearchQuery, (newQuery) => {
  if (departmentSearchTimeout) clearTimeout(departmentSearchTimeout);

  departmentSearchTimeout = setTimeout(async () => {
    if (newQuery && newQuery.trim()) {
      console.log("[v0] Searching departments:", newQuery);
      loadingDepartments.value = true;
      try {
        const results = await searchDepartments(newQuery);
        searchedDepartments.value = results;
        console.log("[v0] Department search results:", results.length);
      } catch (error) {
        console.error("[v0] Error searching departments:", error);
      } finally {
        loadingDepartments.value = false;
      }
    } else {
      searchedDepartments.value = props.departments || [];
    }
  }, 500);
});

// Initialize organizations on mount
fetchFilteredOrganizations();
</script>

<style scoped>
.field-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 12px;
  font-size: medium;

}

.required-indicator {
  color: #f44336;
  margin-left: 4px;
  font-weight: 700;
}

.captured-location input {
  color: red !important;
  font-weight: 600;
}

.field-input {
  transition: all 0.3s ease;
}

.field-input:hover {
  transform: translateY(-1px);
}

.generate-code-btn {
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s ease;
}

.generate-code-btn:hover {
  transform: translateY(-2px);
}

:deep(.v-text-field .v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

:deep(.v-text-field .v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

:deep(.v-text-field .v-field--focused) {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.2);
}

:deep(.v-select .v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.v-textarea .v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.v-file-input .v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.v-checkbox .v-selection-control__wrapper) {
  color: #1976d2;
}

:deep(.v-text-field input[type="datetime-local"]) {
  font-size: medium;

  padding: 8px 12px;
  width: 100%;
}

.preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.preview-item {
  position: relative;
  width: 120px;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: white;
}

.file-id {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: medium;

  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 4px;
  border-radius: 4px;
}

/* Autocomplete dropdown styles */
:deep(.v-autocomplete .v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

:deep(.v-autocomplete .v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

:deep(.v-autocomplete .v-field--focused) {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.2);
}

:deep(.v-autocomplete .v-chip) {
  font-size: medium;

  height: 20px;
  margin-left: 8px;
}

/* Search box inside dropdown styling */
:deep(.v-list-item) {
  cursor: pointer;
}

:deep(.v-list-item:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Remove extra spacing */
:deep(.v-input__details) {
  min-height: unset !important;
  padding-top: unset !important;
}

.v-messages {
  min-height: unset !important;
}

/* Style for the search text field inside dropdown */
:deep(.v-autocomplete .v-overlay__content) {
  border-radius: 8px;
}

:deep(.v-list) {
  padding-top: 0 !important;
}
</style>

<template>
  <div>
    <v-form ref="form">
      <v-toolbar density="compact" color="grey-lighten-4">
        <v-btn icon color="black" @click="handleClose">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title class="ml-4">Edit Department</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" class="mr-2" @click="handleClose"
          >CANCEL</v-btn
        >
        <v-btn style="background-color:  #68ade1" color="white" @click="handleSave"
          >SAVE</v-btn
        >
      </v-toolbar>

      <div class="d-flex content-wrapper">
        <!-- Side Navigation -->
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
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <!-- Content Area -->
        <div class="content-area pa-4">
          <v-card flat>
            <h2 class="text-h6 mb-4">Department Details</h2>

            <v-window v-model="selectedTab">
              <!-- Basic Details -->
              <v-window-item value="basic">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.departmentName"
                      label="Department Name *"
                      variant="outlined"
                      :rules="departmentNameRules"
                      :error-messages="departmentNameError"
                      required
                      @input="capitalizeFirstLetterEachWord('departmentName')"
                      @blur="checkDepartmentExists"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-autocomplete
                      v-model="formData.branch"
                      label="Branch"
                      :items="availableBranches"
                      item-title="branchName"
                      item-value="id"
                      variant="outlined"
                      :loading="loadingBranches"
                    ></v-autocomplete>
                  </v-col>
                </v-row>
              </v-window-item>
            </v-window>
          </v-card>
        </div>
      </div>

      <v-snackbar
        v-model="showSuccessAlert"
        color="success"
        timeout="2000"
        location="top"
      >
        <v-icon class="me-2" color="white">mdi-check-circle</v-icon>
        Department updated successfully!
      </v-snackbar>

      <v-snackbar
        v-model="showErrorAlert"
        color="red"
        timeout="2000"
        location="top"
      >
        <v-icon class="me-2" color="white">mdi-alert-circle</v-icon>
        {{ errorMessage }}
        <template v-slot:actions>
          <v-btn color="red" variant="text" @click="showErrorAlert = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const branches = ref([]);
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref("");
const loadingBranches = ref(false);
const form = ref(null);
const selectedTab = ref("department");
const tenantId = currentUserTenant.getTenantId();
const originalForm = ref(null);
const departmentNameError = ref("");
const isDepartmentNameValid = ref(true);

const formData = ref({
  departmentName: "",
  status: "unassigned",
  branch: null,
});

const departmentNameRules = [
  (v) => !!v || 'Department Name is required',
  (v) => isDepartmentNameValid.value || 'Department name already exists'
];

const capitalizeFirstLetterEachWord = (fieldName) => {
  const value = formData.value[fieldName];
  if (value) {
    formData.value[fieldName] = value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const checkDepartmentExists = async () => {
  // Skip validation if department name is empty or unchanged
  if (!formData.value.departmentName || 
      (originalForm.value && formData.value.departmentName === originalForm.value.departmentName)) {
    isDepartmentNameValid.value = true;
    departmentNameError.value = "";
    return;
  }

  try {
    const token = getToken();
    const encodedDeptName = encodeURIComponent(formData.value.departmentName);
    const url = `${import.meta.env.VITE_API_URL}/items/department?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][departmentName][_eq]=${encodedDeptName}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to validate department name");
    }

    const data = await response.json();
    
    // Check if department exists and it's not the current one being edited
    if (data.data && data.data.length > 0) {
      // If we're editing and this is the same department, it's valid
      if (departmentId && data.data[0].departmentId === departmentId) {
        isDepartmentNameValid.value = true;
        departmentNameError.value = "";
      } else {
        isDepartmentNameValid.value = false;
        departmentNameError.value = "Department name already exists";
      }
    } else {
      isDepartmentNameValid.value = true;
      departmentNameError.value = "";
    }
  } catch (error) {
    console.error("Error checking department name:", error);
    // Don't invalidate the form on API error
    isDepartmentNameValid.value = true;
    departmentNameError.value = "";
  }
};

const fetchDepartmentData = async (id) => {
  try {
    const token = getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department/${id}?fields=departmentId,departmentName,branch.branchName,branch.id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch department data");
    }

    const data = await response.json();
    originalForm.value = { ...data.data };
    formData.value = {
      ...data.data,
      branch: data.data.branch ? data.data.branch.id : null,
    };
  } catch (error) {
    console.error("Error fetching department data:", error);
    errorMessage.value = "Failed to fetch department data";
    showErrorAlert.value = true;
  }
};

const fetchBranches = async () => {
  loadingBranches.value = true;
  const token = getToken();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/branch?filter[tenant][tenantId][_eq]=${tenantId}`,
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

const availableBranches = computed(() => branches.value);
var departmentId;

onMounted(() => {
  fetchBranches();
  // Access the id parameter from the route
  departmentId = route.params.id;
  console.log("Department ID from route params:", departmentId);
  if (departmentId) {
    fetchDepartmentData(departmentId);
  } else {
    console.error("No department ID found in route params");
  }
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      console.log("Route param id changed:", newId);
      fetchDepartmentData(newId);
    }
  },
  { immediate: true },
);

// Reset validation when department name changes
watch(
  () => formData.value.departmentName,
  () => {
    isDepartmentNameValid.value = true;
    departmentNameError.value = "";
  }
);

const transformDepartmentPayload = (form, originalForm) => {
  const payload = {};

  if (form.departmentName !== originalForm.departmentName) {
    payload.departmentName = form.departmentName;
  }

  if (form.branch !== originalForm.branch) {
    payload.branch = form.branch ? { id: form.branch } : null;
  }

  return payload;
};

const handleSave = async () => {
  if (!form.value) return;

  // Check department name existence before validation
  await checkDepartmentExists();
  
  const { valid } = await form.value.validate();
  if (!valid || !isDepartmentNameValid.value) {
    console.error("Form validation failed");
    return;
  }

  try {
    const payload = transformDepartmentPayload(
      formData.value,
      originalForm.value,
    );
    const token = getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department/${departmentId}`,
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
      throw new Error("Failed to update department");
    }

    showSuccessAlert.value = true;
    setTimeout(() => {
      router.push("/settings/configuration/department");
    }, 1000);
  } catch (error) {
    errorMessage.value = error.message || "Failed to edit department";
    showErrorAlert.value = true;
    console.error("Error saving department:", error);
  }
};

const handleClose = () => {
  router.push({ path: "/settings/configuration/department" });
};

const menuItems = [
  {
    title: "Basic Details",
    icon: "mdi-card-text-outline",
    value: "basic",
  },
];
</script>

<style scoped>
.side-nav {
  width: 240px;
  border-right: 1px solid #e0e0e0;
  background-color: white;
}

.content-area {
  flex: 1;
}
.v-row {
  margin-top: 1rem;
}
.v-toolbar_content {
  background-color: white;
}
</style>
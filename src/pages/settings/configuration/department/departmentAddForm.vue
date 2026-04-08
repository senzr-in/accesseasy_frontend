<template>
  <div>
    <v-form ref="form">
      <v-toolbar density="compact" color="grey-lighten-4">
        <v-btn icon color="black" @click="handleClose">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title class="ml-4">Add Department</v-toolbar-title>
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
            <h2 class="text-h6 mb-4">Basic Details</h2>

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
                      required
                      @input="capitalizeFirstLetterEachWord('departmentName')"
                      @blur="checkDepartmentExists"
                      :error-messages="departmentError"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-autocomplete
                      v-model="formData.branch"
                      label="Branch "
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
        Department added successfully!
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
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useRouter } from "vue-router";

const router = useRouter();
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref("");
const form = ref(null);
const selectedTab = ref("basic");
const branches = ref([]);
const loadingBranches = ref(false);
const tenantId = currentUserTenant.getTenantId();
const departmentError = ref("");
const checkingDepartment = ref(false);
const departmentExists = ref(false);

const formData = ref({
  departmentName: "",
  branch: null,
});

const departmentNameRules = [
  (v) => !!v || 'Department Name is required',
  (v) => !departmentExists.value || 'Department name already exists'
];

const getToken = () => {
  return localStorage.getItem("userToken");
};

const checkDepartmentExists = async () => {
  if (!formData.value.departmentName) return;
  
  departmentError.value = "";
  checkingDepartment.value = true;
  departmentExists.value = false;
  
  try {
    const token = getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][departmentName][_eq]=${formData.value.departmentName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) throw new Error("Failed to check department");
    
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      departmentExists.value = true;
      departmentError.value = "Department name already exists";
    }
  } catch (error) {
    console.error("Error checking department:", error);
  } finally {
    checkingDepartment.value = false;
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

onMounted(() => {
  fetchBranches();
});

const availableBranches = computed(() => branches.value);

const generateSequentialDepartmentId = async () => {
  try {
    const token = getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${tenantId}&sort[]=-departmentId&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      return "1";
    }
    const lastNumber = Number(data.data[0].departmentId);
    return (lastNumber + 1).toString();
  } catch (error) {
    console.error("Error generating department ID:", error);
    return "1";
  }
};

const transformPayload = async (data) => {
  const departmentId = await generateSequentialDepartmentId();
  return {
    tenant: { tenantId },
    departmentId: departmentId,
    uniqueId: `${tenantId}-${departmentId}`,
    departmentName: data.departmentName,
    branch: data.branch ? { id: data.branch } : null,
    status: "assigned",
  };
};

const capitalizeFirstLetterEachWord = (fieldName) => {
  const value = formData.value[fieldName];
  if (value) {
    formData.value[fieldName] = value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
};

const handleSave = async () => {
  if (!form.value) return;

  // Check department exists before validation
  await checkDepartmentExists();
  
  if (departmentExists.value) {
    errorMessage.value = "Department name already exists";
    showErrorAlert.value = true;
    return;
  }

  const { valid } = await form.value.validate();
  if (!valid) {
    console.error("Form validation failed");
    return;
  }

  try {
    const payload = await transformPayload(formData.value);
    const token = getToken();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to save department");
    }

    showSuccessAlert.value = true;
    setTimeout(() => {
      router.push("/settings/configuration/department");
    }, 1000);
    handleClose;
  } catch (error) {
    errorMessage.value = error.message || "Failed to Add department";
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
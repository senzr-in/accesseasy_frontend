<!-- import Attendance Report.vue -->
<template>
  <div class="import-container">
    <!-- Modern Header -->
    <v-toolbar flat class="header-toolbar px-4" height="64">
      <div class="d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          class="mr-2"
          @click="$emit('closeAddPage')"
        ></v-btn>
        <v-icon color="primary" class="mr-2">mdi-database-import</v-icon>
        <span class="text-h6 font-weight-medium"
          >Import Attendance Logs Data</span
        >
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex align-center">
        <v-btn
          prepend-icon="mdi-close"
          variant="text"
          color="white"
          style="background-color: black !important"
          class="mr-2"
          @click="$emit('closeAddPage')"
        >
          Cancel
        </v-btn>
        <!-- <v-btn
          color="white"
          style="background-color: black !important"
          prepend-icon="mdi-check"
          @click="handleImport"
          elevation="0"
        >
          Import
        </v-btn> -->
      </div>
    </v-toolbar>

    <div class="d-flex layout-container">
      <!-- Modern Sidebar -->
      <!-- <div class="sidebar pa-4">
        <div class="sidebar-header mb-4">
          <v-icon color="primary" class="mr-2">mdi-folder-open</v-icon>
          <span class="text-subtitle-1 font-weight-medium">Import Steps</span>
        </div>
        <v-list nav class="sidebar-list">
          <v-list-item active color="primary" rounded="lg" class="mb-2">
            <template v-slot:prepend>
              <v-icon size="20">mdi-file-document-outline</v-icon>
            </template>
            <v-list-item-title>Basic Details</v-list-item-title>
          </v-list-item>
        </v-list>
      </div> -->

      <!-- Modern Content Area -->
      <div class="content-area pa-8">
        <v-form ref="form">
          <div class="form-header mb-6">
            <h2 class="text-h6 font-weight-medium">Import Details</h2>
          </div>

          <div class="form-grid">
            <!-- Collection Name Select -->
            <div class="form-group">
              <v-select
                v-model="formData.collectionName"
                label="Collection Name"
                :items="['Employees', 'Departments', 'Branches']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[(v) => !!v || 'Collection Name is required']"
                hide-details="auto"
              >
                <template v-slot:prepend>
                  <v-icon color="primary" size="20">mdi-database</v-icon>
                </template>
              </v-select>
            </div>

            <!-- Branch Select -->
            <div class="form-group">
              <v-autocomplete
                v-model="formData.branch"
                label="Branch"
                :items="availableBranches"
                item-title="branchName"
                item-value="id"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :loading="loadingBranches"
                :rules="[(v) => !!v || 'Branch is required']"
                hide-details="auto"
              >
                <template v-slot:prepend>
                  <v-icon color="primary" size="20">mdi-office-building</v-icon>
                </template>
              </v-autocomplete>
            </div>

            <!-- Modern File Upload Area -->
            <div class="file-upload-container">
              <v-file-input
                v-model="formData.file"
                :rules="[(v) => !!v || 'File is required']"
                accept=".csv,.xlsx"
                label="Upload File *"
                placeholder="Upload File"
                variant="outlined"
                density="comfortable"
                class="file-input"
                hide-details="auto"
              >
                <template v-slot:selection="{ fileNames }">
                  <span class="text-body-2">{{ fileNames.join(", ") }}</span>
                </template>
              </v-file-input>
            </div>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";

const emit = defineEmits(["closeAddPage"]);
const form = ref(null);
const selectedTab = ref("basic");
const branches = ref([]);
const loadingBranches = ref(false);
const tenantId = currentUserTenant.getTenantId();

const formData = ref({
  collectionName: "",
  branch: null,
  file: null,
});

const getToken = () => {
  return localStorage.getItem("userToken");
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

const handleImport = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    console.error("Form validation failed");
    return;
  }

  const token = getToken();
  const formDataToSend = new FormData();
  formDataToSend.append("file", formData.value.file);
  formDataToSend.append("collectionName", formData.value.collectionName);
  formDataToSend.append("branch", formData.value.branch);
  formDataToSend.append("tenant[tenantId]", tenantId);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/import`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      },
    );

    if (response.ok) {
      alert("Data imported successfully!");
      emit("closeAddPage");
    } else {
      throw new Error("Import failed");
    }
  } catch (error) {
    console.error("Error importing data:", error);
    alert("Failed to import data. Please try again.");
  }
};

onMounted(() => {
  fetchBranches();
});

const availableBranches = computed(() => branches.value);

const menuItems = [
  {
    title: "Basic Details",
    icon: "mdi-card-text-outline",
    value: "basic",
  },
];
</script>

<style scoped>
.import-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.header-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background-color: white;
}

.layout-container {
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background-color: white;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  height: 100%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.sidebar-list {
  background: transparent;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  background-color: white;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 900px;
}

.file-upload-container {
  grid-column: 1 / -1;
  margin-top: 16px;
}

/* Modern Form Styling */
:deep(.v-field) {
  border-radius: 8px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

:deep(.v-field__input) {
  min-height: 44px !important;
  padding: 0 12px !important;
}

:deep(.v-label) {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Modern File Upload Styling */
.upload-area {
  border: 2px dashed rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  background-color: rgb(250, 250, 250);
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: var(--v-primary-base);
  background-color: rgb(245, 245, 245);
}

.upload-area.has-error {
  border-color: rgb(var(--v-theme-error));
  background-color: rgb(var(--v-theme-error), 0.05);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.file-input) {
  .v-field__input {
    min-height: 44px !important;
    padding: 8px 12px !important;
  }

  .v-field__outline {
    border-color: rgba(0, 0, 0, 0.12) !important;
  }

  &.v-input--error .v-field__outline {
    border-color: rgb(var(--v-theme-error)) !important;
  }
}

:deep(.v-messages) {
  min-height: 18px;
  font-size: 12px;
  color: rgb(var(--v-theme-error));
}

/* Responsive Design */
@media (max-width: 960px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .sidebar {
    display: none;
  }

  .content-area {
    padding: 16px;
  }

  .upload-area {
    padding: 24px 16px;
  }
}
</style>

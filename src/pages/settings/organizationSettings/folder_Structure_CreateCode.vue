<template>
  <div class="organization-settings">
    <h3>Organization Settings</h3>
    <br />
    <v-container>
      <v-form ref="form" v-model="isFormValid">
        <v-row>
          <!-- Tenant Name (Read-only) -->
          <v-col cols="12" sm="6">
            <v-text-field
              label="Tenant Name"
              v-model="form.tenantName"
              readonly
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>

          <!-- Shop Account -->
          <v-col cols="12" sm="6">
            <v-text-field
              label="Shop Account"
              v-model="form.shopAccount"
              :readonly="!isEditMode"
              variant="outlined"
              density="compact"
              required
            ></v-text-field>
          </v-col>

          <!-- PF Account -->
          <v-col cols="12" sm="6">
            <v-text-field
              label="PF Account"
              v-model="form.pfAccount"
              :readonly="!isEditMode"
              variant="outlined"
              density="compact"
              required
            ></v-text-field>
          </v-col>

          <!-- Create Folder Structure Button -->
          <v-col cols="12" sm="6" class="d-flex align-center">
            <v-btn
              color="primary"
              @click="createFolderStructure"
              :loading="isCreatingFolders"
              :disabled="isCreatingFolders"
            >
              Create Folder Structure
            </v-btn>
          </v-col>
        </v-row>

        <!-- ESI Account Input & Select -->
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              label="ESI Account"
              v-model="newEsiAccount"
              variant="outlined"
              density="compact"
              required
              :readonly="!isEditMode"
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-select
              label="select State"
              v-model="newEsiType"
              :items="availableStates"
              variant="outlined"
              density="compact"
              required
              :readonly="!isEditMode"
            />
          </v-col>

          <v-col cols="12" sm="4">
            <v-btn
              :readonly="!isEditMode"
              @click="addEsiAccount"
              color="primary"
            >
              Add ESI Account
            </v-btn>
          </v-col>
        </v-row>

        <!-- Dynamically added ESI Accounts -->
        <v-row v-if="esiAccounts.length">
          <v-col
            v-for="(esi, index) in esiAccounts"
            :key="index"
            cols="12"
            sm="6"
            md="4"
            class="d-flex flex-wrap align-center gap-2"
          >
            <v-chip class="ma-2" label color="primary" text-color="white">
              {{ esi.account }}
            </v-chip>

            <v-chip class="ma-2" label color="secondary" text-color="white">
              {{ esi.type }}
            </v-chip>

            <v-btn
              icon
              color="black"
              size="small"
              :readonly="!isEditMode"
              @click="removeEsiAccount(index)"
              class="ml-2"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <!-- Buttons -->
        <v-row>
          <v-col cols="12">
            <!-- Edit Button -->
            <v-btn v-if="!isEditMode" color="black" @click="toggleEditMode">
              Edit
            </v-btn>

            <!-- Save and Cancel Buttons -->
            <v-btn
              v-if="isEditMode"
              color="black"
              @click="saveChanges"
              :disabled="!isFormValid"
              style="margin-right: 10px"
            >
              Save
            </v-btn>
            <v-btn v-if="isEditMode" color="error" @click="cancelEdit">
              Cancel
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-container>

    <!-- Folder Structure Creation Dialog -->
    <v-dialog v-model="folderDialog" max-width="500px">
      <v-card>
        <v-card-title>Create Folder Structure</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedTenantId"
            :items="tenantOptions"
            item-title="name"
            item-value="id"
            label="Select Tenant"
            variant="outlined"
            density="compact"
          ></v-select>

          <v-alert
            v-if="folderCreationStatus"
            :type="folderCreationError ? 'error' : 'success'"
            class="mt-3"
          >
            {{ folderCreationStatus }}
          </v-alert>

          <v-progress-linear
            v-if="isCreatingFolders && !folderCreationStatus"
            indeterminate
            color="primary"
          ></v-progress-linear>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="confirmCreateFolderStructure"
            :disabled="isCreatingFolders || !selectedTenantId"
            :loading="isCreatingFolders"
          >
            Create
          </v-btn>
          <v-btn
            color="error"
            @click="folderDialog = false"
            :disabled="isCreatingFolders"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

<script>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export default {
  data() {
    return {
      isFormValid: false,
      isEditMode: false,
      form: {
        tenantName: "",
        shopAccount: "",
        esiAccount: "",
        pfAccount: "",
      },
      newEsiAccount: "",
      newEsiType: "",
      esiStates: ["Tamil Nadu", "Karnataka", "Delhi", "Maharashtra"],
      esiAccounts: [],
      originalForm: {},
      showSuccessSnackbar: false,
      showErrorSnackbar: false,
      successMessage: "",
      errorMessage: "",

      // Folder structure creation
      folderDialog: false,
      isCreatingFolders: false,
      selectedTenantId: null,
      folderCreationStatus: "",
      folderCreationError: false,
      tenantOptions: [
        { id: "77480775-ce99-40df-98c7-af5f8f3daeb4", name: "EsslSecurity" },
        { id: "c06d5756-422f-42c7-a581-5b225c39b145", name: "Senzr" },
      ],
      createdFolders: [],
    };
  },
  computed: {
    availableStates() {
      const selected = this.esiAccounts.map((e) => e.type);
      return this.esiStates.filter((state) => !selected.includes(state));
    },
  },
  methods: {
    addEsiAccount() {
      if (this.newEsiAccount && this.newEsiType) {
        // Push the new ESI account and type into the esiAccounts array
        this.esiAccounts.push({
          account: this.newEsiAccount,
          type: this.newEsiType,
        });
        // Reset the input fields after adding
        this.newEsiAccount = "";
        this.newEsiType = "";
      } else {
        // Handle case where user hasn't entered valid data
        alert("Please fill in both ESI Account and ESI Type.");
      }
    },
    removeEsiAccount(index) {
      this.esiAccounts.splice(index, 1);
    },
    async fetchData() {
      try {
        const token = authService.getToken();
        const tenantId = await currentUserTenant.getTenantId();

        const url = `${
          import.meta.env.VITE_API_URL
        }/items/tenant?fields[]=tenantName&fields[]=shopAccount&fields[]=esiAccount&fields[]=pfAccount&fields[]=esiAccountNumber&filter[tenantId][_eq]=${tenantId}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        const tenantData = data.data[0];

        // Set form and store original data
        this.form = { ...tenantData };
        this.originalForm = { ...tenantData };
        if (tenantData.esiAccountNumber && tenantData.esiAccountNumber.length) {
          this.esiAccounts = tenantData.esiAccountNumber.map((account) => ({
            account: account.esiAccount,
            type: account.state,
          }));
        }

        // Fetch tenant names for the folder structure creation
        await this.fetchTenantNames();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    // Fetch tenant names for the dropdown
    async fetchTenantNames() {
      try {
        const token = authService.getToken();
        const tenantIds = this.tenantOptions.map((t) => t.id);

        for (const tenant of this.tenantOptions) {
          const url = `${import.meta.env.VITE_API_URL}/items/tenant?fields[]=tenantName&filter[tenantId][_eq]=${tenant.id}`;

          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              tenant.name = data.data[0].tenantName;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching tenant names:", error);
      }
    },

    // Toggle edit mode
    toggleEditMode() {
      this.isEditMode = true;
    },

    // Save changes
    async saveChanges() {
      try {
        const token = authService.getToken();
        const tenantId = await currentUserTenant.getTenantId();

        const payload = {
          shopAccount: this.form.shopAccount,
          esiAccountNumber: this.esiAccounts.map((esi) => ({
            esiAccount: esi.account,
            state: esi.type,
          })),
          pfAccount: this.form.pfAccount,
        };

        const url = `${import.meta.env.VITE_API_URL}/items/tenant/${tenantId}`;

        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to save data");

        this.successMessage = "Data updated successfully!";
        this.showSuccessSnackbar = true;
        this.isEditMode = false; // Exit edit mode
        this.originalForm = { ...this.form }; // Update original form
      } catch (error) {
        console.error("Error updating data:", error);
        this.errorMessage = "Failed to save data. Please try again.";
        this.showErrorSnackbar = true;
      }
    },

    // Cancel edit
    cancelEdit() {
      this.form = { ...this.originalForm };
      this.isEditMode = false;
      this.fetchData();
    },

    // Open folder structure creation dialog
    createFolderStructure() {
      this.folderDialog = true;
      this.folderCreationStatus = "";
      this.folderCreationError = false;
      this.selectedTenantId = null;
    },

    // Create folder structure for selected tenant
    async confirmCreateFolderStructure() {
      if (!this.selectedTenantId) {
        this.folderCreationStatus = "Please select a tenant";
        this.folderCreationError = true;
        return;
      }

      this.isCreatingFolders = true;
      this.folderCreationStatus = "";
      this.folderCreationError = false;
      this.createdFolders = [];

      try {
        const token = authService.getToken();

        // First, check if the tenant already has folders
        const tenantResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tenant/${this.selectedTenantId}?fields[]=foldersId`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!tenantResponse.ok) {
          throw new Error("Failed to fetch tenant data");
        }

        const tenantData = await tenantResponse.json();

        // If tenant already has folders, confirm before proceeding
        if (
          tenantData.data &&
          tenantData.data.foldersId &&
          tenantData.data.foldersId.length > 0
        ) {
          if (
            !confirm(
              "This tenant already has folders. Creating new folders may cause duplicates. Do you want to continue?",
            )
          ) {
            this.isCreatingFolders = false;
            this.folderCreationStatus = "Folder creation cancelled";
            return;
          }
        }

        // Create main folder with tenant ID as name
        const mainFolderResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/folders`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: this.selectedTenantId }),
          },
        );

        if (!mainFolderResponse.ok) {
          throw new Error("Failed to create main folder");
        }

        const mainFolderData = await mainFolderResponse.json();
        const mainFolderId = mainFolderData.data.id;
        this.createdFolders.push(mainFolderId);

        // Create child folders
        const childFolders = [
          "Profiles",
          "Faces",
          "Fingers",
          "Imported Files",
          "Documents",
          "DeviceImages",
          "TDS Documents",
        ];

        const folderIds = {};
        const allFolders = [];

        allFolders.push({
          id: mainFolderId,
          name: this.selectedTenantId,
          parent: null,
        });

        // Create each child folder
        for (const folderName of childFolders) {
          const folderResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/folders`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: folderName,
                parent: mainFolderId,
              }),
            },
          );

          if (!folderResponse.ok) {
            throw new Error(`Failed to create ${folderName} folder`);
          }

          const folderData = await folderResponse.json();
          const folderId = folderData.data.id;
          this.createdFolders.push(folderId);
          folderIds[folderName] = folderId;

          allFolders.push({
            id: folderId,
            name: folderName,
            parent: mainFolderId,
          });
        }

        // Create sub-folders for "Imported Files"
        const importedFilesSubFolders = ["EmployeeDatas", "AttendanceRecords"];
        for (const subFolder of importedFilesSubFolders) {
          const folderResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/folders`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: subFolder,
                parent: folderIds["Imported Files"],
              }),
            },
          );

          if (!folderResponse.ok) {
            throw new Error(`Failed to create ${subFolder} sub-folder`);
          }

          const folderData = await folderResponse.json();
          const folderId = folderData.data.id;
          this.createdFolders.push(folderId);

          allFolders.push({
            id: folderId,
            name: subFolder,
            parent: folderIds["Imported Files"],
          });
        }

        // Create sub-folders for "Documents"
        const documentsSubFolders = ["OnboardDocuments", "OffBoardDocuments"];
        for (const subFolder of documentsSubFolders) {
          const folderResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/folders`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: subFolder,
                parent: folderIds["Documents"],
              }),
            },
          );

          if (!folderResponse.ok) {
            throw new Error(`Failed to create ${subFolder} sub-folder`);
          }

          const folderData = await folderResponse.json();
          const folderId = folderData.data.id;
          this.createdFolders.push(folderId);

          allFolders.push({
            id: folderId,
            name: subFolder,
            parent: folderIds["Documents"],
          });
        }

        // Update tenant with folder structure
        const updateResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tenant/${this.selectedTenantId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              foldersId: allFolders,
            }),
          },
        );

        if (!updateResponse.ok) {
          throw new Error("Failed to update tenant with folder structure");
        }

        this.folderCreationStatus = "Folder structure created successfully!";
        this.folderCreationError = false;

        // Show success message
        this.successMessage = "Folder structure created successfully!";
        this.showSuccessSnackbar = true;
      } catch (error) {
        console.error("Error creating folder structure:", error);
        this.folderCreationStatus = `Error: ${error.message}. Cleaning up...`;
        this.folderCreationError = true;

        // Clean up created folders on error
        await this.cleanupCreatedFolders();

        this.errorMessage = `Failed to create folder structure: ${error.message}`;
        this.showErrorSnackbar = true;
      } finally {
        this.isCreatingFolders = false;
      }
    },

    // Clean up created folders if there's an error
    async cleanupCreatedFolders() {
      if (!this.createdFolders.length) return;

      const token = authService.getToken();

      // Delete folders in reverse order (children first)
      const reversedFolders = [...this.createdFolders].reverse();

      for (const folderId of reversedFolders) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/folders/${folderId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error(`Error deleting folder ${folderId}:`, error);
        }
      }

      this.folderCreationStatus += " Cleanup completed.";
      this.createdFolders = [];
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
.organization-settings {
  padding: 20px;
  max-width: 800px;
  margin: 0;
  justify-content: left;
  align-items: left;
}
</style>

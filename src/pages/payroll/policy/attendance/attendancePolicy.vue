<!-- attendancePolicy.vue -->
<template>
  <div class="settings-container">
    <div class="template-section">
      <div class="section-header">
        <div class="header-with-back">
          <v-btn
            v-if="showTabs"
            icon="mdi-arrow-left"
            variant="text"
            size="small"
            @click="goBackToTemplates"
            class="back-btn"
          ></v-btn>
          <h3 class="text-h6">
            {{ showTabs ? selectedTemplate.name : "Attendance Policy" }}
          </h3>
        </div>
        <!-- Modified Category Overview in Header -->
        <div v-if="!showTabs" class="header-overview">
          <div class="stat-item">
            <v-icon size="16" color="#3b82f6">mdi-folder-multiple</v-icon>
            <span class="stat-count">{{ customTemplates.length }}</span>
            <span class="stat-label">Categories</span>
          </div>
          <div class="stat-item">
            <v-icon size="16" color="#10b981">mdi-account-group</v-icon>
            <span class="stat-count">{{ totalEmployees }}</span>
            <span class="stat-label">Employees</span>
          </div>
          <div class="stat-item">
            <v-icon size="16" color="#8b5cf6">mdi-cog</v-icon>
            <span class="stat-count">{{ customCategoriesCount }}</span>
            <span class="stat-label">Custom</span>
          </div>
        </div>
      </div>

      <div v-if="!showTabs" class="scrollable">
        <div v-if="isLoading" class="loading-state">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          <span class="ml-2 text-grey-darken-1">Loading categories...</span>
        </div>

        <div v-else-if="customTemplates.length === 0" class="no-data-found">
          <v-icon size="48" color="grey-lighten-1"
            >mdi-folder-open-outline</v-icon
          >
          <p class="text-h6 text-muted-foreground mt-4">
            No attendance policies found.
          </p>
          <p class="text-body-1 text-muted-foreground">
            Click "Create New" to add your first category.
          </p>
        </div>

        <div v-else>
          <!-- Category Cards Grid -->
          <div class="category-grid">
            <!-- Create New Card -->
            <div class="category-card create-card" @click="openCreateDialog">
              <div class="create-content">
                <div class="create-icon">
                  <v-icon size="24" color="#6366f1">mdi-plus</v-icon>
                </div>
                <h4 class="create-title">Create New</h4>
                <p class="create-subtitle">Add a new attendance category</p>
              </div>
            </div>

            <!-- Template Cards -->
            <div
              v-for="template in customTemplates"
              :key="template.id"
              class="category-card template-card"
              @click="showTemplateConfig(template.id)"
            >
              <div class="card-header">
                <div
                  class="category-badge"
                  :class="getCategoryBadgeClass(template.name)"
                >
                  {{ getCategoryType(template.name) }}
                </div>
                <div class="card-icon" :class="getIconClass(template.name)">
                  <v-icon size="20" :color="getIconColor(template.name)">
                    {{ getTemplateIcon(template.name) }}
                  </v-icon>
                </div>
              </div>

              <div class="card-content">
                <h4 class="category-title">{{ template.name }}</h4>
                <div class="employee-count">
                  <v-icon size="16" color="#6b7280">mdi-account</v-icon>
                  <span class="count-number">{{
                    template.assignedUserCount
                  }}</span>
                  <span class="count-label">{{
                    template.assignedUserCount === 1 ? "Employee" : "Employees"
                  }}</span>
                </div>
              </div>

              <!-- Action buttons (hidden by default, shown on hover) -->
              <div class="card-actions">
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="primary"
                  @click.stop="editTemplateName(template)"
                ></v-btn>
                <v-btn
                  icon="mdi-content-copy"
                  variant="text"
                  size="small"
                  color="primary"
                  @click.stop="duplicateTemplate(template)"
                ></v-btn>
              </div>
            </div>
          </div>

          <!-- Category Overview Section -->
          <!-- <div class="overview-section">
            <h3 class="overview-title">Category Overview</h3>
            <div class="overview-stats">
              <div class="stat-card">
                <div class="stat-icon blue">
                  <v-icon size="20" color="#3b82f6">mdi-folder-multiple</v-icon>
                </div>
                <div class="stat-number">{{ customTemplates.length }}</div>
                <div class="stat-label">Total Categories</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon green">
                  <v-icon size="20" color="#10b981">mdi-account-group</v-icon>
                </div>
                <div class="stat-number">{{ totalEmployees }}</div>
                <div class="stat-label">Total Employees</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon purple">
                  <v-icon size="20" color="#8b5cf6">mdi-cog</v-icon>
                </div>
                <div class="stat-number">{{ customCategoriesCount }}</div>
                <div class="stat-label">Custom Categories</div>
              </div>
            </div>
          </div> -->
        </div>
      </div>

      <div v-else class="template-config">
        <div class="custom-tabs"></div>
        <AttendancePolicyTabs
          v-if="selectedTemplate"
          :selectedConfig="selectedTemplate"
          :policyPatchId="selectedTemplate.attendancePolicies"
          @save-changes="handleSaveChanges"
          :showSnackbar="showSnackbar"
          ref="policyTabs"
        />
        <v-card-text v-else>
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          Loading attendance settings...
        </v-card-text>
      </div>
    </div>

    <!-- Dialogs remain the same -->
    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-card-title>Create New Category</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTemplate.name"
            label="Category Name"
            variant="outlined"
            required
            :rules="[(v) => !!v || 'Category name is required']"
          ></v-text-field>
          <v-alert v-if="customTemplates.length >= 10" type="warning" dense>
            Maximum number of categories (10) reached. You cannot create more
            categories.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="createDialog = false">Cancel</v-btn>
          <v-btn
            @click="saveTemplate"
            :loading="isSaving"
            :disabled="isSaving"
            color="primary"
            class="save-button"
          >
            <template v-slot:loader>
              <v-progress-circular
                indeterminate
                size="20"
                width="2"
              ></v-progress-circular>
            </template>
            {{ isSaving ? "Saving..." : "Save Changes" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editNameDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit Template Name</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editingTemplate.name"
            label="Category Name"
            variant="outlined"
            required
            :rules="[(v) => !!v || 'Category name is required']"
            :disabled="editingTemplate && editingTemplate.isDefault"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="editNameDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="black"
            @click="saveTemplateName"
            :disabled="
              !editingTemplate ||
              !editingTemplate.name.trim() ||
              (editingTemplate && editingTemplate.isDefault)
            "
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteConfirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm Deletion</v-card-title>
        <v-card-text class="text-center">
          Are you sure you want to delete the category "{{
            templateToDeleteName
          }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="deleteConfirmDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="error" text @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top center"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import AttendancePolicyTabs from "./attendancePolicyTabs.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export default {
  name: "Settings",
  components: {
    AttendancePolicyTabs,
  },
  data() {
    return {
      isSaving: false,
      createDialog: false,
      editNameDialog: false,
      deleteConfirmDialog: false,
      templateToDeleteId: null,
      templateToDeleteName: "",
      showTabs: false,
      activeTab: "attendance",
      newTemplate: {
        name: "",
      },
      editingTemplate: null,
      customTemplates: [],
      selectedTemplate: null,
      selectedID: null,
      isLoading: false,
      isLoadingDetails: false,
      tenantId: null,
      DEFAULT_TEMPLATE_NAMES: [
        "Regular Policy",
        "Housekeeping Policy",
        "Security Policy",
        "Flexible Policy",
      ],
      snackbar: {
        show: false,
        message: "",
        color: "",
      },
    };
  },
  computed: {
    getTemplateIcon() {
      return (templateName) => {
        const name = templateName.toLowerCase();
        if (name.includes("regular")) return "mdi-account-group";
        if (name.includes("housekeeping")) return "mdi-broom";
        if (name.includes("security")) return "mdi-shield-check";
        if (name.includes("flexible")) return "mdi-timetable";
        return "mdi-folder";
      };
    },
    totalEmployees() {
      return this.customTemplates.reduce(
        (total, template) => total + template.assignedUserCount,
        0,
      );
    },
    customCategoriesCount() {
      return this.customTemplates.filter((template) => !template.isDefault)
        .length;
    },
  },
  async mounted() {
    await this.initializeData();
  },
  methods: {
    getCategoryType(templateName) {
      const name = templateName.toLowerCase();
      if (name.includes("regular")) return "Regular";
      if (name.includes("security")) return "Security";
      if (name.includes("housekeeping")) return "Housekeeping";
      if (name.includes("flexible")) return "Flexible";
      return "Custom";
    },
    getCategoryBadgeClass(templateName) {
      const type = this.getCategoryType(templateName);
      return {
        "badge-regular": type === "Regular",
        "badge-security": type === "Security",
        "badge-housekeeping": type === "Housekeeping",
        "badge-flexible": type === "Flexible",
        "badge-custom": type === "Custom",
      };
    },
    getIconClass(templateName) {
      const type = this.getCategoryType(templateName);
      return {
        "icon-regular": type === "Regular",
        "icon-security": type === "Security",
        "icon-housekeeping": type === "Housekeeping",
        "icon-flexible": type === "Flexible",
        "icon-custom": type === "Custom",
      };
    },
    getIconColor(templateName) {
      const type = this.getCategoryType(templateName);
      switch (type) {
        case "Regular":
          return "#10b981";
        case "Security":
          return "#3b82f6";
        case "Housekeeping":
          return "#f59e0b";
        case "Flexible":
          return "#8b5cf6";
        default:
          return "#6b7280";
      }
    },
    showSnackbar(message, color = "info") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    async initializeData() {
      try {
        await currentUserTenant.fetchLoginUserDetails();
        this.tenantId = currentUserTenant.getTenantId();
        await this.loadTemplates();
      } catch (error) {
        console.error("Error initializing data:", error);
        this.showSnackbar(
          "Error initializing data. Please try again.",
          "error",
        );
      }
    },
    async showTemplateConfig(templateId) {
      this.isLoadingDetails = true;
      try {
        const template = this.customTemplates.find((t) => t.id === templateId);
        if (template) {
          this.selectedTemplate = template;
          this.selectedID = templateId;
          this.showTabs = true;
        } else {
          throw new Error("Template not found.");
        }
      } catch (error) {
        console.error("Error loading template details:", error);
        this.showSnackbar(
          "Error loading template details. Please try again.",
          "error",
        );
      } finally {
        this.isLoadingDetails = false;
      }
    },
    async loadTemplates() {
      this.isLoading = true;
      try {
        if (!this.tenantId) {
          throw new Error("Tenant ID not available");
        }
        const queryParameters = {
          filter: JSON.stringify({
            tenant: { _eq: this.tenantId },
          }),
          fields: [
            "id",
            "configName",
            "attendanceSettings",
            "attendancePolicies",
            "tenant",
            "status",
            "configName",
            "id",
            "leaveSettings",
            "tenant.tenantId",
            "tenant.tenantName",
          ].join(","),
        };
        const queryString = new URLSearchParams(queryParameters).toString();
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/config?${queryString}`,
          {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to load templates");
        }
        const data = await response.json();
        const templates = data.data;
        const templatesWithUserCount = await Promise.all(
          templates.map(async (template) => {
            let assignedUserCount = 0;
            try {
              const userCountResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][config][id][_eq]=${template.id}&fields[]=id`,
                {
                  headers: {
                    Authorization: `Bearer ${authService.getToken()}`,
                    "Content-Type": "application/json",
                  },
                },
              );
              if (userCountResponse.ok) {
                const userCountData = await userCountResponse.json();
                assignedUserCount = userCountData.data.length;
              }
            } catch (error) {
              console.error(
                `Error fetching user count for template ${template.id}:`,
                error,
              );
            }
            return {
              id: template.id,
              name: template.configName,
              attendance: null,
              salary: template.salarySettings || {},
              leaveSettings: template.leaveSettings || [],
              attendancePolicies: template.attendancePolicies || {},
              tenant: template.tenant,
              attendanceSettings: template.attendanceSettings,
              isDefault: this.DEFAULT_TEMPLATE_NAMES.includes(
                template.configName,
              ),
              assignedUserCount,
            };
          }),
        );
        this.customTemplates = templatesWithUserCount;
      } catch (error) {
        console.error("Error loading templates:", error);
        this.showSnackbar(
          "Error loading templates. Please try again.",
          "error",
        );
      } finally {
        this.isLoading = false;
      }
    },
    async saveTemplate() {
      this.isSaving = true;

      if (!this.newTemplate.name.trim()) {
        this.showSnackbar("Category name is required.", "warning");
        this.isSaving = false;
        return;
      }
      try {
        const existingTemplate = this.customTemplates.find(
          (template) =>
            template.name.toLowerCase() === this.newTemplate.name.toLowerCase(),
        );
        if (existingTemplate) {
          this.showSnackbar(
            "A template with this name already exists.",
            "warning",
          );
          return;
        }
        if (this.customTemplates.length >= 10) {
          this.showSnackbar(
            "Maximum number of categories (10) reached. You cannot create more categories.",
            "warning",
          );
          return;
        }
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/config`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify({
              configName: this.newTemplate.name.trim(),
              tenant: this.tenantId,
              attendanceSettings: {
                status: "draft",
              },
              attendancePolicies: {
                locationCentric: false,
                calculate_WithInBreak: false,
              },
              salarySettings: {
                status: "draft",
              },
              leaveSettings: [],
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create template");
        }

        await this.loadTemplates();
        this.createDialog = false;
        this.newTemplate.name = "";
        this.showSnackbar("Category added successfully!", "success");
      } catch (error) {
        console.error("Error creating template:", error);
        this.showSnackbar(
          error.message || "Error creating category. Please try again.",
          "error",
        );
      } finally {
        this.isSaving = false;
      }
    },
    async handleAttendanceUpdate(updatedData) {
      try {
        if (this.selectedTemplate) {
          this.selectedTemplate.attendance = updatedData;
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/items/config/${this.selectedTemplate.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authService.getToken()}`,
              },
              body: JSON.stringify({
                attendanceSettings: updatedData,
              }),
            },
          );
          if (!response.ok) {
            throw new Error("Failed to update attendance settings");
          }
          await this.loadTemplates();
          this.showSnackbar(
            "Attendance settings updated successfully!",
            "success",
          );
        }
      } catch (error) {
        console.error("Error updating attendance settings:", error);
        this.showSnackbar(
          "Error updating attendance settings. Please try again.",
          "error",
        );
      }
    },
    async handleSalaryUpdate(updatedData) {
      try {
        if (this.selectedTemplate) {
          this.selectedTemplate.salary = updatedData;
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/items/config/${this.selectedTemplate.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authService.getToken()}`,
              },
              body: JSON.stringify({
                salarySettings: updatedData,
              }),
            },
          );
          if (!response.ok) {
            throw new Error("Failed to update salary settings");
          }
          await this.loadTemplates();
          this.showSnackbar("Salary settings updated successfully!", "success");
        }
      } catch (error) {
        console.error("Error updating salary settings:", error);
        this.showSnackbar(
          "Error updating salary settings. Please try again.",
          "error",
        );
      }
    },
    deleteTemplate(templateId) {
      const templateToDelete = this.customTemplates.find(
        (t) => t.id === templateId,
      );
      if (!templateToDelete) {
        console.error("Template not found for deletion.");
        return;
      }
      if (templateToDelete.isDefault) {
        this.showSnackbar("Default policies cannot be deleted.", "warning");
        return;
      }
      this.templateToDeleteId = templateId;
      this.templateToDeleteName = templateToDelete.name;
      this.deleteConfirmDialog = true;
    },
    async confirmDelete() {
      this.deleteConfirmDialog = false;
      const templateId = this.templateToDeleteId;
      if (!templateId) return;
      try {
        const configResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/config/${templateId}?fields[]=attendancePolicies`,
          {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!configResponse.ok) {
          const errorData = await configResponse.json();
          throw new Error(errorData.message || "Failed to fetch config data");
        }
        const configData = await configResponse.json();
        const attendancePoliciesID = configData.data.attendancePolicies;
        if (!attendancePoliciesID) {
          const deleteResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/config/${templateId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${authService.getToken()}`,
              },
            },
          );
          if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(errorData.message || "Failed to delete template");
          }
          await this.loadTemplates();
          this.showSnackbar("Template deleted successfully!", "success");
          return;
        }
        const policyResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendancePolicies/${attendancePoliciesID}`,
          {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!policyResponse.ok) {
          const errorData = await policyResponse.json();
          throw new Error(
            errorData.message || "Failed to fetch attendance policy data",
          );
        }
        const deletedPayload = await policyResponse.json();
        const personalModuleResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][config][id][_eq]=${attendancePoliciesID}&fields[]=attendancePolicyHistory`,
          {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!personalModuleResponse.ok) {
          const errorData = await personalModuleResponse.json();
          throw new Error(
            errorData.message || "Failed to fetch personal module data",
          );
        }
        const personalModuleData = await personalModuleResponse.json();
        const historyIds = personalModuleData.data
          .map((item) => item.attendancePolicyHistory)
          .filter(Boolean);
        if (historyIds.length > 0) {
          const patchResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/attendancePolicies`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authService.getToken()}`,
              },
              body: JSON.stringify({
                keys: historyIds,
                data: deletedPayload.data,
              }),
            },
          );
          if (!patchResponse.ok) {
            const errorData = await patchResponse.json();
            throw new Error(
              errorData.message ||
                "Failed to update attendance policies history",
            );
          }
        }
        const deleteResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/config/${templateId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
            },
          },
        );
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(errorData.message || "Failed to delete template");
        }
        await this.loadTemplates();
        this.showSnackbar("Template deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting template:", error);
        this.showSnackbar(
          error.message || "Error deleting template. Please try again.",
          "error",
        );
      } finally {
        this.templateToDeleteId = null;
        this.templateToDeleteName = "";
      }
    },
    async duplicateTemplate(template) {
      try {
        let baseName = template.name;
        const copyMatch = baseName.match(/^(.*) Copy(?: (\d+))?$/);
        if (copyMatch) {
          baseName = copyMatch[1];
        }
        let newName = `${baseName} Copy`;
        let copyCount = 0;
        this.customTemplates.forEach((t) => {
          const existingCopyMatch = t.name.match(
            new RegExp(`^${baseName} Copy(?: (\\d+))?$`),
          );
          if (existingCopyMatch) {
            const num = existingCopyMatch[1]
              ? parseInt(existingCopyMatch[1])
              : 0;
            if (num >= copyCount) {
              copyCount = num + 1;
            }
          }
        });
        if (copyCount > 0) {
          newName = `${baseName} Copy ${copyCount}`;
        } else if (
          this.customTemplates.some((t) => t.name === `${baseName} Copy`)
        ) {
          newName = `${baseName} Copy 1`;
        }
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/config`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify({
              configName: newName,
              tenant: this.tenantId,
              attendanceSettings: template.attendanceSettings,
              attendancePolicies: template.attendancePolicies,
              salarySettings: template.salary,
              leaveSettings: template.leaveSettings,
            }),
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to duplicate template");
        }
        await this.loadTemplates();
        this.showSnackbar("Template duplicated successfully!", "success");
      } catch (error) {
        console.error("Error duplicating template:", error);
        this.showSnackbar(
          error.message || "Error duplicating template. Please try again.",
          "error",
        );
      }
    },
    async saveTemplateName() {
      if (!this.editingTemplate || !this.editingTemplate.name.trim()) {
        this.showSnackbar("Category name is required.", "warning");
        return;
      }
      if (this.editingTemplate.isDefault) {
        this.showSnackbar(
          "Cannot change the name of a default policy.",
          "warning",
        );
        return;
      }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/config/${this.editingTemplate.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify({
              configName: this.editingTemplate.name,
            }),
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to update template name",
          );
        }
        await this.loadTemplates();
        this.editNameDialog = false;
        this.showSnackbar("Template name updated successfully!", "success");
      } catch (error) {
        console.error("Error updating template name:", error);
        this.showSnackbar(
          error.message || "Error updating template name. Please try again.",
          "error",
        );
      }
    },
    async saveTemplateChanges() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/config/${this.selectedTemplate.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify({
              attendanceSettings: this.selectedTemplate.attendanceSettings,
              salarySettings: this.selectedTemplate.salary,
              attendancePolicies: this.selectedTemplate.attendancePolicies,
            }),
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to save template changes",
          );
        }
        await this.loadTemplates();
        this.goBackToTemplates();
        this.showSnackbar("Template changes saved successfully!", "success");
      } catch (error) {
        console.error("Error saving template changes:", error);
        this.showSnackbar(
          "Error saving template changes. Please try again.",
          "error",
        );
      }
    },
    openCreateDialog() {
      if (this.customTemplates.length >= 10) {
        this.showSnackbar(
          "Maximum number of categories (10) reached. You cannot create more categories.",
          "warning",
        );
        return;
      }
      this.newTemplate.name = `Attendance Category ${this.customTemplates.length + 1}`;
      this.createDialog = true;
    },
    editTemplate(templateId) {
      this.selectedTemplate = this.customTemplates.find(
        (t) => t.id === templateId,
      );
      this.showTabs = true;
    },
    editTemplateName(template) {
      this.editingTemplate = { ...template };
      this.editNameDialog = true;
    },
    goBackToTemplates() {
      this.showTabs = false;
      this.selectedTemplate = null;
      this.loadTemplates();
    },
    // New method to handle save changes from child component
    async handleSaveChanges(settingsData) {
      try {
        // Make API call to save settings
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/config/${this.selectedTemplate.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(settingsData),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save settings");
        }

        this.showSnackbar("Settings saved successfully!", "success");
        await this.loadTemplates();
      } catch (error) {
        console.error("Error saving settings:", error);
        this.showSnackbar(
          error.message || "Error saving settings. Please try again.",
          "error",
        );
        throw error; // Re-throw to allow child component to handle it
      }
    },
  },
};
</script>

<style scoped>
.settings-container {
  width: 100%;
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.scrollable {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 50px);
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 50px;
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.header-with-back {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-h6 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Category Grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

/* Create Card */
.create-card {
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-card:hover {
  border-color: #6366f1;
  background: #f8faff;
}

.create-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.create-icon {
  width: 48px;
  height: 48px;
  background: #eef2ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.create-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.create-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Template Cards */
.category-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  height: 160px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.template-card {
  padding: 20px;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.template-card:hover .card-actions {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.category-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-regular {
  background: #dcfce7;
  color: #166534;
}

.badge-security {
  background: #dbeafe;
  color: #1e40af;
}

.badge-housekeeping {
  background: #fef3c7;
  color: #92400e;
}

.badge-flexible {
  background: #ede9fe;
  color: #7c3aed;
}

.badge-custom {
  background: #f1f5f9;
  color: #475569;
}
.header-overview {
  display: flex;
  gap: 15px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #1e293b;
}

.stat-count {
  font-weight: 600;
  color: #1e293b;
}

.stat-label {
  color: #64748b;
  font-size: 12px;
}
.save-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}
.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-regular {
  background: #dcfce7;
}

.icon-security {
  background: #dbeafe;
}

.icon-housekeeping {
  background: #fef3c7;
}

.icon-flexible {
  background: #ede9fe;
}

.icon-custom {
  background: #f1f5f9;
}

.card-content {
  flex: 1;
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.employee-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
}

.count-number {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.count-label {
  font-size: 14px;
  color: #64748b;
}

.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

/* Overview Section */
/* .overview-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.overview-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
} */

/* .stat-card {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
} */

.stat-icon.blue {
  background: #dbeafe;
}

.stat-icon.green {
  background: #dcfce7;
}

.stat-icon.purple {
  background: #ede9fe;
}

/* .stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
} */

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* Loading and Empty States */
.loading-state,
.no-data-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: #64748b;
}

.loading-state {
  gap: 16px;
}

.no-data-found {
  gap: 12px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .scrollable {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    padding: 16px;
  }
}
</style>

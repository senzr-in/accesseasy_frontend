<!-- /senzrGo/senzrfieldopsfrontend/src/pages/taskManagement/taskcomponents/workflow.vue -->
<template>
  <div class="app-container">
    <!-- Header -->
    <FormHeader
      :current-tenant="currentTenant"
      :user-role="userRole"
      :selected-form="selectedForm"
      :saving="saving"
      @save-configuration="saveConfiguration"
      @show-help="showHelpModal = true"
    />

    <!-- Toast Notification -->
    <ToastNotification
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />

    <div class="main-contents">
      <div class="content-grid">
        <!-- Sidebar -->
        <FormSidebar
          :form-templates="formTemplates"
          :selected-form="selectedForm"
          :loading="loading"
          @select-form="selectForm"
          @create-new-form="createNewForm"
          @toggle-form-enabled="toggleFormEnabled"
          @confirm-delete-form="confirmDeleteForm"
        />

        <!-- Main Panel -->
        <main class="main-panel">
          <!-- Empty State -->
          <EmptyState
            v-if="!selectedForm"
            @create-new-form="createNewForm"
            @show-help="showHelpModal = true"
          />

          <!-- Configuration Container -->
          <div v-else class="config-container">
            <!-- Form Header Info -->
            <div class="form-header">
              <div class="form-header-main">
                <div class="form-header-content">
                  <div class="form-title-section">
                    <h2 class="form-title">
                      <Sparkles class="form-title-icon" />
                      {{ selectedForm.formName }}
                    </h2>
                    <p class="form-description">
                      Configure your work order form fields, validation rules,
                      and workflow settings
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div class="tabs-container">
              <nav class="tabs-nav">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  class="tab-button"
                  :class="{ 'tab-button-active': activeTab === tab.id }"
                >
                  <component :is="getTabIcon(tab.id)" class="tab-icon" />
                  {{ tab.name }}
                </button>
              </nav>

              <div class="tab-content-wrapper">
                <div class="tab-content">
                  <!-- Fields Configuration Tab -->
                  <FieldConfiguration
                    v-if="activeTab === 'fields'"
                    :selected-form="selectedForm"
                    :role-options="roleOptions"
                    @show-field-wizard="showFieldWizard = true"
                    @show-add-form-modal="showAddFormModal = true"
                    @show-notification="showNotification"
                  />

                  <!-- Status Configuration Tab -->
                  <StatusConfiguration
                    v-if="activeTab === 'status'"
                    :selected-form="selectedForm"
                    :role-options="roleOptions"
                    @show-notification="showNotification"
                  />

                  <!-- JSON Preview Tab -->
                  <JsonPreview
                    v-if="activeTab === 'preview'"
                    :selected-form="selectedForm"
                    @copy-to-clipboard="copyToClipboard"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Loading Overlay -->
    <LoadingOverlay :loading="loading" />

    <!-- Modals -->
    <CreateFormModal
      :show="showCreateModal"
      :creating="creating"
      :loading-templates="loadingTemplates"
      :organizations-options="organizationsOptions"
      :available-templates="availableTemplates"
      @close="closeCreateModal"
      @create-form="confirmCreateForm"
    />

    <DeleteFormModal
      :show="showDeleteModal"
      :form-to-delete="formToDelete"
      :deleting="deleting"
      @close="closeDeleteModal"
      @delete-form="deleteForm"
    />

    <FieldWizardModal
      :show="showFieldWizard"
      :selected-form="selectedForm"
      @close="closeFieldWizard"
      @save-field="saveWizardField"
      @show-notification="showNotification"
    />

    <AddFormModal
      :show="showAddFormModal"
      :selected-form="selectedForm"
      :organizations-options="organizationsOptions"
      :available-templates="availableTemplates"
      :loading-templates="loadingTemplates"
      @close="closeAddFormModal"
      @add-form="confirmAddForm"
      @show-notification="showNotification"
    />

    <HelpModal :show="showHelpModal" @close="showHelpModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Sparkles, Building, ListIcon, CheckCircleIcon } from "lucide-vue-next";

// WorkOrdeForm Components
import FormHeader from "@/components/WorkOrdeForm_Components/formHeader.vue";
import FormSidebar from "@/components/WorkOrdeForm_Components/formSidebar.vue";
import FieldConfiguration from "@/components/WorkOrdeForm_Components/fieldConfiguration.vue";
import StatusConfiguration from "@/components/WorkOrdeForm_Components/statusConfiguration.vue";
import JsonPreview from "@/components/WorkOrdeForm_Components/jsonPreview.vue";
import EmptyState from "@/components/ui/workOrderUi/emptyState.vue";
import ToastNotification from "@/components/ui/workOrderUi/toastNotification.vue";
import LoadingOverlay from "@/components/ui/workOrderUi/loadingOverlay.vue";
import CreateFormModal from "@/components/modals/workOrderForm_Modals/createFormModal.vue";
import DeleteFormModal from "@/components/modals/workOrderForm_Modals/deleteFormModal.vue";
import FieldWizardModal from "@/components/modals/workOrderForm_Modals/fieldWizardModal.vue";
import AddFormModal from "@/components/modals/workOrderForm_Modals/addFormModal.vue";
import HelpModal from "@/components/modals/workOrderForm_Modals/helpModal.vue";

// Composables
import { useFormTemplates } from "@/composables/workOrderFlow/useFormTemplates";
import { useFormConfiguration } from "@/composables/workOrderFlow/useFormConfiguration";
import { useFieldWizard } from "@/composables/workOrderFlow/useFieldWizard";
import { useNotifications } from "@/composables/workOrderFlow/useNotifications";
import { useAuth } from "@/composables/workOrderFlow/useAuth";

// Utils
import { tabs, getTabIcon } from "@/utils/config/constants";

// Auth
const { userRole } = useAuth();
const { showToast, toastMessage, toastType, showNotification } =
  useNotifications();
const {
  formTemplates,
  selectedForm,
  roleOptions,
  loading,
  currentTenant,
  fetchFormTemplates,
  fetchRoles,
  selectForm,
  toggleFormEnabled,
} = useFormTemplates();
const {
  saving,
  creating,
  deleting,
  loadingTemplates,
  showCreateModal,
  showDeleteModal,
  formToDelete,
  organizationsOptions,
  availableTemplates,
  activeTab,
  createNewForm,
  closeCreateModal,
  confirmCreateForm,
  confirmDeleteForm,
  closeDeleteModal,
  deleteForm,
  saveConfiguration,
  copyToClipboard,
  showAddFormModal,
  closeAddFormModal,
  confirmAddForm,
} = useFormConfiguration(
  selectedForm,
  formTemplates,
  showNotification,
  selectForm,
  fetchFormTemplates,
);
const { showFieldWizard, closeFieldWizard, saveWizardField } = useFieldWizard(
  selectedForm,
  showNotification,
);
const showHelpModal = ref(false);

onMounted(() => {
  fetchRoles();
  fetchFormTemplates();
});
</script>

<style>
@import "../../../styles/components.css";
@import "../../../styles/main.css";
@import "../../../styles/modals.css";
@import "../../../styles/responsive.css";
</style>

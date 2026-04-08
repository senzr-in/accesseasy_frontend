// /senzrGo/senzrfieldopsfrontend/src/composables/workOrderFlow/useFormConfiguration.js
import { ref } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { defaultFormTemplate } from "@/utils/config/defaultFormTemplate.js";

export function useFormConfiguration(
  selectedForm,
  formTemplates,
  showNotification,
  selectForm,
  fetchFormTemplates,
) {
  const saving = ref(false);
  const creating = ref(false);
  const deleting = ref(false);
  const loadingTemplates = ref(false);
  const showCreateModal = ref(false);
  const showDeleteModal = ref(false);
  const showAddFormModal = ref(false);
  const formToDelete = ref(null);
  const organizationsOptions = ref([]);
  const availableTemplates = ref([]);
  const activeTab = ref("fields");

  const getAuthData = async () => {
    await currentUserTenant.initialize();
    return {
      token: authService.getToken(),
      tenantId: await currentUserTenant.getTenantIdAsync(),
    };
  };

  const fetchOrganizations = async (tenantId) => {
    organizationsOptions.value = [];
    if (!tenantId) return;

    try {
      const { token } = await getAuthData();

      if (!token) {
        throw new Error("Authentication token not available");
      }

      const params = new URLSearchParams();
      params.append("limit", "-1");
      params.append("fields[]", "orgName");
      params.append("fields[]", "id");
      params.append(
        "filter[_and][0][_and][0][tenant][tenantId][_eq]",
        tenantId,
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/organization?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      organizationsOptions.value = data.data || [];
    } catch (error) {
      console.error("Error fetching organizations:", error);
      organizationsOptions.value = [];
      showNotification("Failed to fetch organizations.", "error");

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    }
  };

  const fetchAvailableTemplates = async () => {
    loadingTemplates.value = true;
    try {
      const { token } = await getAuthData();

      if (!token) {
        throw new Error("Authentication token not available");
      }

      const params = new URLSearchParams();
      params.append("limit", "-1");
      params.append("fields[]", "formName");
      params.append("fields[]", "custom_FormTemplate");
      params.append("fields[]", "id");
      params.append("sort[]", "-date_created");
      params.append("filter[_and][0][enableForm][_eq]", true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/form_template?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      availableTemplates.value = data.data || [];
    } catch (error) {
      console.error("Error fetching available templates:", error);
      availableTemplates.value = [];
      showNotification("Failed to fetch templates.", "error");

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    } finally {
      loadingTemplates.value = false;
    }
  };

  const fetchTemplateDetails = async (templateId) => {
    try {
      const { token } = await getAuthData();

      if (!token) {
        throw new Error("Authentication token not available");
      }

      const params = new URLSearchParams();
      params.append("fields[]", "formName");
      params.append("fields[]", "custom_FormTemplate");
      params.append("fields[]", "id");
      params.append("filter[_and][0][id][_eq]", templateId);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/form_template?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch template details");
      }

      const data = await response.json();
      return data.data?.[0] ?? null;
    } catch (error) {
      console.error("Error fetching template details:", error);
      showNotification("Failed to fetch template details.", "error");

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
      return null;
    }
  };

  const createNewForm = async () => {
    showCreateModal.value = true;
    const { tenantId } = await getAuthData();
    fetchOrganizations(tenantId);
    fetchAvailableTemplates();
  };

  const closeCreateModal = () => {
    showCreateModal.value = false;
    organizationsOptions.value = [];
    availableTemplates.value = [];
  };

  const confirmCreateForm = async (formData) => {
    if (!formData.name.trim()) {
      showNotification("Form Name is required.", "error");
      return;
    }

    creating.value = true;
    try {
      const { token, tenantId } = await getAuthData();

      if (!token || !tenantId) {
        throw new Error("Authentication data not available");
      }

      let customFormTemplate = JSON.parse(JSON.stringify(defaultFormTemplate));

      if (formData.templateId) {
        const templateDetails = await fetchTemplateDetails(formData.templateId);
        if (templateDetails && templateDetails.custom_FormTemplate) {
          customFormTemplate = JSON.parse(
            JSON.stringify(templateDetails.custom_FormTemplate),
          );
        }
      }

      const newFormData = {
        formName: formData.name.trim(),
        tenant: tenantId,
        assignedOrgnization: formData.orgId,
        enableForm: formData.enabled,
        custom_FormTemplate: customFormTemplate,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newFormData),
        },
      );

      if (response.ok) {
        const result = await response.json();
        const templateMessage = formData.templateId
          ? " with template configuration"
          : " with default service template";
        showNotification(
          `Form created successfully${templateMessage}!`,
          "success",
        );
        closeCreateModal();
        await fetchFormTemplates();
        const newForm = formTemplates.value.find(
          (f) => f.id === result.data.id,
        );
        if (newForm) {
          selectForm(newForm);
        }
      } else {
        throw new Error("Failed to create form");
      }
    } catch (error) {
      console.error("Error creating form:", error);
      showNotification("Error creating form. Please try again.", "error");

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    } finally {
      creating.value = false;
    }
  };

  const confirmDeleteForm = (form) => {
    formToDelete.value = form;
    showDeleteModal.value = true;
  };

  const closeDeleteModal = () => {
    showDeleteModal.value = false;
    formToDelete.value = null;
  };

  const deleteForm = async () => {
    if (!formToDelete.value) return;

    deleting.value = true;
    try {
      const { token } = await getAuthData();

      if (!token) {
        throw new Error("Authentication token not available");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template/${formToDelete.value.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        showNotification(
          `Form "${formToDelete.value.formName}" deleted successfully!`,
          "success",
        );
        if (selectedForm.value?.id === formToDelete.value.id) {
          selectedForm.value = null;
        }
        closeDeleteModal();
        await fetchFormTemplates();
      } else {
        throw new Error("Failed to delete form");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      showNotification("Error deleting form. Please try again.", "error");

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    } finally {
      deleting.value = false;
    }
  };

  const saveConfiguration = async () => {
    if (!selectedForm.value) return;

    saving.value = true;
    try {
      const { token } = await getAuthData();

      if (!token) {
        throw new Error("Authentication token not available");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template/${selectedForm.value.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            custom_FormTemplate: selectedForm.value.custom_FormTemplate,
          }),
        },
      );

      if (response.ok) {
        showNotification("Configuration saved successfully!", "success");
        await selectForm(selectedForm.value);
        await fetchFormTemplates();
      } else {
        throw new Error("Failed to save configuration");
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      showNotification(
        "Error saving configuration. Please try again.",
        "error",
      );

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    } finally {
      saving.value = false;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      JSON.stringify(selectedForm.value.custom_FormTemplate, null, 2),
    );
    showNotification("JSON copied to clipboard!", "success");
  };

  const closeAddFormModal = () => {
    showAddFormModal.value = false;
    availableTemplates.value = [];
  };

  const confirmAddForm = async (formData) => {
    if (!formData.form_name.trim()) {
      showNotification("Form Name is required.", "error");
      return;
    }

    if (!selectedForm.value) {
      showNotification("No form selected to add to.", "error");
      return;
    }

    try {
      const { token } = await getAuthData();
      if (!token) {
        throw new Error("Authentication token not available");
      }

      const newForm = {
        form_name: formData.form_name.trim(),
        form_id: `form_${Date.now()}`,
        requires_location: true,
        location_field_key: {
          lat: "",
          lng: "",
        },
        fields: [],
      };

      if (formData.templateId) {
        const templateDetails = await fetchTemplateDetails(formData.templateId);
        if (
          templateDetails &&
          templateDetails.custom_FormTemplate?.forms?.length
        ) {
          const existingKeys = new Set();
          selectedForm.value.custom_FormTemplate.forms.forEach((form) => {
            form.fields?.forEach((field) => {
              existingKeys.add(field.key);
            });
          });

          const restrictedFields = [
            "orgId",
            "UsersId",
            "user_location",
            "client_location",
            "from",
            "dueTime",
          ];
          const templateFields =
            templateDetails.custom_FormTemplate.forms[0]?.fields || [];
          newForm.fields = templateFields
            .filter(
              (field) =>
                !restrictedFields.includes(field.key) ||
                !existingKeys.has(field.key),
            )
            .map((field) => ({
              ...JSON.parse(JSON.stringify(field)),
              key: existingKeys.has(field.key)
                ? `${field.key}_${Date.now()}`
                : field.key,
            }));
        }
      }

      selectedForm.value.custom_FormTemplate.forms.push(newForm);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template/${selectedForm.value.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            custom_FormTemplate: selectedForm.value.custom_FormTemplate,
          }),
        },
      );

      if (response.ok) {
        showNotification(
          `Form "${formData.form_name}" added successfully!`,
          "success",
        );
        closeAddFormModal();
        await selectForm(selectedForm.value);
        await fetchFormTemplates();
      } else {
        throw new Error("Failed to add form");
      }
    } catch (error) {
      console.error("Error adding form:", error);
      showNotification("Error adding form. Please try again.", "error");
      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    }
  };

  return {
    saving,
    creating,
    deleting,
    loadingTemplates,
    showCreateModal,
    showDeleteModal,
    showAddFormModal,
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
    closeAddFormModal,
    confirmAddForm,
  };
}

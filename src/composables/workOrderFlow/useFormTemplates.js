import { ref } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { defaultFormTemplate } from "@/utils/config/defaultFormTemplate.js";
import { initializeValidations } from "@/utils/config/validationHelpers";

export function useFormTemplates() {
  const formTemplates = ref([]);
  const selectedForm = ref(null);
  const roleOptions = ref([]);
  const loading = ref(false);
  const currentTenant = ref("");

  const getAuthData = async () => {
    await currentUserTenant.initialize();
    return {
      token: authService.getToken(),
      tenantId: await currentUserTenant.getTenantIdAsync(),
    };
  };

  const fetchFormTemplates = async () => {
    loading.value = true;
    try {
      const { token, tenantId } = await getAuthData();

      if (!token || !tenantId) {
        throw new Error("Authentication data not available");
      }

      const params = new URLSearchParams();
      params.append("limit", "-1");
      params.append("fields[]", "formName");
      params.append("fields[]", "tenant.tenantName");
      params.append("fields[]", "id");
      params.append("fields[]", "enableForm");
      params.append("sort[]", "-date_created");
      params.append(
        "filter[_and][0][_and][0][tenant][tenantId][_eq]",
        tenantId,
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      formTemplates.value = data.data || [];

      if (formTemplates.value.length > 0 && formTemplates.value[0].tenant) {
        currentTenant.value = formTemplates.value[0].tenant.tenantName;
      }
    } catch (error) {
      console.error("Error fetching form templates:", error);
      formTemplates.value = [];

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    } finally {
      loading.value = false;
    }
  };

  const fetchRoles = async () => {
    try {
      const { token } = await getAuthData();

      if (!token) {
        throw new Error("Authentication token not available");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/roles?filter[_and][0][name][_neq]=Administrator&filter[_and][1][name][_neq]=esslAdmin&filter[_and][2][name][_neq]=Dealer&filter[_and][3][name][_neq]=accessManager&filter[_and][4][name][_neq]=Manager`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      roleOptions.value = data.data.map((role) => ({
        id: role.id,
        name: role.name || "Unnamed Role",
      }));
    } catch (error) {
      console.error("Error fetching roles:", error);
      roleOptions.value = [];

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    }
  };

  const selectForm = async (form) => {
    if (form.enableForm === false) {
      return;
    }
    loading.value = true;
    try {
      const { token } = await getAuthData();

      if (!token) {
        throw new Error("Authentication token not available");
      }

      const params = new URLSearchParams();
      params.append("limit", "1");
      params.append("fields[]", "formName");
      params.append("fields[]", "custom_FormTemplate");
      params.append("fields[]", "tenant.tenantName");
      params.append("fields[]", "assignedOrgnization.orgName");
      params.append("fields[]", "assignedOrgnization.id");
      params.append("fields[]", "id");
      params.append("filter[_and][0][_and][0][id][_eq]:", form.id);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        selectedForm.value = { ...data.data[0] };
        if (!selectedForm.value.custom_FormTemplate) {
          selectedForm.value.custom_FormTemplate = {
            forms: [],
            shared_properties: {
              booleans: {
                signature: false,
                rating: false,
                supervisor: false,
                timeSheet: false,
                team: false,
              },
              form_visibility_to: { roles: [] },
              status_transitions: JSON.parse(
                JSON.stringify(defaultFormTemplate.status_transitions),
              ),
            },
          };
        }

        if (
          Object.keys(
            selectedForm.value.custom_FormTemplate.shared_properties
              .status_transitions,
          ).length === 0
        ) {
          selectedForm.value.custom_FormTemplate.shared_properties.status_transitions =
            JSON.parse(JSON.stringify(defaultFormTemplate.status_transitions));
          for (const statusKey in selectedForm.value.custom_FormTemplate
            .shared_properties.status_transitions) {
            const transition =
              selectedForm.value.custom_FormTemplate.shared_properties
                .status_transitions[statusKey];
            if (!transition.required_fields) {
              transition.required_fields = {};
            }
            roleOptions.value.forEach((role) => {
              if (!transition.required_fields[role.name]) {
                transition.required_fields[role.name] = [];
              }
            });
          }
        }

        if (selectedForm.value.custom_FormTemplate.forms) {
          selectedForm.value.custom_FormTemplate.forms.forEach((form) => {
            if (form.fields) {
              form.fields.forEach((field) => {
                initializeValidations(field);
              });
            }
          });
        }
      } else {
        selectedForm.value = null;
      }
    } catch (error) {
      console.error("Error fetching full form details:", error);
      selectedForm.value = null;

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    } finally {
      loading.value = false;
    }
  };

  const toggleFormEnabled = async (form, isEnabled) => {
    if (!isEnabled && selectedForm.value?.id === form.id) {
      selectedForm.value = null;
    }
    try {
      const { token } = await getAuthData();

      if (!token) {
        throw new Error("Authentication token not available");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template/${form.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enableForm: isEnabled }),
        },
      );

      if (response.ok) {
        await fetchFormTemplates();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating form status:", error);

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    } finally {
      if (!isEnabled && selectedForm.value?.id === form.id) {
        selectedForm.value = null;
      }
    }
  };

  const createForm = async (formData) => {
    try {
      const { token, tenantId } = await getAuthData();

      if (!token || !tenantId) {
        throw new Error("Authentication data not available");
      }

      const newForm = {
        form_name: formData.form_name,
        requires_location: formData.requires_location,
        location_field_key: formData.requires_location
          ? { lat: "", lng: "" }
          : null,
        fields: [],
      };

      if (formData.templateId) {
        const params = new URLSearchParams();
        params.append("fields[]", "custom_FormTemplate");
        params.append("filter[_and][0][id][_eq]", formData.templateId);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tenant_template?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const templateData = await response.json();
        if (templateData.data?.[0]?.custom_FormTemplate?.forms) {
          newForm.fields = JSON.parse(
            JSON.stringify(
              templateData.data[0].custom_FormTemplate.forms[0]?.fields || [],
            ),
          );
        }
      }

      const updatedCustomFormTemplate = selectedForm.value
        ?.custom_FormTemplate || {
        forms: [],
      };

      updatedCustomFormTemplate.forms.push(newForm);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template/${selectedForm.value?.id || ""}`,
        {
          method: selectedForm.value ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            formName: selectedForm.value?.formName || formData.form_name,
            enableForm: formData.enabled,
            assignedOrgnization: formData.orgId,
            tenant: tenantId,
            custom_FormTemplate: updatedCustomFormTemplate,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchFormTemplates();
    } catch (error) {
      console.error("Error creating form:", error);

      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        authService.logout();
      }
    }
  };

  return {
    formTemplates,
    selectedForm,
    roleOptions,
    loading,
    currentTenant,
    fetchFormTemplates,
    fetchRoles,
    selectForm,
    toggleFormEnabled,
    createForm,
  };
}

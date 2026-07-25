// /senzrGo/senzrfieldopsfrontend/src/composables/workOrderFlow/useFieldWizard.js
import { ref } from "vue";

export function useFieldWizard(selectedForm, showNotification) {
  const showFieldWizard = ref(false);

  const closeFieldWizard = () => {
    showFieldWizard.value = false;
  };

  const saveWizardField = (fieldData, selectedFormId) => {
    if (!selectedForm.value || !fieldData.label || !selectedFormId) return;

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
          status_transitions: {},
        },
      };
    }

    // Find the target form by form_id
    let targetForm = selectedForm.value.custom_FormTemplate.forms.find(
      (form) => form.form_id === selectedFormId,
    );

    // If the form doesn't exist, log an error and return
    if (!targetForm) {
      showNotification("Selected form not found!", "error");
      return;
    }

    // Ensure the form has a fields array
    if (!targetForm.fields) {
      targetForm.fields = [];
    }

    // Add the new field to the target form's fields array
    targetForm.fields.push(fieldData);
    closeFieldWizard();
    showNotification(
      `Field added to ${targetForm.form_name} successfully!`,
      "success",
    );
  };

  return {
    showFieldWizard,
    closeFieldWizard,
    saveWizardField,
  };
}

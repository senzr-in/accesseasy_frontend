import {
  getValidationRules,
  isFieldMandatory,
} from "@/utils/createWOF/validationRules";

export function useFormValidation() {
  const validateField = (field, value, userRole, formData) => {
    const rules = getValidationRules(field, userRole, formData);

    for (const rule of rules) {
      const result = rule(value);
      if (result !== true) {
        return result; // Return error message
      }
    }

    return true; // Valid
  };

  const isRequired = (field, userRole) => {
    return isFieldMandatory(field, userRole);
  };

  const getFieldErrorMessages = (field, value, userRole, formData) => {
    const validationResult = validateField(field, value, userRole, formData);
    return validationResult === true ? [] : [validationResult];
  };

  return {
    validateField,
    isRequired,
    getFieldErrorMessages,
  };
}

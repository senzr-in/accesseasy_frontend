// /senzrGo/senzrfieldopsfrontend/src/utils/createWOF/validationRules.js
export const isFieldMandatory = (field, userRole) => {
  // Check roleBasedMandatory first (highest priority)
  const mandatory = field.roleBasedMandatory;
  if (mandatory && typeof mandatory === "object") {
    if (mandatory[userRole] !== undefined) {
      return mandatory[userRole] === true;
    }
  }

  // Check roleBasedRequired second
  const required = field.roleBasedRequired;
  if (required && typeof required === "object") {
    if (required[userRole] !== undefined) {
      return required[userRole] === true;
    }
  }

  // Check validations.required last
  const validationRequired = field.validations?.required;
  return validationRequired === true;
};

// Declare getFieldTypeString function
const getFieldTypeString = (type) => {
  if (!type) return "text"; // Default to text if type is undefined
  if (typeof type === "object" && type.date === true) {
    return "date";
  }
  if (typeof type === "string") {
    return type.toLowerCase();
  }
  return "text"; // Fallback
};

// Declare isEndDateField function
const isEndDateField = (field) => {
  if (!field) return false;
  const key = field.key || "";
  const label = (field.label || "").toLowerCase();
  return key === "dueTime" || label.includes("end") || label.includes("due");
};

export const getValidationRules = (field, userRole, formData) => {
  if (!field) {
    console.warn("[v0] getValidationRules called with undefined field");
    return [];
  }

  const rules = [];
  const validations = field.validations || {}; // Default to empty object
  const mandatory = isFieldMandatory(field, userRole);
  const fieldType = getFieldTypeString(field.type);

  if (mandatory || validations?.required) {
    rules.push((v) => {
      // Check for empty values
      if (v === null || v === undefined || v === "") {
        return (
          validations?.message || `${field.label || "This field"} is required.`
        );
      }
      // For arrays (like multi-select), check if empty
      if (Array.isArray(v) && v.length === 0) {
        return (
          validations?.message || `${field.label || "This field"} is required.`
        );
      }
      return true;
    });
  }

  if (validations && typeof validations === "object") {
    // Text/BigText validations
    if (fieldType === "text" || fieldType === "bigtext") {
      if (validations.minLength) {
        rules.push((v) => {
          if (v && v.length < validations.minLength) {
            return (
              validations.message || `Min length is ${validations.minLength}.`
            );
          }
          return true;
        });
      }
      if (validations.maxLength) {
        rules.push((v) => {
          if (v && v.length > validations.maxLength) {
            return (
              validations.message || `Max length is ${validations.maxLength}.`
            );
          }
          return true;
        });
      }
    }

    // Number validations
    if (fieldType === "number") {
      const toNum = (val) => {
        const n = Number(val);
        return Number.isFinite(n) ? n : null;
      };

      if (validations.min !== undefined) {
        rules.push((v) => {
          if (v === null || v === "" || v === undefined) return true;
          const n = toNum(v);
          if (n === null) return validations.message || "Must be a number.";
          return n < Number(validations.min)
            ? validations.message ||
                `Value must be at least ${validations.min}.`
            : true;
        });
      }

      if (validations.max !== undefined) {
        rules.push((v) => {
          if (v === null || v === "" || v === undefined) return true;
          const n = toNum(v);
          if (n === null) return validations.message || "Must be a number.";
          return n > Number(validations.max)
            ? validations.message || `Value must be at most ${validations.max}.`
            : true;
        });
      }

      if (
        validations.range &&
        Array.isArray(validations.range) &&
        validations.range.length === 2
      ) {
        const [minR, maxR] = validations.range;
        rules.push((v) => {
          if (v === null || v === "" || v === undefined) return true;
          const n = toNum(v);
          if (n === null) return validations.message || "Must be a number.";
          return n < Number(minR) || n > Number(maxR)
            ? validations.message ||
                `Value must be between ${minR} and ${maxR}.`
            : true;
        });
      }
    }

    // Date validations
    if (fieldType === "date") {
      if (validations.format) {
        rules.push((v) => {
          if (!v) return true;
          if (validations.format === "YYYY-MM-DD") {
            return /^\d{4}-\d{2}-\d{2}/.test(v)
              ? true
              : validations.message ||
                  `Date format must be ${validations.format}.`;
          }
          return true;
        });
      }

      if (isEndDateField(field)) {
        rules.push((v) => {
          if (!v) return true;
          if (!formData || typeof formData !== "object") return true;

          const endVal = new Date(v);

          const fallbackStartKey = [
            "from",
            "startDate",
            "start_date",
            "fromDate",
            "from_date",
            "expectedStartDate",
            "start",
          ].find(
            (k) =>
              Object.prototype.hasOwnProperty.call(formData, k) && formData[k],
          );

          const refKey = validations?.mustBeAfterField || fallbackStartKey;
          if (!refKey) return true;

          const startRaw = formData[refKey];
          if (!startRaw) return true;

          const startVal = new Date(startRaw);
          if (
            Number.isFinite(startVal.getTime()) &&
            Number.isFinite(endVal.getTime()) &&
            endVal <= startVal
          ) {
            return (
              validations?.message || `End/Due date must be after ${refKey}.`
            );
          }
          return true;
        });
      }
    }

    // Image validations
    if (fieldType === "image") {
      if (validations.maxSizeMB) {
        rules.push((v) => {
          if (v && v.size > validations.maxSizeMB * 1024 * 1024) {
            return (
              validations.message ||
              `Image size must be less than ${validations.maxSizeMB} MB.`
            );
          }
          return true;
        });
      }
      if (
        validations.fileTypeAllowed &&
        validations.fileTypeAllowed.length > 0
      ) {
        rules.push((v) => {
          if (v) {
            if (
              typeof v === "string" ||
              (Array.isArray(v) && typeof v[0] === "string")
            ) {
              return true;
            }

            if (v.name) {
              const fileExtension = v.name.split(".").pop().toLowerCase();
              if (!validations.fileTypeAllowed.includes(fileExtension)) {
                return (
                  validations.message ||
                  `Allowed types: ${validations.fileTypeAllowed.join(", ")}.`
                );
              }
            }
          }
          return true;
        });
      }
    }

    // OTP/Happy Code validations
    if (
      (fieldType === "otp" || fieldType === "happy-code") &&
      validations.length !== undefined
    ) {
      rules.push((v) => {
        if (v && String(v).length !== validations.length) {
          return (
            validations.message ||
            `Must be exactly ${validations.length} digits.`
          );
        }
        return true;
      });
    }
  }

  return rules;
};

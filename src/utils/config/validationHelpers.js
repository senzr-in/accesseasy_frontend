export const initializeValidations = (field) => {
  if (!field.validations) {
    field.validations = {};
  }

  if (field.validations.required === undefined) {
    field.validations.required = false;
  }
  if (field.validations.message === undefined) {
    field.validations.message = "";
  }

  // Initialize other validation properties based on field type
  if (field.type === "text" || field.type === "bigtext") {
    if (field.validations.minLength === undefined) {
      field.validations.minLength = null;
    }
    if (field.validations.maxLength === undefined) {
      field.validations.maxLength = null;
    }
  }

  if (field.type === "number") {
    if (field.validations.min === undefined) {
      field.validations.min = null;
    }
    if (field.validations.max === undefined) {
      field.validations.max = null;
    }
  }

  if (isDateField(field.type)) {
    // Removed format and allowPastDates as per request
    // if (field.validations.format === undefined) {
    //   field.validations.format = "DD-MM-YYYY"
    // }
    if (field.validations.allowPastDates === undefined) {
      field.validations.allowPastDates = false;
    }
  }

  if (field.type === "image") {
    if (field.validations.maxSizeMB === undefined) {
      field.validations.maxSizeMB = 5;
    }
    if (field.validations.fileTypeAllowed === undefined) {
      field.validations.fileTypeAllowed = ["jpg", "jpeg", "png"];
    }
  }

  if (field.type === "otp" || field.type === "happy-code") {
    if (field.validations.length === undefined) {
      field.validations.length = 4;
    }

    if (field.validations.auto_generate === undefined) {
      field.validations.auto_generate = false;
    }
  }

  if (field.type === "gps-currentLocation") {
    if (field.validations.within_range === undefined) {
      field.validations.within_range = false;
    }
  }
};

export const isDateField = (fieldType) => {
  return typeof fieldType === "object" && fieldType.date === true;
};

export const getFieldTypeDisplay = (fieldType) => {
  if (typeof fieldType === "object" && fieldType.date === true) {
    return "Date";
  }
  return fieldType;
};

export const toggleFileType = (field, fileType, isChecked) => {
  if (!field.validations.fileTypeAllowed) {
    field.validations.fileTypeAllowed = [];
  }
  if (isChecked) {
    if (!field.validations.fileTypeAllowed.includes(fileType)) {
      field.validations.fileTypeAllowed.push(fileType);
    }
  } else {
    const index = field.validations.fileTypeAllowed.indexOf(fileType);
    if (index > -1) {
      field.validations.fileTypeAllowed.splice(index, 1);
    }
  }
};

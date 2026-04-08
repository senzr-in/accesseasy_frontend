// /senzrGo/senzrfieldopsfrontend/src/utils/createWOF/fieldUtils.js
// Field type support mapping
const SUPPORTED_FIELD_TYPES = {
  text: true,
  number: true,
  bigtext: true,
  dropdown: true,
  boolean: true,
  image: true,
  gps: true,
  "gps-currentLocation": true,
  clientSelector: true,
  orgId: true,
  otp: true,
  "happy-code": true,
  date: true,
};

// Get field type as string for consistent handling
export const getFieldTypeString = (fieldType) => {
  if (typeof fieldType === "object" && fieldType.date === true) {
    return "date";
  }
  return fieldType;
};

// Get field type display name
export const getFieldTypeDisplay = (fieldType) => {
  return getFieldTypeString(fieldType);
};

// Check if field type is supported
export const isFieldTypeSupported = (fieldType) => {
  const typeString = getFieldTypeString(fieldType);
  return SUPPORTED_FIELD_TYPES[typeString] || false;
};

// Dynamic field component mapping
export const getFieldComponent = (field) => {
  const fieldType = getFieldTypeString(field.type);

  switch (fieldType) {
    case "text":
    case "number":
    case "date":
    case "gps":
    case "gps-currentLocation":
    case "otp":
    case "happy-code":
      return "v-text-field";
    case "bigtext":
      return "v-textarea";
    case "dropdown":
    case "clientSelector":
    case "orgId":
      return "v-select";
    case "boolean":
      return "v-checkbox";
    case "image":
      return "v-file-input";
    default:
      return "v-text-field";
  }
};

// Get dynamic field properties
export const getFieldProps = (field) => {
  const fieldType = getFieldTypeString(field.type);
  const baseProps = {
    label: field.placeholder || field.label,
    variant: "outlined",
    density: "comfortable",
    clearable: true,
  };

  switch (fieldType) {
    case "number":
      return {
        ...baseProps,
        type: "number",
      };

    case "date":
      return {
        ...baseProps,
        type: "date",
      };

    case "bigtext":
      return {
        ...baseProps,
        rows: 3,
        autoGrow: true,
      };

    case "dropdown":
      return {
        ...baseProps,
        items: field.options || [],
        itemTitle: "title",
        itemValue: "value",
      };

    case "clientSelector":
      return {
        ...baseProps,
        items: [], // Will be populated by parent component
        itemTitle: "orgName",
        itemValue: "id",
        appendInnerIcon: field.input_modes?.qr ? "mdi-qrcode-scan" : undefined,
      };

    case "orgId":
      return {
        ...baseProps,
        items: [],
        itemTitle: "orgName",
        itemValue: "id",
      };

    case "boolean":
      return {
        label: field.label,
        density: "comfortable",
        color: "primary",
        hideDetails: false,
      };

    case "image":
      return {
        ...baseProps,
        accept: getImageAcceptTypes(field),
        prependIcon: "mdi-camera",
        showSizeCounter: true,
      };

    case "gps":
    case "gps-currentLocation":
      return {
        ...baseProps,
        readonly: true,
        appendInnerIcon: "mdi-map-marker",
      };

    case "otp":
    case "happy-code":
      return {
        ...baseProps,
        type: field.input_modes?.number ? "number" : "text",
        maxlength: field.validations?.length,
      };

    default:
      return {
        ...baseProps,
        disabled: !isFieldTypeSupported(field.type),
      };
  }
};

// Get image accept types based on validation
const getImageAcceptTypes = (field) => {
  if (field.validations?.fileTypeAllowed?.length > 0) {
    return field.validations.fileTypeAllowed
      .map((type) => `image/${type}`)
      .join(",");
  }
  return "image/*";
};

// Get field icon based on type
export const getFieldIcon = (field) => {
  const fieldType = getFieldTypeString(field.type);

  const iconMap = {
    text: "mdi-text",
    number: "mdi-numeric",
    bigtext: "mdi-text-long",
    dropdown: "mdi-menu-down",
    boolean: "mdi-checkbox-marked",
    image: "mdi-camera",
    gps: "mdi-map-marker",
    "gps-currentLocation": "mdi-crosshairs-gps",
    clientSelector: "mdi-account-group",
    orgId: "mdi-domain",
    otp: "mdi-key-variant",
    "happy-code": "mdi-emoticon-happy",
    date: "mdi-calendar",
  };

  return iconMap[fieldType] || "mdi-form-textbox";
};

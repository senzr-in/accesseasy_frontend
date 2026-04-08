import {
  TypeIcon,
  FileTextIcon,
  ListIcon,
  CalendarIcon,
} from "lucide-vue-next";

export const getFieldTypeIcon = (fieldType) => {
  const typeStr = typeof fieldType === "object" ? "date" : fieldType;
  const iconMap = {
    text: TypeIcon,
    number: "Hash",
    bigtext: FileTextIcon,
    dropdown: ListIcon,
    boolean: "ToggleLeft",
    date: CalendarIcon,
    image: "ImageIcon",
    gps: "MapPin",
    "gps-currentLocation": "MapPin",
    clientSelector: "Users",
    UsersId: "Users",
    otp: "Lock",
    "happy-code": "Smile",
  };
  return iconMap[typeStr] || TypeIcon;
};

export const getFieldTypeDisplay = (fieldType) => {
  if (typeof fieldType === "object" && fieldType.date === true) {
    return "Date";
  }

  const displayMap = {
    text: "Text",
    number: "Number",
    bigtext: "Long Text",
    dropdown: "Dropdown",
    boolean: "Yes/No",
    image: "Image Upload",
    gps: "GPS Location",
    "gps-currentLocation": "GPS Current Location",
    clientSelector: "Client Selector",
    UsersId: "Employee Selector",
    otp: "OTP",
    "happy-code": "Happy Code",
  };

  return displayMap[fieldType] || fieldType;
};

export const generateFieldKey = (label) => {
  if (!label) return `field_${Date.now()}`;

  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") +
    "_" +
    Date.now()
  );
};

export const duplicateField = (field) => {
  return {
    ...JSON.parse(JSON.stringify(field)),
    key: `${field.key}_copy_${Date.now()}`,
    label: `${field.label} (Copy)`,
  };
};

import {
  Settings,
  Users,
  EyeIcon,
  TypeIcon,
  FileTextIcon,
  ListIcon,
  CalendarIcon,
  Hash,
  ToggleLeft,
  ImageIcon,
  MapPin,
  Lock,
  Smile,
} from "lucide-vue-next";

export const tabs = [
  { id: "fields", name: "Fields Configuration" },
  { id: "status", name: "Status Transitions" },
  { id: "preview", name: "JSON Preview" },
];

export const getTabIcon = (tabId) => {
  const iconMap = {
    fields: Settings,
    status: Users,
    preview: EyeIcon,
  };
  return iconMap[tabId] || Settings;
};

export const fieldTypeOptions = [
  {
    value: "text",
    label: "Text Input",
    icon: TypeIcon,
    description:
      "A single-line text field for short answers like names or titles.",
  },
  {
    value: "number",
    label: "Number",
    icon: Hash,
    description:
      "An input field specifically for numeric values, allowing min/max validation.",
  },
  {
    value: "bigtext",
    label: "Long Text",
    icon: FileTextIcon,
    description: "A multi-line text area for longer descriptions or notes.",
  },
  {
    value: "dropdown",
    label: "Dropdown",
    icon: ListIcon,
    description:
      "A selectable list of predefined options for users to choose from.",
  },
  {
    value: "boolean",
    label: "Yes/No",
    icon: ToggleLeft,
    description: "A simple toggle switch for true/false or yes/no responses.",
  },
  {
    value: { date: true },
    label: "Date",
    icon: CalendarIcon,
    description: "A date picker for selecting a specific date.",
  },
  {
    value: "image",
    label: "Image Upload",
    icon: ImageIcon,
    description:
      "Allows users to upload image files, with options for size and type restrictions.",
  },
  {
    value: "gps",
    label: "GPS Location",
    icon: MapPin,
    description:
      "Captures a specific GPS coordinate, typically entered manually.",
  },
  {
    value: "gps-currentLocation",
    label: "GPS Current Location",
    icon: MapPin,
    description:
      "Automatically captures the user's current GPS location, with an option for within-range validation.",
  },
  {
    value: "clientSelector",
    label: "Client Selector",
    icon: Users,
    description: "A field to select an existing client from a list.",
  },
  {
    value: "UsersId",
    label: "Employee Selector",
    icon: Users,
    description:
      "A field to select an employee (Technician or Collector) from a list of users.",
  },
  {
    value: "otp",
    label: "OTP",
    icon: Lock,
    description:
      "A field for entering a One-Time Password, with an option for auto-generation.",
  },
  {
    value: "happy-code",
    label: "Happy Code",
    icon: Smile,
    description:
      "A specialized code input field, often used for feedback or quick surveys, with an option for auto-generation.",
  },
];

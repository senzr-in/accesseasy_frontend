<template>
  <v-chip
    :color="config.color"
    :text-color="config.textColor"
    size="x-small"
    class="font-weight-medium"
  >
    <v-icon :icon="config.icon" size="x-small" class="mr-1"></v-icon>
    {{ config.label }}
  </v-chip>
</template>

<script>
export default {
  name: "StatusBadge",
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) => {
        return [
          "pending",
          "completed",
          "rejected",
          "not_required",
          "not_applicable",
          "hr_action",
          "hr_uploaded",
        ].includes(value);
      },
    },
  },
  computed: {
    config() {
      switch (this.status) {
        case "pending":
          return {
            label: "Pending",
            color: "grey-lighten-3",
            textColor: "grey-darken-1",
            icon: "mdi-clock-outline",
          };
        case "completed":
          return {
            label: "Completed",
            color: "success-lighten-4",
            textColor: "success-darken-1",
            icon: "mdi-check",
          };
        case "rejected":
          return {
            label: "Rejected",
            color: "error-lighten-4",
            textColor: "error-darken-1",
            icon: "mdi-close",
          };
        case "not_required":
          return {
            label: "Optional",
            color: "grey-lighten-3",
            textColor: "grey-darken-1",
            icon: "mdi-help-circle-outline",
          };
        case "not_applicable":
          return {
            label: "N/A",
            color: "grey-lighten-3",
            textColor: "grey-darken-1",
            icon: "mdi-alert-circle-outline",
          };
        case "hr_action":
          return {
            label: "HR Will Provide",
            color: "blue-grey-lighten-4",
            textColor: "blue-grey-darken-1",
            icon: "mdi-account-cog",
          };
        case "hr_uploaded":
          return {
            label: "Provided by HR",
            color: "success-lighten-4",
            textColor: "success-darken-1",
            icon: "mdi-file-check-outline",
          };
        default:
          return {
            label: "Unknown",
            color: "grey-lighten-3",
            textColor: "grey-darken-1",
            icon: "mdi-help-circle-outline",
          };
      }
    },
  },
};
</script>

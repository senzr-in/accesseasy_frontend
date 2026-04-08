<template>
  <v-dialog
    :model-value="show"
    @update:model-value="$emit('update:show', $event)"
    persistent
    max-width="400"
    content-class="download-progress-dialog"
  >
    <v-card>
      <v-card-title class="headline d-flex align-center">
        <v-icon color="primary" size="24" class="mr-2"
          >mdi-file-download</v-icon
        >
        {{ title }}
      </v-card-title>

      <v-card-text>
        <div class="text-center mb-4">
          <div class="progress-status">{{ statusText }}</div>
          <div class="progress-percentage">{{ progress }}%</div>
        </div>

        <v-progress-linear
          :model-value="progress"
          color="primary"
          height="10"
          rounded
          striped
          :active="progress < 100"
          class="progress-bar"
        ></v-progress-linear>

        <div class="d-flex justify-space-between mt-2">
          <span class="text-caption text-grey">{{ fileName }}</span>
          <span class="text-caption text-grey">{{ formattedSize }}</span>
        </div>
      </v-card-text>

      <v-card-actions v-if="showCancel">
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="$emit('cancel')">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: "Downloading Salary Sheet",
    },
    fileName: {
      type: String,
      default: "salary-sheet.xlsx",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    showCancel: {
      type: Boolean,
      default: true,
    },
  },

  emits: ["update:show", "cancel"],

  computed: {
    statusText() {
      if (this.progress < 100) {
        return "Downloading...";
      } else {
        return "Download Complete!";
      }
    },

    formattedSize() {
      if (!this.fileSize) return "";

      const units = ["B", "KB", "MB", "GB"];
      let size = this.fileSize;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${size.toFixed(1)} ${units[unitIndex]}`;
    },
  },

  watch: {
    progress(newValue) {
      if (newValue >= 100) {
        // Auto close after 1.5 seconds when download is complete
        setTimeout(() => {
          this.$emit("update:show", false);
        }, 1500);
      }
    },
  },
};
</script>

<style scoped>
.download-progress-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.progress-status {
  font-size: 16px;
  color: #666;
  margin-bottom: 4px;
}

.progress-percentage {
  font-size: 32px;
  font-weight: 600;
  color: #1a73e8;
  margin-bottom: 12px;
}

.progress-bar {
  border-radius: 8px;
  overflow: hidden;
}
</style>

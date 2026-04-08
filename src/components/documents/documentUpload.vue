<template>
  <div class="document-upload mb-4 pa-4 border rounded">
    <v-row>
      <v-col cols="12" md="6">
        <div class="d-flex align-center mb-1">
          <h3 class="text-subtitle-1 font-weight-medium">{{ title }}</h3>
          <span v-if="required" class="text-caption text-error ml-2"
            >*Required</span
          >
          <status-badge :status="currentStatus" class="ml-2"></status-badge>
        </div>
        <p class="text-body-2 text-grey">{{ description }}</p>
      </v-col>

      <v-col cols="12" md="6" class="d-flex align-center justify-end">
        <!-- HR Action Status -->
        <template v-if="currentStatus === 'hr_action'">
          <div v-if="!isHrView" class="d-flex align-center">
            <span class="text-caption font-italic text-grey"
              >HR will provide this document</span
            >
          </div>

          <div v-else class="d-flex align-center">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-upload"
              @click="triggerFileInput"
            >
              Upload for Employee
            </v-btn>
            <input
              type="file"
              ref="fileInput"
              class="d-none"
              @change="handleFileChange"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>
        </template>

        <!-- HR Uploaded Status -->
        <template v-else-if="currentStatus === 'hr_uploaded'">
          <div class="d-flex align-center">
            <v-chip class="mr-2" color="grey-lighten-3" size="small">
              {{ file ? file.name : "document.pdf" }}
              <span class="text-caption ml-1" v-if="file">
                ({{ Math.round(file.size / 1024) }} KB)
              </span>
            </v-chip>

            <v-btn icon variant="text" size="small" class="mr-1">
              <v-icon>mdi-eye</v-icon>
            </v-btn>

            <v-btn icon variant="text" size="small" class="mr-1">
              <v-icon>mdi-download</v-icon>
            </v-btn>

            <v-btn
              v-if="isHrView"
              icon
              variant="text"
              size="small"
              @click="handleDelete"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>

        <!-- Not Applicable Status -->
        <template v-else-if="currentStatus === 'not_applicable'">
          <span class="text-caption font-italic text-grey">Not applicable</span>
        </template>

        <!-- Optional Status -->
        <template v-else-if="currentStatus === 'not_required'">
          <div class="d-flex align-center">
            <span class="text-caption font-italic text-grey mr-2"
              >Optional</span
            >

            <template v-if="!file">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-upload"
                @click="triggerFileInput"
              >
                Upload if available
              </v-btn>
              <input
                type="file"
                ref="fileInput"
                class="d-none"
                @change="handleFileChange"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </template>

            <template v-else>
              <v-chip class="mr-2" color="grey-lighten-3" size="small">
                {{ file.name }}
                <span class="text-caption ml-1">
                  ({{ Math.round(file.size / 1024) }} KB)
                </span>
              </v-chip>

              <v-btn icon variant="text" size="small" class="mr-1">
                <v-icon>mdi-eye</v-icon>
              </v-btn>

              <v-btn icon variant="text" size="small" @click="handleDelete">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </div>
        </template>

        <!-- Default Status (pending, completed, etc.) -->
        <template v-else>
          <template v-if="file">
            <v-chip class="mr-2" color="grey-lighten-3" size="small">
              {{ file.name }}
              <span class="text-caption ml-1">
                ({{ Math.round(file.size / 1024) }} KB)
              </span>
            </v-chip>

            <v-btn icon variant="text" size="small" class="mr-1">
              <v-icon>mdi-eye</v-icon>
            </v-btn>

            <v-btn icon variant="text" size="small" @click="handleDelete">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>

          <template v-else>
            <v-btn
              variant="outlined"
              prepend-icon="mdi-upload"
              @click="triggerFileInput"
            >
              Upload
            </v-btn>
            <input
              type="file"
              ref="fileInput"
              class="d-none"
              @change="handleFileChange"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </template>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import StatusBadge from "./statusBadge.vue";

export default {
  name: "DocumentUpload",
  components: {
    StatusBadge,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
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
    required: {
      type: Boolean,
      default: false,
    },
    isHrView: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentStatus: this.status,
      file: null,
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(e) {
      if (e.target.files && e.target.files[0]) {
        this.file = e.target.files[0];
        this.currentStatus =
          this.isHrView && this.status === "hr_action"
            ? "hr_uploaded"
            : "completed";
      }
    },
    handleDelete() {
      this.file = null;
      this.currentStatus =
        this.status === "hr_uploaded" || this.status === "hr_action"
          ? "hr_action"
          : "pending";
    },
  },
};
</script>

<style scoped>
.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}
</style>

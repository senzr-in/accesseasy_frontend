<template>
  <v-dialog :model-value="show" max-width="500px" persistent>
    <v-card class="email-dialog-card" elevation="12">
      <v-card-title class="email-dialog-header">
        <v-icon class="header-icon mr-3" size="28">mdi-email-outline</v-icon>
        <span class="header-title">Client Email Required</span>
      </v-card-title>

      <v-card-text class="email-dialog-content">
        <v-alert type="info" variant="tonal" class="mb-4" prominent>
          <v-alert-title>Email Required</v-alert-title>
          Client has no email address. Please provide an email to send OTP/Happy
          Code.
        </v-alert>

        <v-text-field
          :model-value="clientEmail"
          @update:model-value="$emit('update:client-email', $event)"
          label="Client Email Address"
          type="email"
          :rules="emailRules"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-email"
          class="email-input"
          required
        ></v-text-field>
      </v-card-text>

      <v-card-actions class="email-dialog-actions">
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="$emit('skip')"
          size="large"
          class="action-btn"
        >
          Do it Later
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          @click="$emit('update-and-submit')"
          size="large"
          class="action-btn update-btn"
          append-icon="mdi-check"
        >
          Update & Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  clientEmail: String,
  emailRules: Array,
});

const emit = defineEmits([
  "update-and-submit",
  "skip",
  "update:show",
  "update:client-email",
]);
</script>

<style scoped>
.email-dialog-card {
  border-radius: 20px !important;
  overflow: hidden;
}

.email-dialog-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  padding: 24px;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.email-dialog-content {
  padding: 32px;
}

.email-input {
  margin-top: 16px;
}

.email-dialog-actions {
  padding: 24px 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.action-btn {
  border-radius: 12px !important;
  font-weight: 600;
  text-transform: none;
  min-width: 140px;
  transition: all 0.3s ease;
}

.update-btn {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3) !important;
}

.update-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4) !important;
}

:deep(.v-text-field .v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>

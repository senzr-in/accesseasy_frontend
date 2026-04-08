<template>
  <v-row class="error-container">
    <v-col cols="12" class="text-center">
      <v-alert
        type="error"
        prominent
        variant="tonal"
        class="error-alert"
      >
        <template #prepend>
          <v-icon size="32">mdi-alert-circle</v-icon>
        </template>
        <v-alert-title class="error-title">Error Loading Form</v-alert-title>
        <div class="error-message">{{ error }}</div>
      </v-alert>
    </v-col>
  </v-row>
</template>

<script setup>
const props = defineProps({
  error: String
})
</script>

<style scoped>
.error-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.error-alert {
  border-radius: 16px !important;
  max-width: 600px;
  margin: 0 auto;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.error-message {
  font-size: 1rem;
  line-height: 1.5;
}
</style>

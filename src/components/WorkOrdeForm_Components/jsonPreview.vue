<template>
  <div class="preview-tab">
    <div class="preview-guide">
      <div class="guide-content">
        <div class="guide-icon">
          <EyeIcon class="w-8 h-8" />
        </div>
        <div class="guide-text">
          <h3 class="guide-title">Form Configuration Preview</h3>
          <p class="guide-description">
            This is how your form configuration looks in JSON format. You can
            copy this for backup or debugging purposes.
          </p>
        </div>
      </div>
    </div>
    <div class="json-preview-container">
      <div class="json-preview-header">
        <h3 class="json-title">JSON Configuration</h3>
        <button @click="$emit('copyToClipboard')" class="btn btn-secondary">
          <CopyIcon class="btn-icon" />
          Copy JSON
        </button>
      </div>
      <div class="json-preview">
        <pre class="json-code">{{
          JSON.stringify(selectedForm.custom_FormTemplate, null, 2)
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { EyeIcon, CopyIcon } from "lucide-vue-next";

defineProps({
  selectedForm: Object,
});

defineEmits(["copyToClipboard"]);
</script>

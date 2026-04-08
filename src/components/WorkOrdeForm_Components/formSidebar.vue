<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <div class="sidebar-header">
        <h2 class="sidebar-title">
          <FileTextIcon class="sidebar-title-icon" />
          Your Forms
        </h2>
        <p class="sidebar-description">
          Select a form to configure or create a new one
        </p>
      </div>
      <div class="form-list">
        <!-- Enhanced Create New Form Box -->
        <div @click="$emit('createNewForm')" class="form-item form-item-create">
          <div class="create-form-content">
            <div class="create-form-icon">
              <PlusIcon class="w-full h-full" />
            </div>
            <div class="create-form-text">
              <div class="create-form-title">Create New Form</div>
              <div class="create-form-subtitle">
                Start building your work order
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Empty State for Forms -->
        <div v-if="formTemplates.length === 0" class="empty-forms-state">
          <div class="empty-forms-icon-wrapper">
            <FileTextIcon class="empty-forms-icon" />
          </div>
          <div class="empty-forms-content">
            <h3 class="empty-forms-title">No Forms Yet</h3>
            <p class="empty-forms-text">
              Create your first work order form to get started! You can add
              fields, set validation rules, and configure workflows.
            </p>
            <button
              @click="$emit('createNewForm')"
              class="btn btn-primary btn-sm"
            >
              <PlusIcon class="btn-icon" />
              Create Your First Form
            </button>
          </div>
        </div>

        <!-- Enhanced Existing Forms -->
        <div
          v-for="form in formTemplates"
          :key="form.id"
          @click="$emit('selectForm', form)"
          class="form-item"
          :class="{
            'form-item-active': selectedForm?.id === form.id,
            'form-item-disabled': form.enableForm === false,
          }"
        >
          <div class="form-item-header">
            <div class="form-item-info">
              <div class="form-item-name">{{ form.formName }}</div>
              <div class="form-item-meta">
                <span class="form-item-tenant">{{
                  form.tenant?.tenantName || "No tenant"
                }}</span>
              </div>
            </div>
            <div class="form-item-actions">
              <!-- Delete Button -->
              <button
                @click.stop="$emit('confirmDeleteForm', form)"
                class="action-btn action-btn-danger"
                title="Delete Form"
              >
                <Trash2Icon class="w-4 h-4" />
              </button>
              <!-- Enable/Disable Toggle -->
              <label
                class="toggle-switch"
                @click.stop
                title="Enable/Disable Form"
              >
                <input
                  type="checkbox"
                  :checked="form.enableForm"
                  @change="
                    $emit('toggleFormEnabled', form, $event.target.checked)
                  "
                  class="toggle-input"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <!-- Form Status Indicators -->
          <div class="form-item-status">
            <div v-if="form.enableForm" class="status-badge status-active">
              <CheckCircleIcon class="status-icon" />
              Active
            </div>
            <div v-else class="status-badge status-disabled">
              <LockIcon class="status-icon" />
              Disabled
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import {
  FileTextIcon,
  PlusIcon,
  ListIcon,
  Trash2Icon,
  CheckCircleIcon,
  LockIcon,
} from "lucide-vue-next";

defineProps({
  formTemplates: Array,
  selectedForm: Object,
  loading: Boolean,
});

defineEmits([
  "selectForm",
  "createNewForm",
  "toggleFormEnabled",
  "confirmDeleteForm",
]);
</script>

<style scoped>
@import "../../styles/components.css";
</style>

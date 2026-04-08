<template>
  <div class="app-container">
    <!-- Toast Container -->
    <ToastContainer ref="toastContainer" />

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ loadingMessage }}</p>
    </div>

    <!-- ==================== LEFT SIDEBAR ==================== -->
    <div class="sidebar">
      <!-- <div class="sidebar-headers">
        <div class="header-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2 class="sidebar-title">Role Configurator</h2>
      </div> -->

      <div class="sidebar-content">
        <button
          @click="showAddDrawer"
          class="add-role-btn"
          :disabled="isLoading"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add New Role
        </button>

        <div class="roles-section">
          <div class="roles-header">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 class="roles-title">Existing Roles</h3>
          </div>

          <div class="roles-list">
            <div
              v-for="role in roles"
              :key="role.id"
              @click="selectRole(role)"
              :class="[
                'role-item',
                selectedRole?.id === role.id ? 'role-item-active' : '',
                hasUnsavedChanges && selectedRole?.id === role.id
                  ? 'role-item-modified'
                  : '',
              ]"
            >
              <div class="role-item-header">
                <div class="role-icon">
                  <svg
                    v-if="role.orgType === 'tenant'"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V7l8-4v18" />
                    <path d="M19 21V11l-6-4" />
                  </svg>
                  <svg
                    v-else-if="role.orgType === 'distributor'"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"
                    />
                    <path d="M15 18H9" />
                    <path
                      d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"
                    />
                    <circle cx="17" cy="18" r="2" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                  <svg
                    v-else
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div class="role-details">
                  <div class="role-name">{{ role.roleName }}</div>
                  <div class="role-type">
                    <span class="org-badge" :class="`org-${role.orgType}`">
                      {{ role.orgType }}
                    </span>
                  </div>
                </div>
              </div>

              <div
                v-if="hasUnsavedChanges && selectedRole?.id === role.id"
                class="unsaved-indicator"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>Unsaved changes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MAIN CONTENT ==================== -->
    <div class="main-content">
      <!-- ==================== RIGHT DRAWER (Add Role) ==================== -->
      <transition name="drawer">
        <div v-if="isDrawerVisible" class="right-drawer">
          <div class="drawer-header">
            <div class="drawer-title-section">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3 class="drawer-title">Create New Role</h3>
            </div>
            <button
              @click="hideAddDrawer"
              class="close-btn"
              :disabled="isLoading"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="addRole" class="drawer-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Role Name
                </label>
                <input
                  v-model="newRole.roleName"
                  type="text"
                  required
                  class="form-input"
                  placeholder="Enter role name"
                  :disabled="isLoading"
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M3 21h18" />
                    <path d="M3 10h18" />
                    <path d="M5 6l7-3 7 3" />
                    <path d="M4 10l8 4 8-4" />
                  </svg>
                  Organization Type
                </label>
                <select
                  v-model="newRole.orgType"
                  required
                  class="form-select"
                  :disabled="isLoading"
                >
                  <option value="">Select organization type</option>
                  <option value="tenant">Tenant</option>
                  <option value="distributor">Distributor</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
                Description
              </label>
              <textarea
                v-model="newRole.description"
                rows="3"
                class="form-textarea"
                placeholder="Enter role description"
                :disabled="isLoading"
              ></textarea>
            </div>

            <div class="form-actions">
              <button
                type="button"
                @click="hideAddDrawer"
                class="cancel-btn"
                :disabled="isLoading"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button type="submit" class="submit-btn" :disabled="isLoading">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {{ isLoading ? "Creating..." : "Create Role" }}
              </button>
            </div>
          </form>
        </div>
      </transition>

      <!-- ==================== CONFIG SCREEN ==================== -->
      <div :class="['config-screen', isDrawerVisible ? 'config-shifted' : '']">
        <div v-if="selectedRole" class="config-content">
          <div class="config-header">
            <div class="config-title-section">
              <div class="config-icon">
                <svg
                  v-if="selectedRole.orgType === 'tenant'"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                </svg>
                <svg
                  v-else-if="selectedRole.orgType === 'distributor'"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"
                  />
                  <path d="M15 18H9" />
                  <path
                    d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"
                  />
                  <circle cx="17" cy="18" r="2" />
                  <circle cx="7" cy="18" r="2" />
                </svg>
                <svg
                  v-else
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h2 class="config-title">{{ selectedRole.roleName }}</h2>
                <p class="config-subtitle">
                  <span
                    class="org-badge"
                    :class="`org-${selectedRole.orgType}`"
                  >
                    {{ selectedRole.orgType }}
                  </span>
                  <span class="separator">•</span>
                  {{ selectedRole.description }}
                </p>
              </div>
            </div>

            <div v-if="hasUnsavedChanges" class="unsaved-banner">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span>You have unsaved changes</span>
            </div>
          </div>

          <!-- Actions Section -->
          <div class="section-card">
            <div class="section-header">
              <div class="section-header-content">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="9,11 12,14 22,4" />
                  <path
                    d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                  />
                </svg>
                <h3 class="section-title">Permissions & Actions</h3>
              </div>
            </div>

            <div class="section-content">
              <div class="actions-grid">
                <div
                  v-for="action in actions"
                  :key="action.name"
                  class="action-group"
                >
                  <div class="action-header">
                    <div class="action-icon">
                      <svg
                        v-if="action.key === 'client'"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <svg
                        v-else-if="action.key === 'workorder'"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                        />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                      </svg>
                      <svg
                        v-else
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <rect
                          x="2"
                          y="3"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>
                    <h4 class="action-title">{{ action.name }}</h4>
                  </div>

                  <div class="permissions-list">
                    <label
                      v-for="permission in action.permissions"
                      :key="permission"
                      class="permission-item"
                    >
                      <input
                        v-model="localRole.actions[action.key][permission]"
                        type="checkbox"
                        class="permission-checkbox"
                        @change="markAsModified"
                        :disabled="isLoading"
                      />
                      <div class="permission-content">
                        <svg
                          v-if="permission === 'create'"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        <svg
                          v-else-if="permission === 'update'"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                          />
                        </svg>
                        <svg
                          v-else
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <polyline points="3,6 5,6 21,6" />
                          <path
                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                          />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        <span class="permission-label">{{ permission }}</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Scope Section -->
          <div class="section-card">
            <div class="section-header">
              <div class="section-header-content">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
                <h3 class="section-title">Data Access Scope</h3>
              </div>
            </div>

            <div class="section-content">
              <div class="scope-grid">
                <div
                  v-for="scope in dataScopes"
                  :key="scope.name"
                  class="scope-group"
                >
                  <div class="scope-header">
                    <div class="scope-icon">
                      <svg
                        v-if="scope.key === 'client'"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <svg
                        v-else-if="scope.key === 'workorder'"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                        />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                      </svg>
                      <svg
                        v-else
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <rect
                          x="2"
                          y="3"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>
                    <h4 class="scope-title">{{ scope.name }}</h4>
                  </div>

                  <select
                    v-model="localRole.dataScope[scope.key]"
                    class="scope-select"
                    @change="markAsModified"
                    :disabled="isLoading"
                  >
                    <option value="">Select access scope</option>
                    <option
                      v-for="option in scopeOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Save Configuration -->
          <div class="save-section">
            <button
              @click="discardChanges"
              class="discard-btn"
              :disabled="isLoading || !hasUnsavedChanges"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 6h18l-2 13H5L3 6z" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Discard Changes
            </button>
            <button
              @click="saveConfiguration"
              class="save-btn"
              :disabled="isLoading || !hasUnsavedChanges"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                />
                <polyline points="17,21 17,13 7,13 7,21" />
                <polyline points="7,3 7,8 15,8" />
              </svg>
              {{ isLoading ? "Saving..." : "Save Configuration" }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-content">
            <div class="empty-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 class="empty-title">No role selected</h3>
            <p class="empty-subtitle">
              Select a role from the sidebar or create a new one to configure
              permissions and access scope.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();

export default {
  name: "RoleConfigurator",
  components: {
    ToastContainer,
  },
  data() {
    return {
      isDrawerVisible: false,
      isLoading: false,
      loadingMessage: "",
      selectedRole: null,
      localRole: null,
      hasUnsavedChanges: false,
      newRole: {
        roleName: "",
        orgType: "",
        description: "",
      },
      roles: [],
      actions: [
        {
          name: "Client Management",
          key: "client",
          permissions: ["create", "update", "delete"],
        },
        {
          name: "Work Order",
          key: "workorder",
          permissions: ["create", "update", "delete"],
        },
        {
          name: "Assets",
          key: "assets",
          permissions: ["create", "update", "delete"],
        },
      ],
      dataScopes: [
        { name: "Client Data", key: "client" },
        { name: "Work Order Data", key: "workorder" },
        { name: "Assets Data", key: "assets" },
      ],
      scopeOptions: [
        { value: "assigned-only", label: "Assigned Only" },
        { value: "organization-wide", label: "Organization Wide" },
        { value: "organization-child", label: "Organization + Child" },
        { value: "serviceable-location", label: "Serviceable Location" },
      ],
      apiBaseUrl: `${import.meta.env.VITE_API_URL}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
      apiHeaders: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  },

  mounted() {
    this.fetchRoles();
  },

  methods: {
    // === Toast Helper ===
    showToast(message, type = "info", duration = 5000) {
      this.$refs.toastContainer?.addToast(message, type, duration);
    },

    // === Drawer Controls ===
    showAddDrawer() {
      this.isDrawerVisible = true;
    },
    hideAddDrawer() {
      this.isDrawerVisible = false;
      this.resetForm();
    },

    // === API Methods ===
    async apiRequest(url, options = {}) {
      try {
        const response = await fetch(url, {
          headers: this.apiHeaders,
          ...options,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("API request failed:", error);
        this.showToast("API request failed: " + error.message, "error");
        throw error;
      }
    },

    async fetchRoles() {
      this.isLoading = true;
      this.loadingMessage = "Loading roles...";

      try {
        const response = await this.apiRequest(this.apiBaseUrl);

        if (response.data && Array.isArray(response.data)) {
          this.roles = response.data.map((role) =>
            this.transformApiRoleToLocal(role),
          );
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async createRole(roleData) {
      this.isLoading = true;
      this.loadingMessage = "Creating role...";

      try {
        const payload = this.transformLocalRoleToApi(roleData);
        const response = await this.apiRequest(this.apiBaseUrl, {
          method: "POST",
          body: JSON.stringify({ data: payload }),
        });

        if (response.data) {
          const newRole = this.transformApiRoleToLocal(response.data);
          this.roles.push(newRole);
          return newRole;
        }
      } catch (error) {
        console.error("Failed to create role:", error);
        this.showToast("Failed to create role.", "error");
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateRole(roleId, updateData) {
      this.isLoading = true;
      this.loadingMessage = "Saving configuration...";

      try {
        const response = await this.apiRequest(`${this.apiBaseUrl}/${roleId}`, {
          method: "PATCH",
          body: JSON.stringify({ data: updateData }), // ← WRAP IN { data: ... }
        });

        if (response.data) {
          const updatedRole = this.transformApiRoleToLocal(response.data);
          const index = this.roles.findIndex((r) => r.id === roleId);
          if (index !== -1) {
            this.roles[index] = updatedRole;
          }
          return updatedRole;
        }
      } catch (error) {
        console.error("Failed to update role:", error);
        this.showToast("Failed to save configuration.", "error");
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // === Data Transformation ===
    transformApiRoleToLocal(apiRole) {
      return {
        id: apiRole.id,
        roleName: apiRole.roleName || "",
        orgType: apiRole.orgType || "",
        description: apiRole.description || "",
        actions: {
          client: this.parseActionData(apiRole.actionclient),
          workorder: this.parseActionData(apiRole.actionWo),
          assets: this.parseActionData(apiRole.actionassets),
        },
        dataScope: this.parseDataScope(apiRole.dataScope),
      };
    },

    transformLocalRoleToApi(localRole) {
      return {
        roleName: localRole.roleName,
        orgType: localRole.orgType,
        description: localRole.description,
        actionclient: localRole.actions?.client || {
          create: false,
          update: false,
          delete: false,
        },
        actionWo: localRole.actions?.workorder || {
          create: false,
          update: false,
          delete: false,
        },
        actionassets: localRole.actions?.assets || {
          create: false,
          update: false,
          delete: false,
        },
        dataScope: localRole.dataScope || {
          client: "",
          workorder: "",
          assets: "",
        },
      };
    },

    parseActionData(actionData) {
      if (!actionData) return { create: false, update: false, delete: false };
      if (typeof actionData === "object") {
        return {
          create: actionData.create || false,
          update: actionData.update || false,
          delete: actionData.delete || false,
        };
      }
      try {
        const parsed = JSON.parse(actionData);
        return {
          create: parsed.create || false,
          update: parsed.update || false,
          delete: parsed.delete || false,
        };
      } catch (e) {
        return { create: false, update: false, delete: false };
      }
    },

    parseDataScope(dataScopeData) {
      if (!dataScopeData) return { client: "", workorder: "", assets: "" };
      if (typeof dataScopeData === "object") {
        return {
          client: dataScopeData.client || "",
          workorder: dataScopeData.workorder || "",
          assets: dataScopeData.assets || "",
        };
      }
      try {
        const parsed = JSON.parse(dataScopeData);
        return {
          client: parsed.client || "",
          workorder: parsed.workorder || "",
          assets: parsed.assets || "",
        };
      } catch (e) {
        return { client: "", workorder: "", assets: "" };
      }
    },

    // === UI Methods ===
    resetForm() {
      this.newRole = { roleName: "", orgType: "", description: "" };
    },

    async addRole() {
      try {
        const newRoleData = {
          roleName: this.newRole.roleName,
          orgType: this.newRole.orgType,
          description: this.newRole.description,
          actions: {
            client: { create: false, update: false, delete: false },
            workorder: { create: false, update: false, delete: false },
            assets: { create: false, update: false, delete: false },
          },
          dataScope: { client: "", workorder: "", assets: "" },
        };

        const createdRole = await this.createRole(newRoleData);
        this.selectRole(createdRole);
        this.hideAddDrawer();
        this.showToast("Role created successfully!", "success");
      } catch (error) {
        this.showToast("Failed to create role.", "error");
      }
    },

    selectRole(role) {
      if (this.hasUnsavedChanges) {
        const confirmSwitch = confirm(
          "You have unsaved changes. Do you want to discard them and switch roles?",
        );
        if (!confirmSwitch) return;
      }
      this.selectedRole = role;
      this.localRole = JSON.parse(JSON.stringify(role));
      this.hasUnsavedChanges = false;
    },

    markAsModified() {
      this.hasUnsavedChanges = true;
    },

    discardChanges() {
      if (this.selectedRole) {
        this.localRole = JSON.parse(JSON.stringify(this.selectedRole));
        this.hasUnsavedChanges = false;
      }
    },

    async saveConfiguration() {
      if (!this.selectedRole || !this.localRole) return;

      try {
        const updateData = this.transformLocalRoleToApi(this.localRole);
        const updatedRole = await this.updateRole(
          this.selectedRole.id,
          updateData,
        );

        this.selectedRole = updatedRole;
        this.localRole = JSON.parse(JSON.stringify(updatedRole));
        this.hasUnsavedChanges = false;

        this.showToast("Configuration saved successfully!", "success");
      } catch (error) {
        this.showToast("Failed to save configuration.", "error");
      }
    },
  },
};
</script>

<style scoped>
/* === Global Layout === */
.app-container {
  display: flex;
  height: 100vh;
  background: #f9fafb;
  position: relative;
}

/* === Loading Overlay === */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.loading-text {
  color: white;
  margin-top: 20px;
  font-size: 16px;
  font-weight: 500;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* === Sidebar === */
.sidebar {
  width: 320px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}
.sidebar-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}
.add-role-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059367 100%);
  color: white;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}
.add-role-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}
.add-role-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.roles-section {
  margin-top: 8px;
}
.roles-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 4px;
}
.roles-title {
  font-size: 13px;
  font-weight: 700;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.roles-list {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding-right: 4px;
}

.role-item {
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 10px;
  background: #f3f4f6;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
}
.role-item:hover {
  background: #e5e7eb;
  transform: translateX(2px);
}
.role-item-active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}
.role-item-modified {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.role-item-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.role-icon {
  padding: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  color: #6b7280;
  flex-shrink: 0;
}
.role-details {
  flex: 1;
  min-width: 0;
}
.role-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.role-type {
  margin-bottom: 4px;
}
.org-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.org-tenant {
  background: #dbeafe;
  color: #1e40af;
}
.org-distributor {
  background: #dcfce7;
  color: #166534;
}
.org-client {
  background: #fef3c7;
  color: #92400e;
}
.unsaved-indicator {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #f59e0b;
  margin-top: 8px;
  gap: 6px;
  font-weight: 500;
}

/* === Main Content === */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
}

/* === Right Drawer === */
.right-drawer {
  position: fixed;
  right: 0;
  width: 520px;
  height: 100vh;
  background: white;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow-y: auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0 20px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}
.drawer-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}
.drawer-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

/* Drawer Transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

/* Shift main content when drawer open */
/* .config-shifted {
  margin-right: 420px; */
/* } */

/* === Config Screen === */
.config-screen {
  flex: 1;
  padding: 12px;
  transition: all 0.3s ease;
  overflow-y: auto;
  max-height: 100vh;
}
.config-content {
  margin: 0 auto;
}
.config-header {
  margin-bottom: 32px;
}
.config-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.config-icon {
  padding: 12px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 12px;
  color: #059367;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}
.config-title {
  font-size: 26px;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.5px;
}
.config-subtitle {
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}
.separator {
  color: #d1d5db;
}
.unsaved-banner {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #f59e0b;
  gap: 8px;
}

/* Section Cards */
.section-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
  overflow: hidden;
}
.section-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.section-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.3px;
}
.section-content {
  padding: 28px;
}

/* Actions & Scope Grid */
.actions-grid,
.scope-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
.action-group,
.scope-group {
  background: #f9fafb;
  border-radius: 10px;
  padding: 20px;
  border: 1.5px solid #e5e7eb;
  transition: all 0.2s ease;
}
.action-group:hover,
.scope-group:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.action-header,
.scope-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.action-icon,
.scope-icon {
  padding: 8px;
  background: white;
  border-radius: 8px;
  color: #6b7280;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.action-title,
.scope-title {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  font-size: 15px;
}

/* Permissions */
.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.permission-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}
.permission-item:hover {
  background: rgba(16, 185, 129, 0.08);
}
.permission-checkbox {
  margin-right: 12px;
  width: 20px;
  height: 20px;
  /* accent-color: #10b981; */
  cursor: pointer;
}
.permission-content {
  display: flex;
  align-items: center;
  gap: 8px;
}
.permission-label {
  font-size: 14px;
  color: #374151;
  text-transform: capitalize;
  font-weight: 500;
}

/* Scope Select */
.scope-select {
  padding: 11px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;
  width: 100%;
  cursor: pointer;
}
.scope-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Save Section */
.save-section {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}
.discard-btn,
.save-btn {
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.discard-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 1.5px solid #e5e7eb;
}
.discard-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
  transform: translateY(-1px);
}
.save-btn {
  background: linear-gradient(135deg, #10b981 0%, #059367 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}
.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}
.discard-btn:disabled,
.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}
.empty-content {
  text-align: center;
  max-width: 400px;
}
.empty-icon {
  margin-bottom: 24px;
  color: #d1d5db;
}
.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}
.empty-subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

/* Form Elements (shared) */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.form-input,
.form-select,
.form-textarea {
  padding: 11px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
.form-textarea {
  resize: vertical;
  min-height: 90px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
.cancel-btn,
.submit-btn {
  padding: 11px 22px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 1.5px solid #e5e7eb;
}
.cancel-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}
.submit-btn {
  background: linear-gradient(135deg, #10b981 0%, #059367 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}
.close-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

/* === Responsive === */
@media (max-width: 1024px) {
  .sidebar {
    width: 280px;
  }
  .actions-grid,
  .scope-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 40vh;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .config-screen {
    padding: 20px;
  }
  .section-content {
    padding: 20px;
  }
  .save-section {
    flex-direction: column;
  }
  .right-drawer {
    width: 100%;
  }
}
</style>

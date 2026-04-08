<template>
  <div class="connector">

    <main class="dashboard-main">
      <div class="content-wrapper">
        <!-- Page Title -->

        <!-- System Selection -->
        <section class="section">
          <h3 class="section-title">Select CRM System</h3>
          <div class="system-selector">
            <div
              class="system-option"
              :class="{ active: selectedSystem === 'zoho' }"
              @click="setSystem('zoho')"
              
            >
              <div class="system-icon zoho">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                  />
                </svg>
              </div>
              <div class="system-info">
                <h4>Zoho CRM</h4>
                <p>Sync with Zoho CRM platform</p>
              </div>
            </div>

            <div
              class="system-option"
              :class="{ active: selectedSystem === 'erpnext' }"
              @click="setSystem('erpnext')"
            >
              <div class="system-icon erpnext">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M9 9h6v6H9z" />
                </svg>
              </div>
              <div class="system-info">
                <h4>ERP Next</h4>
                <p>Sync with ERP Next system</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ERP Next Configuration -->
        <section v-if="selectedSystem === 'erpnext'" class="section">
          <div class="section-header">
            <h3 class="section-title">ERP Next Configuration</h3>
            <div
              class="config-status"
              :class="erpNextConfig.isConfigured ? 'configured' : 'pending'"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path v-if="erpNextConfig.isConfigured" d="M9 12l2 2 4-4" />
                <circle v-else cx="12" cy="12" r="10" />
                <path v-if="!erpNextConfig.isConfigured" d="M12 6v6l4 2" />
              </svg>
              {{ erpNextConfig.isConfigured ? "Configured" : "Setup Required" }}
            </div>
          </div>

          <div class="config-notice">
            <div class="notice-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div class="notice-content">
              <h4>Configuration Required</h4>
              <p>
                Please provide your ERP Next credentials. API Key and Secret
                will be generated after login.
              </p>
            </div>
          </div>

          <div class="config-form">
            <div class="config-section">
              <h4 class="config-section-title">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                Server Configuration
              </h4>

              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">Site URL *</label>
                  <input
                    v-model="erpNextConfig.siteUrl"
                    type="url"
                    class="field-input"
                    placeholder="https://your-site.erpnext.com"
                    @blur="validateUrl"
                  />
                  <span v-if="erpNextConfig.errors.siteUrl" class="field-error">
                    {{ erpNextConfig.errors.siteUrl }}
                  </span>
                </div>
              </div>
            </div>

            <div class="config-section">
              <h4 class="config-section-title">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                API Credentials
                <span class="optional-badge">Optional</span>
              </h4>
              <p class="config-section-description">
                API credentials will be generated after successful login. You
                can also provide them manually because this will sync the data
                fast and reliable.
              </p>

              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">API Key</label>
                  <input
                    v-model="erpNextConfig.apiKey"
                    type="text"
                    class="field-input"
                    placeholder="Generated after login or enter manually"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">API Secret</label>
                  <div class="password-input-group">
                    <input
                      v-model="erpNextConfig.apiSecret"
                      :type="showApiSecret ? 'text' : 'password'"
                      class="field-input"
                      placeholder="Generated after login or enter manually"
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      @click="toggleApiSecretVisibility"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          v-if="showApiSecret"
                          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                        />
                        <path v-if="showApiSecret" d="M1 1l22 22" />
                        <path
                          v-else
                          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        />
                        <circle v-if="!showApiSecret" cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="config-actions">
              <button
                type="button"
                class="action-btn secondary"
                @click="clearErpNextConfig"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                Clear Configuration
              </button>

              <button
                type="button"
                class="action-btn primary"
                @click="testErpNextConnection"
                :disabled="isTestingConnection || !isErpNextConfigValid"
              >
                <div v-if="isTestingConnection" class="spinner"></div>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
                {{
                  isTestingConnection
                    ? "Testing Connection..."
                    : "Test Connection"
                }}
              </button>

              <button
                type="button"
                class="action-btn success"
                @click="saveErpNextConfig"
              >
                <svg
                  width="16"
                  height="16"
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
                Save Configuration
              </button>
            </div>
          </div>
        </section>

        <!-- Sync Configuration -->
        <section class="section">
          <div class="section-header">
            <h3 class="section-title">Sync Configuration</h3>
            <div class="sync-mode-toggle">
              <button
                class="mode-btn"
                :class="{ active: syncMode === 'manual' }"
                @click="setSyncMode('manual')"
              >
                Manual
              </button>
              <button
                class="mode-btn"
                :class="{ active: syncMode === 'auto' }"
                @click="setSyncMode('auto')"
              >
                Automatic
              </button>
            </div>
          </div>

          <!-- Manual Sync Content -->
          <div v-if="syncMode === 'manual'" class="sync-content">
            <div class="sync-actions-bar">
              <button
                class="action-btn primary"
                @click="fetchCustomerData"
                :disabled="isLoading"
              >
                <div v-if="isLoading" class="spinner"></div>
                <svg
                  v-else
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {{ isLoading ? "Fetching..." : "Fetch Customer Data" }}
              </button>

              <div
                v-if="
                  selectedSystem === 'erpnext' && !erpNextConfig.isConfigured
                "
                class="config-warning"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                ERP Next configuration required before fetching data
              </div>
            </div>

            <!-- Field Mapping -->
            <div v-if="showFieldMapping" class="field-mapping-section">
              <h4 class="subsection-title">Field Mapping</h4>
              <p class="subsection-subtitle">
                Configure how your data maps to
                {{ selectedSystem === "zoho" ? "Zoho CRM" : "ERP Next" }}
              </p>

              <div class="mapping-container">
                <div
                  v-for="(mapping, index) in fieldMappings"
                  :key="index"
                  class="mapping-item"
                >
                  <div class="source-field">
                    <label>{{ mapping.sourceLabel }}</label>
                    <div class="field-preview">{{ mapping.sourceField }}</div>
                  </div>
                  <div class="mapping-connector">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12,5 19,12 12,19" />
                    </svg>
                  </div>
                  <div class="target-field">
                    <select v-model="mapping.targetField" class="field-select">
                      <option value="">
                        Select
                        {{
                          selectedSystem === "zoho" ? "Zoho" : "ERP Next"
                        }}
                        Field
                      </option>
                      <option
                        v-for="field in getTargetFields()"
                        :key="field.value"
                        :value="field.value"
                      >
                        {{ field.label }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer Form -->
            <div class="customer-form-section">
              <h4 class="subsection-title">Customer Information</h4>

              <!-- Customer Selection -->
              <div v-if="customerData.length > 0" class="customer-selector">
                <select
                  v-model="selectedCustomerId"
                  @change="populateCustomerData"
                  class="customer-select"
                >
                  <option value="">Create New Customer</option>
                  <option
                    v-for="customer in customerData"
                    :key="customer.id"
                    :value="customer.id"
                  >
                    {{ customer.customerName }} -
                    {{ customer.company || "No Company" }}
                  </option>
                </select>
              </div>

              <!-- Form Grid -->
              <div class="form-container">
                <div class="form-grid">
                  <div class="form-field">
                    <label class="field-label">Customer Name *</label>
                    <input
                      v-model="currentCustomer.customerName"
                      type="text"
                      class="field-input"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div class="form-field">
                    <label class="field-label">Email *</label>
                    <input
                      v-model="currentCustomer.email"
                      type="email"
                      class="field-input"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div class="form-field">
                    <label class="field-label">Phone</label>
                    <input
                      v-model="currentCustomer.phone"
                      type="tel"
                      class="field-input"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div class="form-field">
                    <label class="field-label">Company</label>
                    <input
                      v-model="currentCustomer.company"
                      type="text"
                      class="field-input"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div class="form-field">
                    <label class="field-label">Location</label>
                    <div class="input-group">
                      <input
                        v-model="currentCustomer.location"
                        type="text"
                        class="field-input"
                        placeholder="Enter location"
                      />
                      <button
                        type="button"
                        class="input-addon-btn"
                        @click="showLocationMap(currentCustomer.location)"
                        :disabled="!currentCustomer.location"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                          />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="form-field">
                    <label class="field-label">GST Number</label>
                    <input
                      v-model="currentCustomer.gstNumber"
                      type="text"
                      class="field-input"
                      placeholder="Enter GST number"
                    />
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                  <button
                    type="button"
                    class="action-btn secondary"
                    @click="clearForm"
                  >
                    Clear Form
                  </button>
                  <button
                    type="button"
                    class="action-btn success"
                    @click="syncCurrentCustomer"
                    :disabled="
                      !isFormValid ||
                      isSyncing ||
                      (selectedSystem === 'erpnext' &&
                        !erpNextConfig.isConfigured)
                    "
                  >
                    <div v-if="isSyncing" class="spinner"></div>
                    <svg
                      v-else
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.07 2.38"
                      />
                      <path d="M21 4v4h-4" />
                    </svg>
                    {{
                      isSyncing
                        ? "Syncing..."
                        : `Sync to ${selectedSystem === "zoho" ? "Zoho CRM" : "ERP Next"}`
                    }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Bulk Operations -->
            <div v-if="customerData.length > 0" class="bulk-operations">
              <div class="bulk-header">
                <h4 class="subsection-title">Bulk Operations</h4>
                <span class="customer-count"
                  >{{ customerData.length }} customers available</span
                >
              </div>
              <button
                class="action-btn danger"
                @click="syncAllCustomers"
                :disabled="
                  isSyncing ||
                  (selectedSystem === 'erpnext' && !erpNextConfig.isConfigured)
                "
              >
                <div v-if="isSyncing" class="spinner"></div>
                <svg
                  v-else
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.07 2.38"
                  />
                  <path d="M21 4v4h-4" />
                </svg>
                {{
                  isSyncing
                    ? "Syncing All..."
                    : `Sync All to ${selectedSystem === "zoho" ? "Zoho CRM" : "ERP Next"}`
                }}
              </button>
            </div>
          </div>

          <!-- Auto Sync Content -->
          <div v-if="syncMode === 'auto'" class="sync-content">
            <div class="auto-sync-container">
              <div class="auto-sync-header">
                <div class="auto-sync-info">
                  <h4>Automatic Synchronization</h4>
                  <p>Enable scheduled background sync at regular intervals</p>
                </div>
                <div
                  class="toggle-switch"
                  :class="{ active: autoSyncEnabled }"
                  @click="toggleAutoSync"
                >
                  <div class="toggle-slider"></div>
                </div>
              </div>

              <div v-if="autoSyncEnabled" class="auto-sync-settings">
                <div class="setting-item">
                  <label class="setting-label">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    Sync Interval
                  </label>
                  <select v-model="syncInterval" class="setting-select">
                    <option value="1h">Every hour</option>
                    <option value="3h">Every 3 hours</option>
                    <option value="6h">Every 6 hours</option>
                    <option value="24h">Daily</option>
                  </select>
                </div>
              </div>

              <div v-else class="auto-sync-disabled">
                <div class="disabled-state">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  <h4>Auto Sync Disabled</h4>
                  <p>
                    Enable the toggle above to configure automatic
                    synchronization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Location Modal -->
    <div v-if="showMapModal" class="modal-overlay" @click="closeMapModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Location Preview</h3>
          <button class="modal-close" @click="closeMapModal">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="location-preview">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h4>{{ selectedLocation }}</h4>
            <p>Map integration would be implemented here</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast-container">
        <div class="toast-content" :class="toastType">
          <div class="toast-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path v-if="toastType === 'success'" d="M9 12l2 2 4-4" />
              <path v-if="toastType === 'error'" d="M18 6L6 18M6 6l12 12" />
              <path v-if="toastType === 'info'" d="M12 16v-4M12 8h.01" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <span class="toast-message">{{ toastMessage }}</span>
          <button class="toast-close" @click="hideToast">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

// State Management
const selectedSystem = ref("zoho");
const syncMode = ref("manual");
const autoSyncEnabled = ref(false);
const syncInterval = ref("3h");
const isLoading = ref(false);
const isSyncing = ref(false);
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success");
const connectionStatus = ref("connected");
const showFieldMapping = ref(false);
const showMapModal = ref(false);
const selectedLocation = ref("");
const selectedCustomerId = ref("");
const showPassword = ref(false);
const showApiSecret = ref(false);
const isTestingConnection = ref(false);
const isSavingConfig = ref(false);
// upcoming feature
const showFeaturePopup = ref(false);
const featureMessage = ref("");


// ERP Next Configuration
const erpNextConfig = ref({
  siteUrl: "",
  email: "",
  password: "",
  apiKey: "",
  apiSecret: "",
  isConfigured: false,
  errors: {
    siteUrl: "",
    email: "",
    password: "",
  },
});

// Data
const customerData = ref([]);
const currentCustomer = ref({
  id: null,
  customerName: "",
  phone: "",
  email: "",
  company: "",
  location: "",
  gstNumber: "",
  selectedTenant: "",
  tenantName: "",
});

const fieldMappings = ref([
  {
    sourceField: "customerName",
    sourceLabel: "Customer Name",
    targetField: "",
  },
  { sourceField: "phone", sourceLabel: "Phone", targetField: "" },
  { sourceField: "email", sourceLabel: "Email", targetField: "" },
  { sourceField: "company", sourceLabel: "Company", targetField: "" },
  { sourceField: "location", sourceLabel: "Location", targetField: "" },
  { sourceField: "gstNumber", sourceLabel: "GST Number", targetField: "" },
  {
    sourceField: "tenant.tenantName",
    sourceLabel: "Tenant Name",
    targetField: "",
  },
]);

// System-specific field options
const zohoFields = ref([
  { value: "Account_Name", label: "Account Name" },
  { value: "Phone", label: "Phone" },
  { value: "Email", label: "Email" },
  { value: "Billing_Street", label: "Billing Street" },
  { value: "Tax_Number", label: "Tax Number" },
  { value: "Owner", label: "Owner" },
  { value: "Website", label: "Website" },
  { value: "Industry", label: "Industry" },
]);

const erpNextFields = ref([
  { value: "customer_name", label: "Customer Name" },
  { value: "mobile_no", label: "Mobile Number" },
  { value: "email_id", label: "Email ID" },
  { value: "customer_group", label: "Customer Group" },
  { value: "territory", label: "Territory" },
  { value: "tax_id", label: "Tax ID" },
  { value: "website", label: "Website" },
  { value: "industry", label: "Industry" },
]);

const availableTenants = ref([]);

// Auth setup
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const HEADERS = {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
};

// Computed Properties
const isFormValid = computed(() => {
  return (
    currentCustomer.value.customerName.trim() !== "" &&
    currentCustomer.value.email.trim() !== ""
  );
});

const isErpNextConfigValid = computed(() => {
  return erpNextConfig.value.siteUrl.trim() !== "";
});

// Methods
const setSystem = (system) => {
  selectedSystem.value = system;
  showToastMessage(
    `Switched to ${system === "zoho" ? "Zoho CRM" : "ERP Next"}`,
    "info",
  );

  // Reset field mappings when switching systems
  if (system === "zoho") {
    fieldMappings.value[0].targetField = "Account_Name";
    fieldMappings.value[1].targetField = "Phone";
    fieldMappings.value[2].targetField = "Email";
  } else {
    fieldMappings.value[0].targetField = "customer_name";
    fieldMappings.value[1].targetField = "mobile_no";
    fieldMappings.value[2].targetField = "email_id";
  }
};

const setSyncMode = (mode) => {
  syncMode.value = mode;
};

const getTargetFields = () => {
  return selectedSystem.value === "zoho"
    ? zohoFields.value
    : erpNextFields.value;
};

const toggleAutoSync = () => {
  autoSyncEnabled.value = !autoSyncEnabled.value;
  const message = autoSyncEnabled.value
    ? "Auto sync enabled"
    : "Auto sync disabled";
  showToastMessage(message, "info");
};

// ERP Next Configuration Methods
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleApiSecretVisibility = () => {
  showApiSecret.value = !showApiSecret.value;
};

const validateUrl = () => {
  const url = erpNextConfig.value.siteUrl.trim();
  if (!url) {
    erpNextConfig.value.errors.siteUrl = "Site URL is required";
    return false;
  }

  try {
    new URL(url);
    erpNextConfig.value.errors.siteUrl = "";
    return true;
  } catch {
    erpNextConfig.value.errors.siteUrl = "Please enter a valid URL";
    return false;
  }
};

const testErpNextConnection = async () => {
  if (!erpNextConfig.value.siteUrl) {
    showToastMessage("Please enter the site URL", "error");
    return;
  }

  isTestingConnection.value = true;
  try {
    // Simple ping to verify the URL is accessible
    const response = await fetch(
      `${erpNextConfig.value.siteUrl}/api/method/ping`,
    );

    if (response.ok) {
      showToastMessage("Connection test successful!", "success");
      connectionStatus.value = "connected";
    } else {
      throw new Error("Site not reachable");
    }
  } catch (error) {
    showToastMessage(
      "Connection test failed. Please check the site URL",
      "error",
    );
    connectionStatus.value = "disconnected";
  } finally {
    isTestingConnection.value = false;
  }
};

const saveErpNextConfig = async () => {
  if (!isErpNextConfigValid.value) {
    showToastMessage("Please fill in all required fields correctly", "error");
    return;
  }

  isSavingConfig.value = true;

  try {
    // First, save the configuration to your backend
    const configData = {
      syncType: "erpnext",
      credentials: {
        siteUrl: erpNextConfig.value.siteUrl,
      },
      status: "active",
      tenant: tenantId,
      tokens: {
        apiKey: erpNextConfig.value.apiKey,
        apiSecret: erpNextConfig.value.apiSecret,
      },
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/connectors`,
      {
        method: "POST",
        headers: HEADERS.headers,
        body: JSON.stringify(configData),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to save configuration to backend");
    }

    // Update local state
    erpNextConfig.value.isConfigured = true;

    // Save to localStorage for persistence
    localStorage.setItem(
      "erpNextConfig",
      JSON.stringify({
        siteUrl: erpNextConfig.value.siteUrl,
        apiKey: erpNextConfig.value.apiKey,
        apiSecret: erpNextConfig.value.apiSecret,
        isConfigured: true,
      }),
    );

    showToastMessage("ERP Next configuration saved successfully!", "success");
  } catch (error) {
    console.error("Error saving ERP Next configuration:", error);
    showToastMessage(`Failed to save configuration: ${error.message}`, "error");
  } finally {
    isSavingConfig.value = false;
  }
};

const clearErpNextConfig = () => {
  erpNextConfig.value = {
    siteUrl: "",
    email: "",
    password: "",
    apiKey: "",
    apiSecret: "",
    isConfigured: false,
    errors: {
      siteUrl: "",
      email: "",
      password: "",
    },
  };

  localStorage.removeItem("erpNextConfig");
  showToastMessage("ERP Next configuration cleared", "info");
};

const loadErpNextConfig = () => {
  const saved = localStorage.getItem("erpNextConfig");
  if (saved) {
    const config = JSON.parse(saved);
    erpNextConfig.value = {
      ...erpNextConfig.value,
      ...config,
      password: "", // Don't restore password for security
      errors: {
        siteUrl: "",
        email: "",
        password: "",
      },
    };
  }
};

const fetchCustomerData = async () => {
  if (selectedSystem.value === "erpnext" && !erpNextConfig.value.isConfigured) {
    showToastMessage("Please configure ERP Next connection first", "error");
    return;
  }

  isLoading.value = true;
  showFieldMapping.value = true;

  try {
    let response;

    if (selectedSystem.value === "erpnext") {
      // Fetch from ERP Next
      const erpNextUrl = `${erpNextConfig.value.siteUrl}/api/resource/Customer`;
      response = await fetch(erpNextUrl, {
        headers: {
          Authorization: `token ${erpNextConfig.value.apiKey}:${erpNextConfig.value.apiSecret}`,
          "Content-Type": "application/json",
        },
      });
    } else {
      // Fetch from your existing API for Zoho
      response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/customers?fields[]=customerName&fields[]=phone&fields[]=email&fields[]=company&fields[]=location&fields[]=gstNumber&fields[]=tenant.tenantName`,
        HEADERS,
      );
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    let processedData = [];

    if (selectedSystem.value === "erpnext") {
      // Process ERP Next data format
      if (result.data && Array.isArray(result.data)) {
        processedData = result.data.map((customer, index) => ({
          id: customer.name || index + 1,
          customerName: customer.customer_name || "",
          phone: customer.mobile_no || "",
          email: customer.email_id || "",
          company: customer.customer_group || "",
          location: customer.territory || "",
          gstNumber: customer.tax_id || "",
          tenantName: customer.customer_type || "",
          selectedTenant: "",
        }));
      }
    } else {
      // Process existing API data format
      if (result.data && Array.isArray(result.data)) {
        processedData = result.data.map((customer, index) => ({
          id: customer.id || index + 1,
          customerName: customer.customerName || "",
          phone: customer.phone || "",
          email: customer.email || "",
          company: customer.company || "",
          location: customer.location || "",
          gstNumber: customer.gstNumber || "",
          tenantName: customer.tenant?.tenantName || "",
          selectedTenant: "",
        }));
      }
    }

    customerData.value = processedData;

    // Extract unique tenants
    const tenants = new Set();
    processedData.forEach((customer) => {
      if (customer.tenantName) {
        tenants.add(customer.tenantName);
      }
    });

    availableTenants.value = Array.from(tenants).map((name, index) => ({
      id: index + 1,
      name: name,
    }));

    showToastMessage(
      `Fetched ${customerData.value.length} customer records successfully from ${selectedSystem.value === "zoho" ? "Zoho CRM" : "ERP Next"}!`,
      "success",
    );
  } catch (error) {
    console.error("API Error:", error);
    showToastMessage(
      `Failed to fetch customer data: ${error.message}`,
      "error",
    );
    connectionStatus.value = "disconnected";
  } finally {
    isLoading.value = false;
  }
};

const syncToSystem = async (customerPayload) => {
  try {
    const mappedData = {};

    fieldMappings.value.forEach((mapping) => {
      if (mapping.targetField) {
        const sourceValue = getNestedValue(
          customerPayload,
          mapping.sourceField,
        );
        if (sourceValue) {
          mappedData[mapping.targetField] = sourceValue;
        }
      }
    });

    console.log(`Syncing to ${selectedSystem.value}:`, mappedData);

    let response;
    if (selectedSystem.value === "erpnext") {
      // Sync to ERP Next
      const erpNextUrl = `${erpNextConfig.value.siteUrl}/api/resource/Customer`;
      response = await fetch(erpNextUrl, {
        method: "POST",
        headers: {
          Authorization: `token ${erpNextConfig.value.apiKey}:${erpNextConfig.value.apiSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mappedData),
      });
    } else {
      // Sync to Zoho
      const endpoint = "/api/zoho-crm/sync";
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mappedData),
      });
    }

    if (!response.ok) {
      throw new Error(
        `${selectedSystem.value} sync failed: ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`${selectedSystem.value} Sync Error:`, error);
    throw error;
  }
};

const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

const populateCustomerData = () => {
  if (selectedCustomerId.value) {
    const selectedCustomer = customerData.value.find(
      (c) => c.id === selectedCustomerId.value,
    );
    if (selectedCustomer) {
      currentCustomer.value = { ...selectedCustomer };
      showToastMessage("Customer data populated successfully!", "success");
    }
  } else {
    clearForm();
  }
};

const clearForm = () => {
  currentCustomer.value = {
    id: null,
    customerName: "",
    phone: "",
    email: "",
    company: "",
    location: "",
    gstNumber: "",
    selectedTenant: "",
    tenantName: "",
  };
  selectedCustomerId.value = "";
  showToastMessage("Form cleared", "info");
};

const syncCurrentCustomer = async () => {
  if (!isFormValid.value) {
    showToastMessage(
      "Please fill in required fields (Customer Name and Email)",
      "error",
    );
    return;
  }

  if (selectedSystem.value === "erpnext" && !erpNextConfig.value.isConfigured) {
    showToastMessage("Please configure ERP Next connection first", "error");
    return;
  }

  isSyncing.value = true;

  try {
    await syncToSystem(currentCustomer.value);
    const systemName =
      selectedSystem.value === "zoho" ? "Zoho CRM" : "ERP Next";
    showToastMessage(
      `${currentCustomer.value.customerName} synced to ${systemName} successfully!`,
      "success",
    );

    if (!currentCustomer.value.id) {
      const newCustomer = {
        ...currentCustomer.value,
        id: Date.now(),
      };
      customerData.value.push(newCustomer);
    }
  } catch (error) {
    showToastMessage(
      `Failed to sync ${currentCustomer.value.customerName}: ${error.message}`,
      "error",
    );
  } finally {
    isSyncing.value = false;
  }
};

const syncAllCustomers = async () => {
  if (customerData.value.length === 0) {
    showToastMessage("No customers to sync", "error");
    return;
  }

  if (selectedSystem.value === "erpnext" && !erpNextConfig.value.isConfigured) {
    showToastMessage("Please configure ERP Next connection first", "error");
    return;
  }

  isSyncing.value = true;
  let successCount = 0;
  let errorCount = 0;

  try {
    for (const customer of customerData.value) {
      try {
        await syncToSystem(customer);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to sync ${customer.customerName}:`, error);
      }
    }

    const systemName =
      selectedSystem.value === "zoho" ? "Zoho CRM" : "ERP Next";
    if (errorCount === 0) {
      showToastMessage(
        `All ${successCount} customers synced to ${systemName} successfully!`,
        "success",
      );
    } else {
      showToastMessage(
        `${successCount} customers synced successfully, ${errorCount} failed`,
        "error",
      );
    }
  } catch (error) {
    showToastMessage("Bulk sync operation failed", "error");
  } finally {
    isSyncing.value = false;
  }
};

const showLocationMap = (location) => {
  if (location && location.trim()) {
    selectedLocation.value = location;
    showMapModal.value = true;
  } else {
    showToastMessage("Please enter a location first", "error");
  }
};

const closeMapModal = () => {
  showMapModal.value = false;
  selectedLocation.value = "";
};

const showToastMessage = (message, type = "success") => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 4000);
};

const hideToast = () => {
  showToast.value = false;
};

onMounted(() => {

  // loadErpNextConfig();
    featureMessage.value = "This CRM connector is coming soon!";
  showFeaturePopup.value = true;
const closeFeaturePopup = () => {
  showFeaturePopup.value = false;
};
 
  // if (selectedSystem.value === "zoho") {
  //   fieldMappings.value[0].targetField = "Account_Name";
  //   fieldMappings.value[1].targetField = "Phone";
  //   fieldMappings.value[2].targetField = "Email";
  // } else {
  //   fieldMappings.value[0].targetField = "customer_name";
  //   fieldMappings.value[1].targetField = "mobile_no";
  //   fieldMappings.value[2].targetField = "email_id";
  // }
});
</script>

<style scoped>
/* upcoming feature style */
.blur-background {
  backdrop-filter: blur(5px);
  background: rgba(0, 0, 0, 0.3);
}

.feature-popup {
  max-width: 400px;
  text-align: center;
}

.feature-content {
  padding: 2rem;
}

.feature-content h4 {
  font-size: 1.25rem;
  margin: 1rem 0 0.5rem;
  color: #1a202c;
}

.feature-content p {
  color: #64748b;
  margin: 0;
}
/* Base Styles */
.connector {
  min-height: 100vh;
  background: #f8fafc;
}

/* Header */
.dashboard-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.connection-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.connection-badge.connected {
  background: #dcfce7;
  color: #166534;
}

.connection-badge.disconnected {
  background: #fef2f2;
  color: #dc2626;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

/* Main Content */
.dashboard-main {
  max-width: 2800px;
}

.content-wrapper {
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.page-description {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

/* Sections */
.section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.subsection-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1.5rem 0;
}

/* System Selector */
.system-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.system-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.system-option:hover {
  border-color: #cbd5e0;
}

.system-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.system-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.system-icon.zoho {
  background: #3b82f6;
}

.system-icon.erpnext {
  background: #10b981;
}

.system-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.system-info p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Configuration Status */
.config-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.config-status.configured {
  background: #dcfce7;
  color: #166534;
}

.config-status.pending {
  background: #fef3c7;
  color: #92400e;
}

/* Configuration Notice */
.config-notice {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.notice-icon {
  color: #3b82f6;
  flex-shrink: 0;
}

.notice-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 0.25rem 0;
}

.notice-content p {
  font-size: 0.875rem;
  color: #1e40af;
  margin: 0;
}

/* Configuration Form */
.config-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.config-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.config-section-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.optional-badge {
  font-size: 0.625rem;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

/* Form Elements */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

.password-input-group {
  position: relative;
}

.password-input-group .field-input {
  padding-right: 2.5rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
}

.password-toggle:hover {
  color: #374151;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.input-group .field-input {
  flex: 1;
}

.input-addon-btn {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  color: #3b82f6;
  transition: all 0.2s ease;
}

.input-addon-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #3b82f6;
}

.input-addon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sync Mode Toggle */
.sync-mode-toggle {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
}

.mode-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: #64748b;
}

.mode-btn.active {
  background: white;
  color: #1a202c;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Action Buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

.action-btn.secondary {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #f1f5f9;
}

.action-btn.success {
  background: #10b981;
  color: white;
}

.action-btn.success:hover:not(:disabled) {
  background: #059669;
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn.danger:hover:not(:disabled) {
  background: #dc2626;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

/* Sync Content */
.sync-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sync-actions-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.config-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #92400e;
}

/* Field Mapping */
.field-mapping-section {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.mapping-container {
  display: grid;
  gap: 1rem;
}

.mapping-item {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.source-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.source-field label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.field-preview {
  font-size: 0.875rem;
  color: #1a202c;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.mapping-connector {
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.field-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  width: 100%;
  cursor: pointer;
}

.field-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Customer Form */
.customer-form-section {
  margin-bottom: 2rem;
}

.customer-selector {
  margin-bottom: 1.5rem;
}

.customer-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
}

.customer-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-container {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

/* Bulk Operations */
.bulk-operations {
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.bulk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.customer-count {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 16px;
}

/* Auto Sync */
.auto-sync-container {
  padding: 1rem;
}

.auto-sync-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.auto-sync-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.auto-sync-info p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.toggle-switch {
  width: 48px;
  height: 24px;
  background: #cbd5e0;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: #3b82f6;
}

.toggle-slider {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(24px);
}

.auto-sync-settings {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.setting-item {
  display: grid;
  gap: 0.75rem;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.setting-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
}

.auto-sync-disabled {
  text-align: center;
  padding: 2rem;
}

.disabled-state {
  color: #9ca3af;
}

.disabled-state h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  margin: 1rem 0 0.5rem 0;
}

.disabled-state p {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  color: #64748b;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f8fafc;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.location-preview {
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 8px;
  color: #64748b;
}

.location-preview h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 1rem 0 0.5rem 0;
}

.location-preview p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Toast */
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  max-width: 400px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.toast-content.success {
  border-left: 4px solid #10b981;
}

.toast-content.error {
  border-left: 4px solid #ef4444;
}

.toast-content.info {
  border-left: 4px solid #3b82f6;
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-content.success .toast-icon {
  color: #10b981;
}

.toast-content.error .toast-icon {
  color: #ef4444;
}

.toast-content.info .toast-icon {
  color: #3b82f6;
}

.toast-message {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.toast-close {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toast-close:hover {
  color: #6b7280;
  background: #f9fafb;
}

/* Animations */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 1rem;
  }

  .header-container {
    padding: 0 1rem;
  }

  .brand-title {
    font-size: 1.25rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .system-selector {
    grid-template-columns: 1fr;
  }

  .mapping-item {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .mapping-connector {
    transform: rotate(90deg);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions,
  .config-actions {
    flex-direction: column;
  }

  .bulk-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }

  .auto-sync-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .sync-actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .section {
    padding: 1rem;
  }

  .sync-mode-toggle {
    width: 100%;
  }

  .mode-btn {
    flex: 1;
  }
}
</style>

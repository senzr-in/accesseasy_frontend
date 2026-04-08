<template>
  <div class="tasks-container">
    <div class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-input">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search Assets..."
                @input="debouncedSearch"
              />
              <button
                v-if="searchQuery"
                class="clear-button"
                @click="clearSearch"
              >
                <svg
                  width="14"
                  height="14"
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
          <!-- Header Actions -->
          <div class="header-actions">
            <!-- Stats -->
            <div class="stats-container">
              <div class="stat-item">
                <span class="stat-number">{{ totalItems }}</span>
                <span class="stat-label">Total</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ assignedDevicesCount }}</span>
                <span class="stat-label">Assigned</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ unassignedDevicesCount }}</span>
                <span class="stat-label">Unassigned</span>
              </div>
            </div>
            <!-- Add Asset Type Button -->
            <div class="add-product-container">
              <button class="btn-primary" @click="toggleAddProductMenu">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Asset Type
              </button>
              <div v-if="showAddProductMenu" class="dropdown-menu">
                <button
                  class="dropdown-item"
                  @click="navigateToAddProduct('manual')"
                >
                  Manual Entry
                </button>
                <button
                  class="dropdown-item"
                  @click="navigateToAddProduct('bulk')"
                >
                  Bulk Upload
                </button>
              </div>
            </div>
            <!-- Add Asset Button -->
            <div class="add-product-container">
              <button class="btn-primary" @click="toggleAddAssetMenu">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Asset
              </button>
              <div v-if="showAddAssetMenu" class="dropdown-menu">
                <button class="dropdown-item" @click="showProductSidebar">
                  Manual Entry
                </button>
                <button
                  class="dropdown-item"
                  @click="navigateToAddAsset('bulk')"
                >
                  Bulk Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content-area">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading Assets...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="allDevices.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3>No devices found</h3>
          <p>Please add an asset type first to create assets.</p>
          <button class="btn-primary" @click="toggleAddProductMenu">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Asset Type
          </button>
        </div>

        <!-- Assets List -->
        <div v-else class="tasks-list">
          <!-- List Header -->
          <div class="list-header">
            <div class="header-cell checkbox-col">
              <input
                type="checkbox"
                class="custom-checkbox"
                :checked="
                  selected.length === allDevices.length && allDevices.length > 0
                "
                :indeterminate="
                  selected.length > 0 && selected.length < allDevices.length
                "
                @change="toggleAll"
              />
            </div>
            <div
              class="header-cell asset-col"
              @click="requestSort('serialNumber')"
            >
              Asset
              <span class="sort-icon" v-if="sortBy === 'serialNumber'">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            <div
              class="header-cell type-col"
              @click="requestSort('productName')"
            >
              Type
              <span class="sort-icon" v-if="sortBy === 'productName'">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            <div class="header-cell status-col" @click="requestSort('status')">
              Status
              <span class="sort-icon" v-if="sortBy === 'status'">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            <div class="header-cell date-col" @click="requestSort('createdAt')">
              Added
              <span class="sort-icon" v-if="sortBy === 'createdAt'">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            <div class="header-cell actions-col">Actions</div>
          </div>

          <!-- List Items -->
          <div
            v-for="device in allDevices"
            :key="device.serialNumber"
            class="list-item"
            :class="{ 'selected-row': selected.includes(device.serialNumber) }"
            @click="navigateToDeviceDetail(device)"
          >
            <div class="item-row">
              <!-- Checkbox Column -->
              <div class="list-cell checkbox-col" @click.stop>
                <input
                  type="checkbox"
                  class="custom-checkbox"
                  :checked="selected.includes(device.serialNumber)"
                  @change="toggleSelection(device.serialNumber)"
                />
              </div>
              <!-- Asset Column -->
              <div class="list-cell asset-col">
                <div class="asset-info">
                  <div class="asset-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                      <path d="M12 18h.01" />
                    </svg>
                  </div>
                  <div class="asset-details">
                    <span class="asset-id">{{ device.serialNumber }}</span>
                    <span class="asset-model">{{
                      device.productName || "Unknown Product"
                    }}</span>
                  </div>
                </div>
              </div>
              <!-- Type Column -->
              <div class="list-cell type-col">
                <span class="type-badge">{{
                  device.productName || "Unknown"
                }}</span>
              </div>
              <!-- Status Column -->
              <div class="list-cell status-col">
                <span
                  class="status-badge"
                  :class="getDeviceStatusClass(device.status)"
                >
                  <template v-if="device.status === 'assigned'">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                  </template>
                  <template v-else-if="device.status === 'draft'">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </template>
                  <template v-else>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </template>
                  {{ getDeviceStatusLabel(device.status) }}
                </span>
              </div>
              <!-- Date Column -->
              <div class="list-cell date-col">
                <span class="date-text">{{
                  formatDate(device.createdAt)
                }}</span>
              </div>
              <!-- Actions Column -->
              <div class="list-cell actions-col">
                <div class="action-buttons">
                  <button
                    class="action-btn"
                    @click.stop="showDeviceQR(device)"
                    title="QR Code"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect width="5" height="5" x="3" y="3" rx="1" />
                      <rect width="5" height="5" x="16" y="3" rx="1" />
                      <rect width="5" height="5" x="3" y="16" rx="1" />
                      <path d="m21 16-3.5-3.5-1 1" />
                      <path d="m21 21-3.5-3.5-1 1" />
                      <path d="m21 11-3.5-3.5-1 1" />
                    </svg>
                  </button>
                  <button
                    class="action-btn"
                    @click.stop="editDevice(device)"
                    title="Edit"
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
                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      />
                      <path
                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Pagination -->
        <CustomPagination
          v-model:page="currentPage"
          v-model:itemsPerPage="itemsPerPage"
          :total-items="totalItems"
          :is-searching="!!searchQuery"
          @update:page="handlePageChange"
          @update:itemsPerPage="handleItemsPerPageChange"
        />
      </main>
    </div>

    <!-- Sidebar for Product Selection -->
    <div v-if="showSidebar" class="sidebar-overlay" @click="closeSidebar">
      <div class="sidebar" @click.stop>
        <div class="sidebar-header">
          <h2>Select Product</h2>
          <button class="close-btn" @click="closeSidebar">
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
        <div class="sidebar-body">
          <div v-if="isLoadingProducts" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading Products...</p>
          </div>
          <div v-else-if="products.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                />
              </svg>
            </div>
            <h3>No products found</h3>
            <p>No products available to add assets.</p>
          </div>
          <div v-else class="product-list">
            <div
              v-for="product in products"
              :key="product.productId"
              class="product-item"
              @click="
                navigateToAddAsset(
                  'manual',
                  product.productId,
                  product.productName,
                )
              "
            >
              <div class="product-info">
                <div class="product-detail">
                  <span class="product-label">Model Number:</span>
                  <span class="product-value">{{ product.productId }}</span>
                </div>
                <div class="product-detail">
                  <span class="product-label">Asset Type:</span>
                  <span class="product-value">{{
                    product.productName || "Unknown Product"
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Device Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Device</h2>
          <button class="close-btn" @click="closeEditModal">
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
          <div class="device-details">
            <div class="detail-row">
              <span class="detail-label">Asset ID:</span>
              <span class="detail-value">{{
                selectedDevice?.serialNumber
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Asset type:</span>
              <span class="detail-value">{{
                selectedDevice?.productName
              }}</span>
            </div>
          </div>
          <div class="form-group">
            <label for="deviceName">Asset Name</label>
            <input
              type="text"
              id="deviceName"
              v-model="deviceNameInput"
              class="form-input"
              placeholder="Enter Asset name"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeEditModal">Cancel</button>
          <button
            class="btn-primary"
            :disabled="isUpdating"
            @click="updateDeviceName"
          >
            <div v-if="isUpdating" class="loading-spinner small"></div>
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQRModal" class="modal-overlay" @click="closeQRModal">
      <div class="modal-content qr-modal" @click.stop>
        <div class="modal-header">
          <h2>Asset QR Code</h2>
          <button class="close-btn" @click="closeQRModal">
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
        <div class="modal-body qr-body">
          <div class="qr-display">
            <div class="qr-code-container" ref="qrContainer">
              <qrcode-vue
                :value="qrCodeData"
                :size="200"
                level="H"
                render-as="svg"
                class="qr-code"
              />
            </div>
            <div class="device-qr-info">
              <h3>{{ selectedDevice?.serialNumber }}</h3>
              <p>{{ selectedDevice?.productName }}</p>
              <p class="qr-status">
                Status: {{ getDeviceStatusLabel(selectedDevice?.status) }}
              </p>
            </div>
          </div>
          <div class="qr-actions">
            <button class="qr-action-btn" @click="downloadQRCode">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </button>
            <button class="qr-action-btn" @click="printQRCode">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path
                  d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              Print
            </button>
            <button class="qr-action-btn" @click="shareQRCode">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Under Development Modal -->
    <div
      v-if="showUnderDevModal"
      class="modal-overlay"
      @click="closeUnderDevModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Feature Coming Soon</h2>
          <button class="close-btn" @click="closeUnderDevModal">
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
          <div class="empty-state">
            <div class="empty-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M12 2v4" />
                <path d="m16.24 7.76 2.83-2.83" />
                <path d="M18 12h4" />
                <path d="m16.24 16.24 2.83 2.83" />
                <path d="M12 18v4" />
                <path d="m4.93 19.07 2.83-2.83" />
                <path d="M2 12h4" />
                <path d="m4.93 4.93 2.83 2.83" />
              </svg>
            </div>
            <h3>Under Development</h3>
            <p>
              This feature is currently in development and will be available
              soon.
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="closeUnderDevModal">
            Got It
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QrcodeVue from "qrcode.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "../../../utils/pagination/CustomPagination.vue";

export default {
  name: "ProductManagement",
  components: {
    QrcodeVue,
    CustomPagination,
  },
  data() {
    return {
      allDevices: [],
      isLoading: true,
      searchQuery: "",
      showQRModal: false,
      showEditModal: false,
      selectedDevice: null,
      deviceNameInput: "",
      isUpdating: false,
      qrCodeData: "",
      currentPage: 1,
      itemsPerPage: 25,
      totalItems: 0,
      showUnderDevModal: false,
      selected: [],
      showAddProductMenu: false,
      showAddAssetMenu: false,
      showSidebar: false,
      products: [],
      isLoadingProducts: false,
      // Sorting state
      sortBy: "serialNumber",
      sortDirection: "asc",
      // Stats
      assignedDevicesCount: 0,
      unassignedDevicesCount: 0,
      token: null,
      tenantId: null,
    };
  },
  async created() {
    try {
      this.isLoading = true;
      // Get token
      this.token = await authService.getToken();
      if (!this.token) {
        console.error("Missing token");
        alert("Authentication token is missing. Please log in again.");
        return;
      }
      // Get tenantId
      this.tenantId = await currentUserTenant.getTenantIdAsync();
      if (!this.tenantId) {
        console.error("Missing tenantId");
        alert("Tenant information is missing. Please log in again.");
        return;
      }
      // Load devices
      await this.loadAllDevices();
    } catch (error) {
      console.error("Error initializing component:", error);
      alert("Failed to initialize. Please try again.");
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    // Debounced search
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.loadAllDevices();
      }, 300);
    },
    showUnderDevelopment() {
      this.showUnderDevModal = true;
      // Close any open dropdown menus
      this.showAddProductMenu = false;
      this.showAddAssetMenu = false;
    },
    closeUnderDevModal() {
      this.showUnderDevModal = false;
    },
    clearSearch() {
      this.searchQuery = "";
      this.currentPage = 1;
      this.loadAllDevices();
    },

    // Backend pagination and sorting
    async loadAllDevices() {
      this.isLoading = true;
      try {
        const devices = await this.fetchAllDevices();
        this.allDevices = devices.data;
        this.totalItems = devices.totalItems;
        this.assignedDevicesCount = devices.assignedCount;
        this.unassignedDevicesCount = devices.unassignedCount;
      } catch (error) {
        console.error("Failed to load devices:", error);
        alert("Failed to load devices. Please try again.");
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAllDevices() {
      try {
        let url = `${import.meta.env.VITE_API_URL}/items/products?`;

        // Base filters
        url += `filter[_and][0][tenant][tenantId][_eq]=${this.tenantId}`;
        url += `&filter[_and][1][serialNumber][_nempty]=true`;

        // Search filter
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          url += `&filter[_or][0][serialNumber][_icontains]=${encodeURIComponent(query)}`;
          url += `&filter[_or][1][productName][_icontains]=${encodeURIComponent(query)}`;
          url += `&filter[_or][2][status][_icontains]=${encodeURIComponent(query)}`;
        }

        // Pagination
        url += `&limit=${this.itemsPerPage}`;
        url += `&offset=${(this.currentPage - 1) * this.itemsPerPage}`;

        // Sorting
        if (this.sortBy) {
          url += `&sort=${this.sortDirection === "desc" ? "-" : ""}${this.sortBy}`;
        }

        // Fields
        url += `&fields[]=productId&fields[]=productName&fields[]=serialNumber&fields[]=status&fields[]=id&fields[]=date_created`;

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            alert(
              "You do not have permission to view devices. Please contact your administrator.",
            );
          }
          throw new Error(
            `Failed to load devices: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        // Get total count for pagination
        const countUrl =
          `${import.meta.env.VITE_API_URL}/items/products?` +
          `filter[_and][0][tenant][tenantId][_eq]=${this.tenantId}&` +
          `filter[_and][1][serialNumber][_nempty]=true&` +
          `aggregate[count]=id` +
          (this.searchQuery
            ? `&filter[_or][0][serialNumber][_icontains]=${encodeURIComponent(this.searchQuery)}&filter[_or][1][productName][_icontains]=${encodeURIComponent(this.searchQuery)}&filter[_or][2][status][_icontains]=${encodeURIComponent(this.searchQuery)}`
            : "");

        const countResponse = await fetch(countUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        });

        let totalItems = 0;
        if (countResponse.ok) {
          const countData = await countResponse.json();
          totalItems = countData?.data?.[0]?.count?.id || 0;
        }

        // Get stats
        const statsUrl =
          `${import.meta.env.VITE_API_URL}/items/products?` +
          `filter[_and][0][tenant][tenantId][_eq]=${this.tenantId}&` +
          `filter[_and][1][serialNumber][_nempty]=true&` +
          `aggregate[count]=status&groupBy[]=status`;

        let assignedCount = 0;
        let unassignedCount = 0;

        try {
          const statsResponse = await fetch(statsUrl, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.token}`,
            },
          });

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            statsData.data?.forEach((item) => {
              if (item.status === "assigned") {
                assignedCount = item.count?.status || 0;
              } else if (item.status === "draft") {
                unassignedCount = item.count?.status || 0;
              }
            });
          }
        } catch (error) {
          console.warn("Failed to fetch stats:", error);
        }

        const devices = data.data
          .filter(
            (d) => d.serialNumber && d.serialNumber.toString().trim() !== "",
          )
          .map((d) => ({
            id: d.id,
            serialNumber: d.serialNumber.toString(),
            status: d.status || "draft",
            productId: d.productId || null,
            productName: d.productName || "Unknown",
            createdAt: d.date_created || new Date().toISOString(),
          }));

        return {
          data: devices,
          totalItems,
          assignedCount,
          unassignedCount,
        };
      } catch (error) {
        console.error("Error fetching devices:", error);
        throw error;
      }
    },

    // Sorting method
    requestSort(field) {
      if (this.sortBy === field) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortBy = field;
        this.sortDirection = "asc";
      }
      this.currentPage = 1;
      this.loadAllDevices();
    },

    // Pagination handlers
    handlePageChange(newPage) {
      this.currentPage = newPage;
      this.loadAllDevices();
    },

    handleItemsPerPageChange(newItemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.currentPage = 1;
      this.loadAllDevices();
    },

    async fetchProductsForAssets() {
      try {
        const url = `${import.meta.env.VITE_API_URL}/items/products?filter[_and][0][tenant][tenantId][_eq]=${this.tenantId}&filter[_and][1][serialNumber][_empty]=true&fields[]=productId&fields[]=productName`;
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 403) {
            alert(
              "You do not have permission to view products. Please contact your administrator.",
            );
          }
          throw new Error(
            `Failed to load products: ${response.status} ${response.statusText}`,
          );
        }
        const data = await response.json();
        return data.data.map((d) => ({
          productId: d.productId || null,
          productName: d.productName || "Unknown",
        }));
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },

    toggleAddProductMenu() {
      this.showAddProductMenu = !this.showAddProductMenu;
      this.showAddAssetMenu = false;
    },

    toggleAddAssetMenu() {
      this.showAddAssetMenu = !this.showAddAssetMenu;
      this.showAddProductMenu = false;
    },

    navigateToAddProduct(type) {
      this.showAddProductMenu = false;
      if (type === "manual") {
        this.$router.push({ name: "ManualEntry" });
      } else if (type === "bulk") {
        this.showUnderDevelopment();
      }
    },
    async showProductSidebar() {
      this.showAddAssetMenu = false;
      this.isLoadingProducts = true;
      this.showSidebar = true;
      try {
        this.products = await this.fetchProductsForAssets();
      } catch (error) {
        console.error("Failed to load products:", error);
        alert("Failed to load products. Please try again.");
      } finally {
        this.isLoadingProducts = false;
      }
    },

    navigateToAddAsset(type, productId, productName) {
      this.showAddAssetMenu = false;
      this.showSidebar = false;
      if (type === "manual") {
        if (!productId) {
          console.error("Product ID is required for manual asset entry");
          alert("Please select a valid product.");
          return;
        }
        this.$router.push({
          name: "AddAssetManual",
          params: { productId },
          query: { productName },
        });
      } else if (type === "bulk") {
        this.showUnderDevelopment();
      }
    },
    closeSidebar() {
      this.showSidebar = false;
      this.products = [];
    },

    getDeviceStatusClass(status) {
      const statusLower = (status || "").toLowerCase();
      switch (statusLower) {
        case "assigned":
          return "status-assigned";
        case "draft":
          return "status-unassigned";
        default:
          return "status-offline";
      }
    },

    getDeviceStatusLabel(status) {
      const statusLower = (status || "").toLowerCase();
      switch (statusLower) {
        case "assigned":
          return "Assigned";
        case "draft":
          return "Unassigned";
        default:
          return "Unknown";
      }
    },

    formatDate(date) {
      if (!date) return "Unknown";
      return new Date(date).toLocaleDateString("en-GB");
    },

    showDeviceQR(device) {
      this.selectedDevice = device;
      const qrData = {
        serialNumber: device.serialNumber,
        productId: device.productId,
        productName: device.productName,
        status: device.status || "unassigned",
        tenantId: this.tenantId,
      };
      this.qrCodeData = JSON.stringify(qrData);
      this.showQRModal = true;
    },

    downloadQRCode() {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const svgElement = this.$refs.qrContainer.querySelector("svg");
        if (!svgElement) {
          console.error("QR code SVG not found");
          return;
        }
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const link = document.createElement("a");
          link.download = `qr-code-${this.selectedDevice?.serialNumber}.png`;
          link.href = canvas.toDataURL();
          link.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      } catch (error) {
        console.error("Error downloading QR code:", error);
      }
    },

    printQRCode() {
      const printWindow = window.open("", "_blank");
      const qrElement = this.$refs.qrContainer.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${this.selectedDevice?.serialNumber}</title>
            <style>
              body {

                text-align: center;
                padding: 20px;
              }
              .device-info {
                margin: 20px 0;
              }
              .qr-container {
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <h2>Device QR Code</h2>
            <div class="device-info">
              <p><strong>Serial Number:</strong> ${this.selectedDevice?.serialNumber}</p>
              <p><strong>Product:</strong> ${this.selectedDevice?.productName}</p>
              <p><strong>Status:</strong> ${this.getDeviceStatusLabel(this.selectedDevice?.status)}</p>
            </div>
            <div class="qr-container">${qrElement}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    },

    shareQRCode() {
      if (navigator.share) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const svgElement = this.$refs.qrContainer.querySelector("svg");
        if (!svgElement) return;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = async () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            const file = new File(
              [blob],
              `qr-code-${this.selectedDevice?.serialNumber}.png`,
              { type: "image/png" },
            );
            try {
              await navigator.share({
                title: `QR Code - ${this.selectedDevice?.serialNumber}`,
                text: `QR Code for device ${this.selectedDevice?.serialNumber}`,
                files: [file],
              });
            } catch (error) {
              console.error("Error sharing QR code:", error);
            }
          });
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      } else {
        navigator.clipboard.writeText(this.qrCodeData).then(() => {
          alert("QR code data copied to clipboard!");
        });
      }
    },

    editDevice(device) {
      this.selectedDevice = device;
      this.deviceNameInput = device.serialNumber;
      this.showEditModal = true;
    },

    async updateDeviceName() {
      if (!this.selectedDevice || !this.deviceNameInput) {
        return;
      }
      this.isUpdating = true;
      try {
        const url = `${import.meta.env.VITE_API_URL}/items/products/${this.selectedDevice.id}`;
        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serialNumber: this.deviceNameInput,
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to update device name: ${response.status}`);
        }
        this.allDevices = this.allDevices.map((device) => {
          if (device.id === this.selectedDevice.id) {
            return {
              ...device,
              serialNumber: this.deviceNameInput,
            };
          }
          return device;
        });
        this.isUpdating = false;
        this.closeEditModal();
        alert("Device updated successfully!");
      } catch (error) {
        console.error("Error updating device:", error);
        alert("Failed to update device. Please try again.");
        this.isUpdating = false;
      }
    },

    closeEditModal() {
      this.showEditModal = false;
      this.deviceNameInput = "";
      this.selectedDevice = null;
    },

    closeQRModal() {
      this.showQRModal = false;
      this.qrCodeData = "";
      this.selectedDevice = null;
    },

    navigateToDeviceDetail(device) {
      this.$router.push({
        name: "DeviceDetail",
        params: { serialNumber: device.serialNumber },
        query: {
          productId: device.productId,
          productName: device.productName,
          status: device.status,
        },
      });
    },

    goBack() {
      this.$router.push({ name: "TaskDashboard" });
    },

    toggleSelection(serialNumber) {
      const index = this.selected.indexOf(serialNumber);
      if (index > -1) {
        this.selected.splice(index, 1);
      } else {
        this.selected.push(serialNumber);
      }
    },

    toggleAll() {
      if (
        this.selected.length === this.allDevices.length &&
        this.allDevices.length > 0
      ) {
        this.selected = [];
      } else {
        this.selected = this.allDevices.map((d) => d.serialNumber);
      }
    },
  },
};
</script>

<style scoped>
/* Base Styles */
.tasks-container {
  height: 100vh;
  display: flex;
  padding: -1rem;
  overflow: hidden;
  background-color: #f8fafc;

}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  max-width: none;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Search */
.search-container {
  flex: 1;
  max-width: 400px;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.search-input:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input svg {
  position: absolute;
  left: 0.75rem;
  color: #64748b;
}

.search-input input {
  width: 100%;
  padding: 0.5rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  background: transparent;
  color: #1e293b;
}

.search-input input:focus {
  outline: none;
}

.search-input input::placeholder {
  color: #94a3b8;
}

.clear-button {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: #e2e8f0;
  color: #475569;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Stats */
.stats-container {
  display: flex;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  min-width: 60px;
}

.stat-number {
  font-size: 1.125rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

/* Add Product/Asset Buttons */
.add-product-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 1000;
  overflow: hidden;
  margin-top: 0.5rem;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  color: #1e293b;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}

/* Main Content Area */
.main-content-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Loading, Error, Empty States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-spinner.small {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  border: 1px solid #e2e8f0;
  height: 100%;
}

.empty-icon {
  color: #94a3b8;
  margin-bottom: 1rem;
}

.error-state h3,
.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.error-state p,
.empty-state p {
  color: #64748b;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}

/* Tasks List */
.tasks-list {
  flex: 1;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow-y: auto;
  overflow-x: auto;
  max-height: calc(95vh - 200px);
}

.list-header {
  display: flex;
  background: #f8fafc;
  padding: 0.5rem;
  font-weight: 700;
  color: #475569;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #e8edff;
  color: #0f3b82;
}

.header-cell {
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.header-cell .sort-icon {
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
}

.header-cell .sort-icon svg {
  transition: transform 0.2s ease;
}

.header-cell .sort-icon svg.rotate-180 {
  transform: rotate(180deg);
}

.list-item {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background-color: #f8fafc;
}

.list-item.selected-row {
  background-color: #eff6ff;
}

.item-row {
  display: flex;
  cursor: pointer;
}

.list-cell {
  padding: 0.5rem 0.5rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #1e293b;
}

/* Column Widths */
.checkbox-col {
  flex: 0 0 40px;
  justify-content: center;
}

/* Ensure alignment in header and rows */
.header-cell.checkbox-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.5rem;
  margin-left: 0.5rem;
}
.list-cell.checkbox-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.5rem;
  margin-left: 1rem;
}

.asset-col {
  flex: 2.5;
  min-width: 200px;
}

.type-col {
  flex: 1.5;
  min-width: 140px;
}

.status-col {
  flex: 1.5;
  min-width: 120px;
}

.date-col {
  flex: 1.5;
  min-width: 120px;
}

.actions-col {
  flex: 1.5;
  min-width: 120px;
  justify-content: center;
}

/* Custom Checkbox */
.custom-checkbox {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}

.custom-checkbox:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.custom-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.custom-checkbox:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -50%) rotate(45deg);
}

.custom-checkbox:indeterminate {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.custom-checkbox:indeterminate::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 2px;
  background-color: white;
  transform: translate(-50%, -50%);
  border-radius: 1px;
}

/* Asset Info */
.asset-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.asset-icon {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.asset-details {
  display: flex;
  flex-direction: column;
}

.asset-id {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.asset-model {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Type Badge */
.type-badge {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Status Badge */
.status-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-assigned {
  background: #dcfce7;
  color: #166534;
}

.status-unassigned {
  background: #fef3c7;
  color: #92400e;
}

.status-offline {
  background: #fee2e2;
  color: #dc2626;
}

/* Date Text */
.date-text {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.action-btn:hover {
  background: #0f3b82;
  border-color: #3b82f6;
  color: white;
}

/* Sidebar */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.sidebar {
  width: 320px;
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.product-item:hover {
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.product-label {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.875rem;
  min-width: 100px;
}

.product-value {
  font-size: 0.875rem;
  color: #1f2937;
}

/* Modal Styles */
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

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.qr-modal {
  max-width: 350px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body.qr-body {
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.25rem;
  border-top: 1px solid #e2e8f0;
}

/* Device Details */
.device-details {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  width: 6rem;
  font-weight: 600;
  color: #4b5563;
  font-size: 0.875rem;
}

.detail-value {
  flex: 1;
  color: #1f2937;
  font-weight: 500;
  font-size: 0.875rem;
}

/* Form Group */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4b5563;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* QR Modal Specific */
.qr-display {
  margin-bottom: 1.5rem;
}

.qr-code-container {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.qr-code {
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.device-qr-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.device-qr-info p {
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
}

.qr-status {
  font-weight: 500;
  color: #3b82f6;
}

.qr-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.qr-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4b5563;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qr-action-btn:hover {
  background: #0f3b82;
  border-color: #3b82f6;
  color: white;
}

/* Buttons */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #68ade1;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #0f3b82;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.modal-body .empty-state {
  padding: 1rem 0;
}

.modal-body .empty-state h3 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.modal-body .empty-state p {
  font-size: 0.875rem;
  margin-bottom: 0;
}

.btn-secondary {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .tasks-list {
    overflow-x: auto;
  }
  .list-header,
  .item-row {
    min-width: 800px;
  }
  .sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .search-container {
    order: 3;
    flex: 1 1 100%;
    max-width: none;
  }
  .stats-container {
    order: 2;
    flex-wrap: wrap;
  }
  .sidebar {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0.75rem;
  }
  .title {
    font-size: 1.25rem;
  }
  .stats-container {
    gap: 0.5rem;
  }
  .stat-item {
    min-width: 50px;
    padding: 0.375rem 0.5rem;
  }
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
here in this wh

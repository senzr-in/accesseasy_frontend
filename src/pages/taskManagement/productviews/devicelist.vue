<template>
  <div class="device-management">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <button class="btn-icon" @click="goBack" aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div class="header-title">
          <h1>{{ isMultiSelectMode ? 'Select Devices' : 'Device Management' }}</h1>
          <span class="header-subtitle">{{ productName }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button 
          class="btn-secondary" 
          @click="toggleMultiSelectMode"
          :class="{ active: isMultiSelectMode }"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path v-if="isMultiSelectMode" d="m9 12 2 2 4-4"/>
          </svg>
          {{ isMultiSelectMode ? 'Exit Select' : 'Select Mode' }}
        </button>
        <button 
          v-if="isMultiSelectMode && selectedDeviceIds.length > 0"
          class="btn-primary"
          @click="fetchCustomerData"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          Assign Customer
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon devices">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ devices.length }}</div>
            <div class="stat-label">Total Devices</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon assigned">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ assignedCount }}</div>
            <div class="stat-label">Assigned</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon unassigned">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ unassignedCount }}</div>
            <div class="stat-label">Unassigned</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon maintenance">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ maintenanceCount }}</div>
            <div class="stat-label">Maintenance</div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by serial number or device name..."
              class="search-input"
              @input="filterDevices"
            />
            <button 
              v-if="searchQuery" 
              class="clear-search"
              @click="clearSearch"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="results-info">
          <span>{{ filteredDevices.length }} of {{ devices.length }} devices</span>
          <div v-if="selectedDeviceIds.length > 0" class="selected-info">
            {{ selectedDeviceIds.length }} selected
          </div>
        </div>
      </div>

      <!-- Device List -->
      <div class="device-list-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="state-container">
          <div class="loading-spinner"></div>
          <p>Loading devices...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="state-container error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <p>{{ errorMessage }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredDevices.length === 0" class="state-container empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          <p>No devices found</p>
          <button v-if="searchQuery" class="btn-secondary" @click="clearSearch">
            Clear search
          </button>
        </div>

        <!-- Device Table -->
        <div v-else class="table-container">
          <table class="device-table">
            <thead>
              <tr>
                <th v-if="isMultiSelectMode" class="checkbox-col">
                  <label class="checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      :checked="selectedDeviceIds.length === filteredDevices.length && filteredDevices.length > 0"
                      @change="toggleSelectAll"
                    />
                    <span class="checkmark"></span>
                  </label>
                </th>
                <th class="id-col">#</th>
                <th class="serial-col">Serial Number</th>
                <th class="status-col">Status</th>
                <th class="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(device, index) in filteredDevices" 
                :key="device.serialNumber"
                class="device-row"
                :class="{ selected: isDeviceSelected(device.serialNumber) }"
              >
                <td v-if="isMultiSelectMode" class="checkbox-col">
                  <label class="checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      :checked="isDeviceSelected(device.serialNumber)"
                      @change="toggleDeviceSelection(device.serialNumber)"
                    />
                    <span class="checkmark"></span>
                  </label>
                </td>
                <td class="id-col">{{ index + 1 }}</td>
                <td class="serial-col">
                  <div class="device-info">
                    <div class="device-serial">{{ device.serialNumber }}</div>
                    <div v-if="device.name && device.name !== device.serialNumber" class="device-name">
                      {{ device.name }}
                    </div>
                  </div>
                </td>
                <td class="status-col">
                  <span :class="['status-badge', getStatusClass(device.status)]">
                    <span class="status-dot"></span>
                    {{ device.status || 'unassigned' }}
                  </span>
                </td>
                <td class="actions-col">
                  <div class="action-buttons">
                    <button 
                      class="btn-icon action-btn"
                      @click="showAssignCustomerForDevice(device)"
                      title="Assign Customer"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="22" y1="11" x2="16" y2="11"/>
                      </svg>
                    </button>
                    <button 
                      class="btn-icon action-btn"
                      @click="showEditDeviceForDevice(device)"
                      title="Edit Device"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button 
                      class="btn-icon action-btn"
                      @click="showQRCodeForDevice(device)"
                      title="Show QR Code"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="5" height="5"/>
                        <rect x="16" y="3" width="5" height="5"/>
                        <rect x="3" y="16" width="5" height="5"/>
                        <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                        <path d="M21 21v.01"/>
                        <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                        <path d="M3 12h.01"/>
                        <path d="M12 3h.01"/>
                        <path d="M12 16v.01"/>
                        <path d="M16 12h1"/>
                        <path d="M21 12v.01"/>
                        <path d="M12 21v-1"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Assign Customer Modal -->
    <div v-if="showAssignModal" class="modal-overlay" @click="closeAssignModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            <div>
              <h3>Assign Customer</h3>
              <p>{{ selectedDeviceIds.length > 1 ? `${selectedDeviceIds.length} devices selected` : `Device: ${selectedDeviceIds[0]}` }}</p>
            </div>
          </div>
          <button class="btn-icon" @click="closeAssignModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="search-container">
            <div class="search-input-wrapper">
              <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                v-model="customerSearchQuery" 
                placeholder="Search customers..."
                class="search-input"
                @input="filterCustomers"
              />
            </div>
          </div>

          <div v-if="isLoadingCustomers" class="state-container">
            <div class="loading-spinner"></div>
            <p>Loading customers...</p>
          </div>
          <div v-else-if="customerError" class="state-container error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <p>{{ customerError }}</p>
          </div>
          <div v-else-if="filteredCustomers.length === 0" class="state-container empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p>No customers found</p>
          </div>
          <div v-else class="customers-grid">
            <div 
              v-for="customer in filteredCustomers" 
              :key="customer.id"
              :class="['customer-card', { selected: selectedCustomerId === customer.id }]"
              @click="selectCustomer(customer.id)"
            >
              <div class="customer-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="customer-info">
                <div class="customer-name">{{ customer.customerName }}</div>
                <div class="customer-company">{{ customer.company }}</div>
              </div>
              <div v-if="selectedCustomerId === customer.id" class="customer-selected">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeAssignModal">Cancel</button>
          <button 
            class="btn-primary" 
            :disabled="!selectedCustomerId || isAssigning"
            @click="assignCustomer"
          >
            <div v-if="isAssigning" class="loading-spinner small"></div>
            {{ selectedDeviceIds.length > 1 ? 'Assign All' : 'Assign' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Device Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <div>
              <h3>Edit Device</h3>
              <p>{{ selectedDevice?.serialNumber }}</p>
            </div>
          </div>
          <button class="btn-icon" @click="closeEditModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="device-details">
            <div class="detail-row">
              <span class="detail-label">Device ID:</span>
              <span class="detail-value">{{ selectedDevice?.serialNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Model:</span>
              <span class="detail-value">{{ productId }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="deviceName">Device Name</label>
            <input 
              type="text" 
              id="deviceName" 
              v-model="deviceNameInput" 
              class="form-input"
              placeholder="Enter device name"
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
      <div class="modal qr-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="5" height="5"/>
              <rect x="16" y="3" width="5" height="5"/>
              <rect x="3" y="16" width="5" height="5"/>
              <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
              <path d="M21 21v.01"/>
              <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
              <path d="M3 12h.01"/>
              <path d="M12 3h.01"/>
              <path d="M12 16v.01"/>
              <path d="M16 12h1"/>
              <path d="M21 12v.01"/>
              <path d="M12 21v-1"/>
            </svg>
            <div>
              <h3>Device QR Code</h3>
              <p>{{ selectedDevice?.serialNumber }}</p>
            </div>
          </div>
          <button class="btn-icon" @click="closeQRModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="qr-container">
            <div class="qr-code">
              <qrcode-vue 
                :value="qrCodeData" 
                :size="200" 
                level="H" 
                render-as="svg" 
              />
            </div>
          </div>

          <div class="device-details">
            <div class="detail-row">
              <span class="detail-label">Device ID:</span>
              <span class="detail-value">{{ selectedDevice?.serialNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Device Name:</span>
              <span class="detail-value">{{ selectedDevice?.name || selectedDevice?.serialNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Model:</span>
              <span class="detail-value">{{ productId }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Product:</span>
              <span class="detail-value">{{ productName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span :class="['status-badge', getStatusClass(selectedDevice?.status)]">
                <span class="status-dot"></span>
                {{ selectedDevice?.status || 'unassigned' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import QrcodeVue from 'qrcode.vue';
import { authService } from '@/services/authService';
export default {
  name: 'DeviceManagement',
  components: {
    QrcodeVue
  },
  props: {
    productId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      default: ''
    },
    initialDevices: {
      type: Array,
      default: () => []
    },
    status: {
      type: String,
      default: 'active'
    }
  },
  setup(props) {
    const router = useRouter();
    
    // State variables
    const devices = ref([]);
    const filteredDevices = ref([]);
    const searchQuery = ref('');
    const isLoading = ref(true);
    const errorMessage = ref(null);
    const isMultiSelectMode = ref(false);
    const selectedDeviceIds = ref([]);
    const selectedDevice = ref(null);
    const showAssignModal = ref(false);
    const showEditModal = ref(false);
    const showQRModal = ref(false);
    const customers = ref([]);
    const filteredCustomers = ref([]);
    const customerSearchQuery = ref('');
    const selectedCustomerId = ref(null);
    const isLoadingCustomers = ref(false);
    const customerError = ref(null);
    const isAssigning = ref(false);
    const isUpdating = ref(false);
    const deviceNameInput = ref('');
    const qrCodeData = ref('');
    
    const token = authService.getToken();
    
    // Computed properties for stats
    const assignedCount = computed(() => 
      devices.value.filter(device => device.status === 'assigned').length
    );
    
    const unassignedCount = computed(() => 
      devices.value.filter(device => !device.status || device.status === 'unassigned').length
    );
    
    const maintenanceCount = computed(() => 
      devices.value.filter(device => device.status === 'maintenance').length
    );
    
    // Initialize devices
    const initializeDevices = () => {
      if (props.initialDevices && props.initialDevices.length > 0) {
        devices.value = [...props.initialDevices];
      } else {
        const mockDevices = [];
        for (let i = 1; i <= 10; i++) {
          mockDevices.push({
            serialNumber: `SN${props.productId || 'MODEL'}${i.toString().padStart(4, '0')}`,
            status: getRandomStatus(),
            name: null,
            assignedto: null
          });
        }
        devices.value = mockDevices;
      }
      filteredDevices.value = [...devices.value];
      isLoading.value = false;
    };
    
    // Fetch all device details
    const fetchAllDeviceDetails = async () => {
      isLoading.value = true;
      errorMessage.value = null;
      
      try {
        const updatedDevices = [];
        for (const device of devices.value) {
          const serialNumber = device.serialNumber;
          if (!serialNumber) {
            updatedDevices.push(device);
            continue;
          }
          
          const productDetails = await fetchProductDetails(serialNumber);
          if (productDetails) {
            updatedDevices.push({
              serialNumber: serialNumber,
              status: productDetails.status || 'unassigned',
              name: productDetails.name || serialNumber,
              assignedto: productDetails.assignedto
            });
          } else {
            updatedDevices.push(device);
          }
        }
        
        devices.value = updatedDevices;
        filteredDevices.value = [...updatedDevices];
        isLoading.value = false;
      } catch (error) {
        console.error('Error fetching device details:', error);
        errorMessage.value = `Error fetching device details: ${error.message}`;
        isLoading.value = false;
      }
    };
    
    // Fetch product details for a specific serial number
    const fetchProductDetails = async (serialNumber) => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/items/products?filter[_and][0][serialNumber][_eq]=${serialNumber}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch product details: ${response.status}`);
        }
        
        const jsonData = await response.json();
        return jsonData.data.length > 0 ? jsonData.data[0] : null;
      } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
      }
    };
    
    // Fetch customer data
    const fetchCustomerData = async () => {
      if (isMultiSelectMode.value && selectedDeviceIds.value.length === 0) {
        return;
      }
      
      isLoadingCustomers.value = true;
      customerError.value = null;
      
      try {
        const url = `${import.meta.env.VITE_API_URL}/items/customers?fields[]=id&fields[]=customerName&fields[]=company`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch customers: ${response.status}`);
        }
        
        const jsonData = await response.json();
        customers.value = jsonData.data;
        filteredCustomers.value = [...customers.value];
        isLoadingCustomers.value = false;
        showAssignModal.value = true;
      } catch (error) {
        console.error('Error fetching customers:', error);
        customerError.value = `Error fetching customers: ${error.message}`;
        isLoadingCustomers.value = false;
      }
    };
    
    // Assign customer to devices
    const assignCustomer = async () => {
      if (!selectedCustomerId.value || selectedDeviceIds.value.length === 0) {
        return;
      }

      isAssigning.value = true;

      try {
        let allSuccess = true;
        for (const serialNumber of selectedDeviceIds.value) {
          const productDetails = await fetchProductDetails(serialNumber);
          if (!productDetails) {
            allSuccess = false;
            continue;
          }

          const url = `${import.meta.env.VITE_API_URL}/items/products/${productDetails.id}`;
          const response = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              assignedto: selectedCustomerId.value,
              status: 'assigned'
            })
          });

          if (!response.ok) {
            allSuccess = false;
            continue;
          }
        }

        if (allSuccess) {
          devices.value = devices.value.map(device => {
            if (selectedDeviceIds.value.includes(device.serialNumber)) {
              return {
                ...device,
                status: 'assigned',
                assignedto: selectedCustomerId.value
              };
            }
            return device;
          });

          filteredDevices.value = [...devices.value];
          selectedDeviceIds.value = [];
          isMultiSelectMode.value = false;
        }

        isAssigning.value = false;
        closeAssignModal();
      } catch (error) {
        console.error('Error in assignCustomer:', error);
        isAssigning.value = false;
      }
    };

    // Update device name
    const updateDeviceName = async () => {
      if (!selectedDevice.value || !deviceNameInput.value) {
        return;
      }

      isUpdating.value = true;

      try {
        const productDetails = await fetchProductDetails(selectedDevice.value.serialNumber);
        if (!productDetails) {
          throw new Error('Product not found for serial number');
        }

        const url = `${import.meta.env.VITE_API_URL}/items/products/${productDetails.id}`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            serialNumber: deviceNameInput.value
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to update device name: ${response.status}`);
        }

        devices.value = devices.value.map(device => {
          if (device.serialNumber === selectedDevice.value.serialNumber) {
            return {
              ...device,
              serialNumber: deviceNameInput.value
            };
          }
          return device;
        });

        filteredDevices.value = [...devices.value];
        isUpdating.value = false;
        closeEditModal();
      } catch (error) {
        console.error('Error in updateDeviceName:', error);
        isUpdating.value = false;
      }
    };
    
    // Filter devices based on search query
    const filterDevices = () => {
      if (!searchQuery.value) {
        filteredDevices.value = [...devices.value];
        return;
      }
      
      const query = searchQuery.value.toLowerCase();
      filteredDevices.value = devices.value.filter(device => {
        const serialNumber = device.serialNumber?.toLowerCase() || '';
        const name = device.name?.toLowerCase() || '';
        return serialNumber.includes(query) || name.includes(query);
      });
    };
    
    // Filter customers based on search query
    const filterCustomers = () => {
      if (!customerSearchQuery.value) {
        filteredCustomers.value = [...customers.value];
        return;
      }
      
      const query = customerSearchQuery.value.toLowerCase();
      filteredCustomers.value = customers.value.filter(customer => {
        const customerName = customer.customerName?.toLowerCase() || '';
        const company = customer.company?.toLowerCase() || '';
        return customerName.includes(query) || company.includes(query);
      });
    };
    
    // Clear search
    const clearSearch = () => {
      searchQuery.value = '';
      filteredDevices.value = [...devices.value];
    };
    
    // Toggle multi-select mode
    const toggleMultiSelectMode = () => {
      isMultiSelectMode.value = !isMultiSelectMode.value;
      if (!isMultiSelectMode.value) {
        selectedDeviceIds.value = [];
      }
    };
    
    // Toggle select all devices
    const toggleSelectAll = () => {
      if (selectedDeviceIds.value.length === filteredDevices.value.length) {
        selectedDeviceIds.value = [];
      } else {
        selectedDeviceIds.value = filteredDevices.value.map(device => device.serialNumber);
      }
    };
    
    // Check if a device is selected
    const isDeviceSelected = (deviceId) => {
      return selectedDeviceIds.value.includes(deviceId);
    };
    
    // Toggle device selection
    const toggleDeviceSelection = (deviceId) => {
      if (isDeviceSelected(deviceId)) {
        selectedDeviceIds.value = selectedDeviceIds.value.filter(id => id !== deviceId);
      } else {
        selectedDeviceIds.value.push(deviceId);
      }
    };
    
    // Show assign customer modal for a specific device
    const showAssignCustomerForDevice = (device) => {
      selectedDevice.value = device;
      selectedDeviceIds.value = [device.serialNumber];
      fetchCustomerData();
    };
    
    // Show edit device modal for a specific device
    const showEditDeviceForDevice = (device) => {
      selectedDevice.value = device;
      deviceNameInput.value = device.name || device.serialNumber;
      showEditModal.value = true;
    };
    
    // Show QR code modal for a specific device
    const showQRCodeForDevice = (device) => {
      selectedDevice.value = device;
      
      const qrData = {
        serialNumber: device.serialNumber,
        productId: props.productId,
        productName: props.productName,
        name: device.name || device.serialNumber,
        status: device.status || 'unassigned'
      };
      
      qrCodeData.value = JSON.stringify(qrData);
      showQRModal.value = true;
    };
    
    // Select customer
    const selectCustomer = (customerId) => {
      selectedCustomerId.value = customerId;
    };
    
    // Close modals
    const closeAssignModal = () => {
      showAssignModal.value = false;
      selectedCustomerId.value = null;
      customerSearchQuery.value = '';
    };
    
    const closeEditModal = () => {
      showEditModal.value = false;
      deviceNameInput.value = '';
    };
    
    const closeQRModal = () => {
      showQRModal.value = false;
      qrCodeData.value = '';
    };
    
    // Get status class
    const getStatusClass = (status) => {
      if (!status) return 'unassigned';
      
      switch (status.toLowerCase()) {
        case 'assigned':
          return 'assigned';
        case 'unassigned':
          return 'unassigned';
        case 'maintenance':
          return 'maintenance';
        default:
          return 'unassigned';
      }
    };
    
    // Get random status
    const getRandomStatus = () => {
      const statuses = ['assigned', 'unassigned', 'maintenance'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    };
    
    // Go back
    const goBack = () => {
      router.back();
    };
    
    // Lifecycle hooks
    onMounted(() => {
      initializeDevices();
      fetchAllDeviceDetails();
    });
    
    return {
      // State
      devices,
      filteredDevices,
      searchQuery,
      isLoading,
      errorMessage,
      isMultiSelectMode,
      selectedDeviceIds,
      selectedDevice,
      showAssignModal,
      showEditModal,
      showQRModal,
      customers,
      filteredCustomers,
      customerSearchQuery,
      selectedCustomerId,
      isLoadingCustomers,
      customerError,
      isAssigning,
      isUpdating,
      deviceNameInput,
      qrCodeData,
      
      // Computed
      assignedCount,
      unassignedCount,
      maintenanceCount,
      
      // Methods
      filterDevices,
      filterCustomers,
      clearSearch,
      toggleMultiSelectMode,
      toggleSelectAll,
      isDeviceSelected,
      toggleDeviceSelection,
      showAssignCustomerForDevice,
      showEditDeviceForDevice,
      showQRCodeForDevice,
      fetchCustomerData,
      assignCustomer,
      updateDeviceName,
      selectCustomer,
      closeAssignModal,
      closeEditModal,
      closeQRModal,
      getStatusClass,
      goBack
    };
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.device-management {

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #1a202c;
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #1a202c;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Buttons */
.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #4a5568;
}

.btn-icon:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #2d3748;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.btn-secondary.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

/* Main Content */
.main-content {
  padding: 2rem 1.5rem;
  max-width: 100%;
  margin: 0 auto;
  overflow: auto;
  max-height: 80vh;
  padding-bottom: 200px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.devices {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.assigned {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.stat-icon.unassigned {
  background: linear-gradient(135deg, #a0aec0 0%, #718096 100%);
}

.stat-icon.maintenance {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
}

/* Search Section */
.search-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.search-container {
  margin-bottom: 1rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #a0aec0;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f7fafc;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-search {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.clear-search:hover {
  color: #718096;
  background: rgba(0, 0, 0, 0.05);
}

.results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #718096;
}

.selected-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-weight: 600;
}

/* Device List Container */
.device-list-container {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* State Containers */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.state-container p {
  margin-top: 1rem;
  color: #718096;
  font-size: 1.125rem;
}

.state-container.error {
  color: #e53e3e;
}

.state-container.error svg {
  color: #e53e3e;
}

.state-container.empty svg {
  color: #a0aec0;
}

/* Loading Spinner */
.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Table Container */
.table-container {
  overflow-x: auto;
}

.device-table {
  width: 100%;
  border-collapse: collapse;
}

.device-table th {
  background: #f7fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.device-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.device-row {
  transition: all 0.2s ease;
}

.device-row:hover {
  background: #f7fafc;
}

.device-row.selected {
  background: rgba(102, 126, 234, 0.05);
}

/* Table Columns */
.checkbox-col {
  width: 60px;
}

.id-col {
  width: 80px;
  font-weight: 600;
  color: #4a5568;
}

.serial-col {
  min-width: 200px;
}

.status-col {
  width: 150px;
}

.actions-col {
  width: 150px;
}

/* Device Info */
.device-info {
  display: flex;
  flex-direction: column;
}

.device-serial {
  font-weight: 600;
  color: #1a202c;
}

.device-name {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.status-badge.assigned {
  background: rgba(72, 187, 120, 0.1);
  color: #38a169;
}

.status-badge.assigned .status-dot {
  background: #38a169;
}

.status-badge.unassigned {
  background: rgba(160, 174, 192, 0.1);
  color: #718096;
}

.status-badge.unassigned .status-dot {
  background: #718096;
}

.status-badge.maintenance {
  background: rgba(237, 137, 54, 0.1);
  color: #dd6b20;
}

.status-badge.maintenance .status-dot {
  background: #dd6b20;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  color: #667eea;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #5a67d8;
}

/* Checkbox */
.checkbox-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
}

.checkmark {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0.25rem;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 0.25rem;
  top: 0.125rem;
  width: 0.25rem;
  height: 0.5rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
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
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

.qr-modal {
  max-width: 500px;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-title svg {
  color: #667eea;
}

.modal-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
}

.modal-title p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #718096;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

/* Customers Grid */
.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.customer-card {
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.customer-card:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.customer-card.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.customer-avatar {
  width: 3rem;
  height: 3rem;
  background: #f7fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #718096;
}

.customer-card.selected .customer-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.customer-name {
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.customer-company {
  font-size: 0.875rem;
  color: #718096;
}

.customer-selected {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #667eea;
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
  width: 8rem;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.detail-value {
  flex: 1;
  color: #1a202c;
  font-weight: 500;
}

/* Form Group */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* QR Container */
.qr-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.qr-code {
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .devices-table {
    min-width: 800px;
  }
  
  .devices-list {
    overflow-x: auto;
  }
  
  .customers-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 640px) {
  .web-modal {
    width: 90%;
    max-width: none;
  }
  
  .customers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
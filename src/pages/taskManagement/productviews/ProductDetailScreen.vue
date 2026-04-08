<template>
  <div class="product-detail-screen">
    <!-- Header -->
    <header class="header">
      <div class="header-container">
        <div class="header-left">
          <button class="back-btn" @click="goBack">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h1 class="header-title">Asset Type Details</h1>
        </div>
        <div class="header-actions">
          <button class="action-btn edit-btn" @click="navigateToEdit" title="Edit Asset Type">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn share-btn" @click="shareProductDetails" title="Share">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-animation">
        <div class="loading-spinner"></div>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p class="loading-text">{{ loadingMessage || 'Loading Asset type details...' }}</p>
    </div>

    <!-- Main Layout -->
    <div v-else class="main-layout">
      <!-- Sidebar Navigation -->
      <div class="sidebar">
        <nav class="sidebar-nav">
          <button 
            v-for="(tab, index) in tabs" 
            :key="index"
            :class="['sidebar-item', { 'active': activeTab === tabValues[index] }]"
            @click="setActiveTab(tabValues[index])"
          >
            <i :class="getTabIcon(tabValues[index])"></i>
            <span>{{ tab }}</span>
          </button>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Asset Profile Section -->
        <div class="asset-profile-section">
          <div class="asset-image-container">
            <img 
              v-if="product.imageUrl && !imageError"
              :src="`${product.imageUrl}?access_token=${token}`"
              :alt="product.productName"
              @error="handleImageError"
              class="asset-image"
            />
            <div v-else class="asset-placeholder">
              <span class="placeholder-letter">{{ product.productName?.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          
          <div class="asset-info">
            <h2 class="asset-name">{{ product.productName }}</h2>
            <div class="asset-model">
              <span class="model-hash">#</span>
              <span class="model-text">Model: {{ product.productId || 'Assets-01' }}</span>
            </div>
            <div class="asset-category">
              <span class="category-badge">{{ category?.categoryName || 'ndj' }}</span>
            </div>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="content-area">
          <!-- Info Tab -->
          <div v-if="activeTab === 'details'" class="tab-content active">
            <!-- Asset Information -->
            <div class="info-card">
              <div class="card-header">
                <h3 class="card-title">Asset Type Information</h3>
              </div>
              <div class="info-grid">
                <div class="info-field">
                  <label class="field-label">Asset Type Name</label>
                  <div class="field-value">{{ product.productName }}</div>
                </div>
                
                <div class="info-field">
                  <label class="field-label">Model Number</label>
                  <div class="field-value">{{ product.productId || 'Assets-01' }}</div>
                </div>
                
                <div class="info-field">
                  <label class="field-label">Category</label>
                  <div class="field-value">{{ category?.categoryName || 'ndj' }}</div>
                </div>
                
                <div class="info-field">
                  <label class="field-label">Created Date</label>
                  <div class="field-value">{{ getRandomDate() }}</div>
                </div>
                
                <div class="info-field">
                  <label class="field-label">Last Updated</label>
                  <div class="field-value">{{ getRandomDate() }}</div>
                </div>
                
                <div class="info-field">
                  <label class="field-label">Status</label>
                  <div class="field-value">
                    <span class="status-badge status-active">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Installation List -->
            <!-- <div class="installation-card">
              <div class="card-header">
                <h3 class="card-title">List of Installation</h3>
                <div class="device-count-badge">
                  <span>{{ serialNumbers.length }} Devices</span>
                </div>
              </div>
              
              <div class="installation-content">
                <p class="installation-subtitle">All Assets associated with this product model</p>
                
                <div v-if="isLoadingSerialNumbers" class="loading-devices">
                  <div class="loading-spinner"></div>
                  <p>Loading device inventory...</p>
                </div>
                
                <div v-else-if="serialNumbersError" class="error-state">
                  <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                  </div>
                  <h3>Failed to Load Devices</h3>
                  <p>{{ serialNumbersError }}</p>
                  <button class="retry-btn" @click="fetchSerialNumbers">
                    <i class="fas fa-redo"></i>
                    Retry
                  </button>
                </div>
                
                <div v-else-if="!serialNumbers.length" class="empty-devices">
                  <div class="empty-icon">
                    <i class="fas fa-box-open"></i>
                  </div>
                  <h3>No Devices Found</h3>
                  <p>Start building your inventory by adding devices to this product.</p>
                  <button class="add-device-btn" @click="showAddProductOptions">
                    <i class="fas fa-plus"></i>
                    Add First Device
                  </button>
                </div>
                
                <div v-else class="devices-table">
                  <table class="table">
                    <thead class="table-header">
                      <tr>
                        <th class="table-th">ID</th>
                        <th class="table-th">ASSET ID</th>
                        <th class="table-th">Status</th>
                        <th class="table-th">Installation Date</th>
                        <th class="table-th">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="table-body">
                      <tr
                        v-for="(device, index) in displayedSerialNumbers"
                        :key="device.serialNumber"
                        class="table-row"
                        @click="showDeviceDetails(device.serialNumber, device.status)"
                      >
                        <td class="table-td">{{ index + 1 }}</td>
                        <td class="table-td">{{ device.serialNumber }}</td>
                        <td class="table-td">
                          <span class="status-badge" :class="getDeviceStatusClass(device.serialNumber)">
                            {{ getDeviceStatus(device.serialNumber) }}
                          </span>
                        </td>
                        <td class="table-td">Added on {{ getRandomDate() }}</td>
                        <td class="table-td">
                          <button class="action-more-btn">
                            <i class="fas fa-ellipsis-h"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div class="table-footer">
                    <button class="view-all-btn" @click="viewAllDevices">
                      View All Assigned Customer
                      <i class="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div> -->
          </div>

          <!-- Documents Tab -->
          <div v-if="activeTab === 'documents'" class="tab-content active">
            <div class="documents-card">
              <div class="card-header">
                <h3 class="card-title">Documents</h3>
              </div>
              
              <div v-if="!hasDocuments" class="empty-state">
                <div class="empty-icon">
                  <i class="fas fa-file-alt"></i>
                </div>
                <h3>No Documents Available</h3>
                <p>There are no documents associated with this product.</p>
                <button class="add-document-btn">
                  <i class="fas fa-plus"></i>
                  Add Document
                </button>
              </div>
              
              <div v-else class="documents-grid">
                <div v-if="product.manual" class="document-card" @click="downloadDocument(product.manual, 'manual.pdf')">
                  <div class="document-header">
                    <div class="document-icon">
                      <i class="fas fa-book"></i>
                    </div>
                    <div class="document-actions">
                      <button class="doc-action-btn" title="Download">
                        <i class="fas fa-download"></i>
                      </button>
                      <button class="doc-action-btn" title="Preview">
                        <i class="fas fa-eye"></i>
                      </button>
                    </div>
                  </div>
                  <div class="document-content">
                    <h3>User Manual</h3>
                    <p>Complete user guide and instructions</p>
                    <div class="document-meta">
                      <span class="file-type">PDF</span>
                      <span class="file-size">2.4 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- QR Code Tab -->
          <div v-if="activeTab === 'qrcode'" class="tab-content active">
            <div class="qrcode-card">
              <div class="card-header">
                <h3 class="card-title">QR Code</h3>
              </div>
              
              <div v-if="qrCodeUrl" class="qr-display">
                <div class="qr-code-container">
                  <qrcode-vue :value="qrCodeUrl" :size="qrCodeSize" level="H" render-as="svg" />
                </div>
                <h3>Product QR Code</h3>
                <p>Scan this QR code to quickly access product information.</p>
                <div class="qr-actions">
                  <button class="qr-action-btn" @click="downloadQRCode">
                    <i class="fas fa-download"></i>
                    Download
                  </button>
                  <button class="qr-action-btn" @click="printQRCode">
                    <i class="fas fa-print"></i>
                    Print
                  </button>
                </div>
              </div>
              
              <div v-else class="qr-generator">
                <div class="qr-placeholder">
                  <i class="fas fa-qrcode"></i>
                </div>
                <h3>Product QR Code</h3>
                <p>Scan this QR code to quickly access product information.</p>
                <div class="qr-actions">
                  <button class="qr-action-btn" @click="generateQRCode" :disabled="isGeneratingQR">
                    <i class="fas fa-download"></i>
                    {{ isGeneratingQR ? 'Generating...' : 'Download' }}
                  </button>
                  <button class="qr-action-btn" @click="printQRCode">
                    <i class="fas fa-print"></i>
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <div class="fab-container" :class="{ 'hidden': !showFab }">
      <button class="fab-main" @click="showAddProductOptions" title="Add Devices">
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <!-- Add Options Modal -->
    <div v-if="showAddOptions" class="modal-overlay" @click="closeAddOptions">
      <div class="modal-container add-options-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <i class="fas fa-plus-circle"></i>
            <h3>Add New Assets</h3>
          </div>
          <button class="modal-close" @click="closeAddOptions">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="add-option" @click="navigateToManualEntry">
            <div class="option-icon manual-icon">
              <i class="fas fa-edit"></i>
            </div>
            <div class="option-content">
              <h4>Manual Entry</h4>
              <p>Add Assets one by one with detailed information</p>
            </div>
            <div class="option-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
          
          <div class="add-option" @click="navigateToBulkUpload">
            <div class="option-icon bulk-icon">
              <i class="fas fa-upload"></i>
            </div>
            <div class="option-content">
              <h4>Bulk Upload</h4>
              <p>Import multiple Assets from CSV or Excel file</p>
            </div>
            <div class="option-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="success-toast" :class="{ 'show': showSuccessToast }">
      <div class="toast-content">
        <i class="fas fa-check-circle"></i>
        <span>{{ successMessage }}</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="error-alert">
      <div class="alert-content">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ errorMessage }}</span>
      </div>
      <button class="alert-close" @click="errorMessage = null">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { ProductService, CategoryService, FileService } from '../productservices/ProductService';
import { useRouter } from 'vue-router';

export default {
  name: 'ProductDetailScreen',
  components: {
    QrcodeVue
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    // Services
    const productService = new ProductService();
    const categoryService = new CategoryService();
    
    // State variables
    const product = ref(null);
    const category = ref(null);
    const isLoading = ref(true);
    const isGeneratingQR = ref(false);
    const isCategoryLoading = ref(true);
    const qrCodeUrl = ref(null);
    const errorMessage = ref(null);
    const loadingMessage = ref(null);
    const imageError = ref(false);
    const showFab = ref(true);
    const activeTab = ref('details');
    const tabsSticky = ref(false);
    const serialNumbers = ref([]);
    const isLoadingSerialNumbers = ref(true);
    const serialNumbersError = ref(null);
    const showDeviceModal = ref(false);
    const showAddOptions = ref(false);
    const showConfirmDialog = ref(false);
    const selectedDevice = ref({ id: '', status: '' });
    const qrCodeRef = ref(null);
    const tabsNav = ref(null);
    const windowWidth = ref(window.innerWidth);
    const qrCodeSize = ref(150);
    const scrollPosition = ref(0);
    const lastScrollY = ref(0);
    const showSuccessToast = ref(false);
    const successMessage = ref('');
    
    // Constants
    const token = "bennGJlPG_qUNKhCSE9WFUo6G_RnQAts" || "";
    const tabs = ['Asset Information', 'Documents', 'QR Code'];
    const tabValues = ['details', 'documents', 'qrcode'];
    
    // Computed properties
    const hasDocuments = computed(() => {
      return product.value && (
        product.value.manual || 
        product.value.warrantyDocument || 
        product.value.technicalDocument
      );
    });
    
    const documentCount = computed(() => {
      if (!product.value) return 0;
      
      let count = 0;
      if (product.value.manual) count++;
      if (product.value.warrantyDocument) count++;
      if (product.value.technicalDocument) count++;
      
      return count;
    });
    
    const displayedSerialNumbers = computed(() => {
      return serialNumbers.value.slice(0, 2);
    });
    
    const isMobile = computed(() => {
      return windowWidth.value < 640;
    });
    
    // Router
    const router = useRouter();
    
    // Methods
    const getTabIcon = (tabValue) => {
      switch (tabValue) {
        case 'details': return 'fas fa-info-circle';
        case 'documents': return 'fas fa-file-alt';
        case 'qrcode': return 'fas fa-qrcode';
        default: return 'fas fa-circle';
      }
    };

    const loadProduct = async () => {
      isLoading.value = true;
      try {
        const products = await productService.getProducts('e988162f-6731-4b30-9c4f-f0790fdeb1e8');
        product.value = products.find(p => p.id === props.id);
        
        if (!product.value) {
          throw new Error('Product not found');
        }
        
        loadCategory();
        fetchSerialNumbers();
      } catch (error) {
        console.error('Error loading product:', error);
        errorMessage.value = `Failed to load product: ${error.message}`;
      } finally {
        isLoading.value = false;
      }
    };
    
    const loadCategory = async () => {
      if (!product.value || !product.value.category) {
        isCategoryLoading.value = false;
        return;
      }
      
      try {
        const categories = await categoryService.getCategories(product.value.tenant);
        category.value = categories.find(cat => cat.id === product.value.category);
      } catch (error) {
        console.error('Error loading category:', error);
      } finally {
        isCategoryLoading.value = false;
      }
    };
    
    const fetchSerialNumbers = async () => {
      if (!product.value || !product.value.productId) {
        serialNumbers.value = [];
        isLoadingSerialNumbers.value = false;
        return;
      }
      
      try {
        const url = `${import.meta.env.VITE_API_URL}/items/products?filter[_and][0][productId][_eq]=${product.value.productId}&fields=serialNumber,status`;
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load serial numbers: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const products = data.data;
        serialNumbers.value = products
          .filter(p => p.serialNumber && p.serialNumber.toString().trim() !== '')
          .map(p => ({
            serialNumber: p.serialNumber.toString(),
            status: p.status || 'unassigned'
          }));
      } catch (error) {
        console.error('Error fetching serial numbers:', error);
        serialNumbersError.value = error.message;
        mockFetchSerialNumbers();
      } finally {
        isLoadingSerialNumbers.value = false;
      }
    };
    
    const mockFetchSerialNumbers = () => {
      setTimeout(() => {
        const mockSerials = [
          { serialNumber: '445676666667766667', status: 'assigned' },
          { serialNumber: '445676666667766668', status: 'active' }
        ];
        serialNumbers.value = mockSerials;
        serialNumbersError.value = null;
      }, 1000);
    };
    
    const handleImageError = () => {
      imageError.value = true;
    };
    
    const getDeviceStatus = (serialNumber) => {
      const device = serialNumbers.value.find(d => d.serialNumber === serialNumber);
      return device ? device.status : 'unassigned';
    };
    
    const getDeviceStatusClass = (serialNumber) => {
      const status = getDeviceStatus(serialNumber).toLowerCase();
      
      switch (status) {
        case 'assigned': return 'status-assigned';
        case 'active': return 'status-active';
        case 'unassigned': return 'status-unassigned';
        case 'maintenance': return 'status-maintenance';
        default: return 'status-offline';
      }
    };
    
    const getRandomDate = () => {
      return '18/06/2025';
    };
    
    const setActiveTab = (tab) => {
      activeTab.value = tab;
    };
    
    const showDeviceDetails = (serialNumber, status) => {
      selectedDevice.value = {
        id: serialNumber,
        status: status
      };
      showDeviceModal.value = true;
    };
    
    const showAddProductOptions = () => {
      showAddOptions.value = true;
    };
    
    const closeAddOptions = () => {
      showAddOptions.value = false;
    };
    
    const navigateToManualEntry = () => {
      closeAddOptions();
      router.push({
        name: 'ManualEntry',
        query: {
          tenantId: product.value.tenant,
          userId: 'current_user_id',
          productId: product.value.id,
          from: 'product',
        }
      });
    };
    
    const navigateToBulkUpload = () => {
      closeAddOptions();
      router.push({
        name: 'BulkUpload',
        query: {
          tenantId: product.value.tenant,
          userId: 'current_user_id',
          productId: product.value.productId,
          from: 'product',
        }
      });
    };
    
    const viewAllDevices = () => {
      const devicesList = serialNumbers.value.map(device => ({
        serialNumber: device.serialNumber,
        status: device.status
      }));
      
      router.push({
        name: 'DeviceList',
        params: { productId: product.value.productId },
        query: {
          productName: product.value.productName,
          devices: encodeURIComponent(JSON.stringify(devicesList)),
          status: product.value.status
        }
      });
    };
    
    const generateQRCode = () => {
      isGeneratingQR.value = true;
      
      setTimeout(() => {
        const qrContent = `Product: ${product.value.productName}\nModel: ${product.value.productId || 'Not specified'}`;
        qrCodeUrl.value = qrContent;
        isGeneratingQR.value = false;
        showSuccessMessage('QR code generated successfully');
      }, 1500);
    };
    
    const shareQRCode = async () => {
      try {
        showSuccessMessage(`QR code shared for ${product.value.productName}`);
      } catch (error) {
        console.error('Error sharing QR code:', error);
        errorMessage.value = `Error sharing QR code: ${error.message}`;
      }
    };
    
    const downloadQRCode = () => {
      showSuccessMessage('QR code downloaded successfully');
    };
    
    const printQRCode = () => {
      showSuccessMessage('QR code sent to printer');
    };
    
    const shareProductDetails = () => {
      showSuccessMessage('Product details shared successfully');
    };
    
    const navigateToEdit = () => {
      if (product.value && product.value.id) {
        window.location.href = `/taskManagement/productviews/edit/${product.value.id}`;
      } else {
        alert('Product ID not available');
      }
    };
    
    const goBack = () => {
      window.history.back();
    };
    
    const showSuccessMessage = (message) => {
      successMessage.value = message;
      showSuccessToast.value = true;
      setTimeout(() => {
        showSuccessToast.value = false;
      }, 3000);
    };
    
    const handleResize = () => {
      windowWidth.value = window.innerWidth;
      updateQRCodeSize();
    };
    
    const updateQRCodeSize = () => {
      if (windowWidth.value < 640) {
        qrCodeSize.value = 120;
      } else if (windowWidth.value < 1024) {
        qrCodeSize.value = 150;
      } else {
        qrCodeSize.value = 180;
      }
    };
    
    const handleScroll = () => {
      scrollPosition.value = window.scrollY;
      
      const direction = scrollPosition.value > lastScrollY.value ? 'down' : 'up';
      
      if (direction === 'down' && showFab.value) {
        showFab.value = false;
      } else if (direction === 'up' && !showFab.value) {
        showFab.value = true;
      }
      
      lastScrollY.value = scrollPosition.value;
    };
    
    // Lifecycle hooks
    onMounted(() => {
      loadProduct();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      handleResize();
    });
    
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    });
    
    return {
      product,
      category,
      isLoading,
      isGeneratingQR,
      isCategoryLoading,
      qrCodeUrl,
      errorMessage,
      loadingMessage,
      imageError,
      showFab,
      activeTab,
      tabsSticky,
      serialNumbers,
      isLoadingSerialNumbers,
      serialNumbersError,
      showDeviceModal,
      showAddOptions,
      showConfirmDialog,
      selectedDevice,
      qrCodeRef,
      tabsNav,
      windowWidth,
      qrCodeSize,
      showSuccessToast,
      successMessage,
      token,
      tabs,
      tabValues,
      hasDocuments,
      documentCount,
      displayedSerialNumbers,
      isMobile,
      getTabIcon,
      handleImageError,
      getDeviceStatus,
      getDeviceStatusClass,
      getRandomDate,
      setActiveTab,
      showDeviceDetails,
      showAddProductOptions,
      closeAddOptions,
      navigateToManualEntry,
      navigateToBulkUpload,
      viewAllDevices,
      generateQRCode,
      shareQRCode,
      downloadQRCode,
      printQRCode,
      shareProductDetails,
      navigateToEdit,
      goBack,
      showSuccessMessage,
      fetchSerialNumbers,
      router
    };
  }
};
</script>

<style scoped>
/* Import Font Awesome */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Base Styles */
.product-detail-screen {

  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Header */
.header {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  color: #68ade1;
  padding: 0.5rem;
  border-radius: 50%;
  border: none;
  background: none;
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f3f4f6;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #68ade1;
  border-radius: 50%;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: #6b7280;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #68ade1;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #68ade1;
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  } 40% {
    transform: scale(1);
  }
}

.loading-text {
  font-size: 1.125rem;
  font-weight: 500;
}

/* Main Layout */
.main-layout {
  display: flex;
  min-height: calc(100vh - 80px);
}

/* Sidebar */
.sidebar {
  background: white;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.sidebar-nav {
  padding: 1rem 0;
}

.sidebar-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  border-left: 3px solid transparent;
}

.sidebar-item:hover {
  background-color: #f9fafb;
  color: #374151;
}

.sidebar-item.active {
  background-color: #eff6ff;
  color: #68ade1;
  border-left-color: #68ade1;
}

.sidebar-item i {
  width: 1.25rem;
  font-size: 1rem;
}

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
}

/* Asset Profile Section */
.asset-profile-section {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  text-align: center;
}

.asset-image-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #68ade1;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.asset-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.asset-placeholder {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
}

.asset-info {
  text-align: center;
}

.asset-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.asset-model {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.model-hash {
  color: #68ade1;
  margin-right: 0.25rem;
}

.asset-category {
  display: flex;
  justify-content: center;
}

.category-badge {
  background: #68ade1;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

/* Content Area */
.content-area {
  flex: 1;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

/* Card Styles */
.info-card, .installation-card, .documents-card, .qrcode-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.card-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.device-count-badge {
  background: #68ade1;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

/* Info Grid */
.info-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.field-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-assigned {
  background: #f3f4f6;
  color: #6b7280;
}

.status-unassigned {
  background: #fef3c7;
  color: #92400e;
}

/* Installation Content */
.installation-content {
  padding: 1rem 1.5rem 1.5rem;
}

.installation-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

/* Loading and Error States */
.loading-devices, .error-state, .empty-devices {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.error-icon, .empty-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.empty-icon {
  background: #f3f4f6;
  color: #6b7280;
}

.error-state h3, .empty-devices h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.error-state p, .empty-devices p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}

.retry-btn, .add-device-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #68ade1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover, .add-device-btn:hover {
  background: #5a9cd0;
}

/* Table */
.devices-table {
  overflow-x: auto;
}

.table {
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table-header {
  background: #f9fafb;
}

.table-th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
}

.table-body {
  background: white;
}

.table-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.table-row:hover {
  background: #f9fafb;
}

.table-td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #374151;
}

.action-more-btn {
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.action-more-btn:hover {
  background: #f3f4f6;
  color: #68ade1;
}

.table-footer {
  padding: 1rem 1.5rem;
}

.view-all-btn {
  width: 100%;
  background: #68ade1;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  font-size: 0.875rem;
}

.view-all-btn:hover {
  background: #5a9cd0;
}

/* Documents Section */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-state .empty-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}

.add-document-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #68ade1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-document-btn:hover {
  background: #5a9cd0;
}

.documents-grid {
  padding: 1.5rem;
}

.document-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.document-card:hover {
  border-color: #68ade1;
  box-shadow: 0 4px 12px rgba(104, 173, 225, 0.1);
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.document-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: #68ade1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.doc-action-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.doc-action-btn:hover {
  background: #e5e7eb;
  color: #68ade1;
}

.document-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.document-content p {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
}

.document-meta {
  display: flex;
  gap: 1rem;
}

.file-type, .file-size {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

/* QR Code Section */
.qr-display, .qr-generator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.qr-code-container {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.qr-placeholder {
  width: 10rem;
  height: 10rem;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.qr-placeholder i {
  font-size: 2rem;
  color: #6b7280;
}

.qr-display h3, .qr-generator h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.qr-display p, .qr-generator p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}

.qr-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.qr-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.qr-action-btn:hover {
  background: #f9fafb;
  border-color: #68ade1;
  color: #68ade1;
}

.qr-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Floating Action Button */
.fab-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  transition: all 0.3s ease;
}

.fab-container.hidden {
  opacity: 0;
  transform: translateY(100px);
  pointer-events: none;
}

.fab-main {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: #68ade1;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(104, 173, 225, 0.4);
  transition: all 0.3s ease;
}

.fab-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(104, 173, 225, 0.6);
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
  z-index: 2000;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-title i {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: #68ade1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.modal-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
}

.modal-content {
  padding: 0 1.5rem 1.5rem;
}

.add-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  border: 2px solid transparent;
}

.add-option:hover {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.option-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.manual-icon {
  background: #68ade1;
}

.bulk-icon {
  background: #059669;
}

.option-content {
  flex: 1;
}

.option-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.option-content p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.option-arrow {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-option:hover .option-arrow {
  background: #e5e7eb;
  transform: translateX(2px);
}

/* Alerts and Toasts */
.error-alert, .success-toast {
  position: fixed;
  top: 120px;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  font-size: 0.875rem;
}

.error-alert {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.success-toast {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease;
}

.success-toast.show {
  opacity: 1;
  transform: translateX(0);
}

.alert-content, .toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.alert-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem 0;
  }
  
  .sidebar-item {
    flex-shrink: 0;
    border-left: none;
    border-bottom: 3px solid transparent;
    padding: 0.75rem 1rem;
  }
  
  .sidebar-item.active {
    border-left: none;
    border-bottom-color: #68ade1;
  }
  
  .main-content {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .asset-image-container {
    width: 100px;
    height: 100px;
  }
  
  .asset-name {
    font-size: 1.25rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .fab-container {
    bottom: 1rem;
    right: 1rem;
  }
  
  .fab-main {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }
  
  .modal-container {
    width: 95%;
    margin: 1rem;
  }
  
  .error-alert, .success-toast {
    right: 1rem;
    left: 1rem;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 1rem;
  }
  
  .header-title {
    font-size: 1.25rem;
  }
  
  .asset-profile-section {
    padding: 1.5rem;
  }
  
  .asset-image-container {
    width: 80px;
    height: 80px;
  }
  
  .asset-name {
    font-size: 1.125rem;
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .info-grid {
    padding: 1rem;
  }
  
  .installation-content {
    padding: 1rem;
  }
}
</style>

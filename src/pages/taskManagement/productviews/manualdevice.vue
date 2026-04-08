
<template>
  <div class="app-container">
    <!-- Main Content -->
    <main class="main-content">
      <div class="form-container">
        <div class="form-header">
          <button
            type="button"
            class="back-btn"
            @click="handleBack()"
            title="Back to Product Management"
          >
            <i class="ri-arrow-left-line"></i>
            
          </button>
          <h1 class="form-title">Add New Asset</h1>
        </div>

        <form @submit.prevent="submitAsset" class="asset-form">
          <!-- Basic Information -->
          <div class="form-grid">
            <div class="form-group">
              <label for="productName" class="form-label">Product Name</label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="productName"
                  v-model="productName"
                  class="form-input"
                  :placeholder="isLoadingProduct ? 'Loading product name...' : 'Product name'"
                  readonly
                >
                <div class="input-icon">
                  <i class="ri-shopping-bag-line"></i>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="serialNumber" class="form-label">Serial Number</label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="serialNumber"
                  v-model="serialNumber"
                  class="form-input"
                  placeholder="Enter serial number"
                  required
                >
                <div class="input-icon">
                  <i class="ri-barcode-line"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Asset Image -->
          <div class="section">
            <h2 class="section-title">Asset Image</h2>
            <div
              class="image-upload-area"
              :class="{ 'drag-over': isDragOver }"
              @click="triggerImageUpload()"
              @dragenter="handleDragEnter"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleImageDrop"
            >
              <div v-if="!imagePreviewUrl" class="upload-placeholder">
                <div class="upload-icon">
                  <i class="ri-image-add-line"></i>
                </div>
                <p class="upload-text">Drag & drop asset image here</p>
                <p class="upload-subtext">or click to browse files</p>
                <button
                  type="button"
                  class="browse-btn"
                  @click.stop="triggerImageUpload()"
                >
                  <i class="ri-upload-2-line"></i>
                  <span>Browse Files</span>
                </button>
                <p class="file-info">Supported formats: JPEG, PNG, WebP. Max size: 5MB</p>
              </div>
              <div v-else class="image-preview" :class="{ 'show': imagePreviewUrl }">
                <div class="preview-container">
                  <img :src="imagePreviewUrl" alt="Asset preview" class="preview-image">
                  <button
                    type="button"
                    class="remove-image-btn"
                    @click.stop="removeImage()"
                  >
                    <i class="ri-close-line"></i>
                  </button>
                </div>
              </div>
              <div class="progress-container">
                <div class="progress-bar" :style="{ width: imageUploadProgress + '%' }"></div>
              </div>
            </div>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="handleImageSelect"
            >
            <p v-if="imageError" class="error-message">{{ imageError }}</p>
          </div>

          <!-- Asset Documents -->
          <div class="section">
            <h2 class="section-title">Asset Documents</h2>
            <div class="documents-grid">
              <!-- User Manual -->
              <div class="document-card">
                <div class="document-upload">
                  <div class="document-icon document-icon-blue">
                    <i class="ri-file-text-line"></i>
                  </div>
                  <p class="document-title">User Manual</p>
                  <p class="document-subtitle">Upload PDF, DOC, or DOCX</p>
                  <button
                    type="button"
                    class="upload-doc-btn"
                    @click="triggerDocumentUpload('manual')"
                  >
                    <i class="ri-upload-2-line"></i>
                    <span>Upload</span>
                  </button>
                  <input
                    ref="manualInput"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    class="hidden-input"
                    @change="handleDocumentSelect('manual', $event)"
                  >
                </div>
                <div v-if="manualFileName" class="document-files">
                  <div class="file-item" :class="{ 'show': manualFileName }">
                    <div class="file-info">
                      <div class="file-icon">
                        <i :class="getFileIcon(manualFileName)" :style="{ color: getFileColor(manualFileName) }"></i>
                      </div>
                      <div class="file-details">
                        <p class="file-name">{{ manualFileName }}</p>
                        <p class="file-size">{{ getFileSize(manualFile) }}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="remove-file-btn"
                      @click="removeDocument('manual')"
                    >
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Specification Sheet -->
              <div class="document-card">
                <div class="document-upload">
                  <div class="document-icon document-icon-green">
                    <i class="ri-file-list-3-line"></i>
                  </div>
                  <p class="document-title">Specification Sheet</p>
                  <p class="document-subtitle">Upload PDF, XLS, or XLSX</p>
                  <button
                    type="button"
                    class="upload-doc-btn"
                    @click="triggerDocumentUpload('warranty')"
                  >
                    <i class="ri-upload-2-line"></i>
                    <span>Upload</span>
                  </button>
                  <input
                    ref="warrantyInput"
                    type="file"
                    accept=".pdf,.xls,.xlsx"
                    class="hidden-input"
                    @change="handleDocumentSelect('warranty', $event)"
                  >
                </div>
                <div v-if="warrantyFileName" class="document-files">
                  <div class="file-item" :class="{ 'show': warrantyFileName }">
                    <div class="file-info">
                      <div class="file-icon">
                        <i :class="getFileIcon(warrantyFileName)" :style="{ color: getFileColor(warrantyFileName) }"></i>
                      </div>
                      <div class="file-details">
                        <p class="file-name">{{ warrantyFileName }}</p>
                        <p class="file-size">{{ getFileSize(warrantyFile) }}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="remove-file-btn"
                      @click="removeDocument('warranty')"
                    >
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Warranty Certificate -->
              <div class="document-card">
                <div class="document-upload">
                  <div class="document-icon document-icon-purple">
                    <i class="ri-file-paper-2-line"></i>
                  </div>
                  <p class="document-title">Warranty Certificate</p>
                  <p class="document-subtitle">Upload PDF or JPG</p>
                  <button
                    type="button"
                    class="upload-doc-btn"
                    @click="triggerDocumentUpload('technical')"
                  >
                    <i class="ri-upload-2-line"></i>
                    <span>Upload</span>
                  </button>
                  <input
                    ref="technicalInput"
                    type="file"
                    accept=".pdf,.jpg,.jpeg"
                    class="hidden-input"
                    @change="handleDocumentSelect('technical', $event)"
                  >
                </div>
                <div v-if="technicalFileName" class="document-files">
                  <div class="file-item" :class="{ 'show': technicalFileName }">
                    <div class="file-info">
                      <div class="file-icon">
                        <i :class="getFileIcon(technicalFileName)" :style="{ color: getFileColor(technicalFileName) }"></i>
                      </div>
                      <div class="file-details">
                        <p class="file-name">{{ technicalFileName }}</p>
                        <p class="file-size">{{ getFileSize(technicalFile) }}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="remove-file-btn"
                      @click="removeDocument('technical')"
                    >
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-if="documentError" class="error-message">{{ documentError }}</p>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button
              type="button"
              class="cancel-btn"
              @click="handleCancel()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="submit-btn"
              :disabled="isSubmitting || isLoadingProduct"
              :class="{ 'loading': isSubmitting }"
            >
              <i v-if="isSubmitting" class="ri-loader-4-line animate-spin"></i>
              <i v-else class="ri-save-line"></i>
              <span>{{ isSubmitting ? 'Saving...' : 'Save Asset' }}</span>
            </button>
          </div>
        </form>

        <!-- Error Message -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </main>

    <!-- Success Notification -->
    <div v-if="showSuccessMessage" class="success-notification" :class="{ 'show': showSuccessMessage }">
      <div class="success-icon">
        <i class="ri-check-line"></i>
      </div>
      <div class="success-content">
        <h3 class="success-title">Success!</h3>
        <p class="success-text">Asset has been successfully added to the inventory.</p>
      </div>
      <button class="success-close" @click="hideSuccessMessage()">
        <i class="ri-close-line"></i>
      </button>
    </div>
  </div>
</template>
<script>
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

class FileService {
  static baseUrl = `${import.meta.env.VITE_API_URL}`;
  static MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static async uploadImage(file, token) {
    try {
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error('File size exceeds maximum limit of 10MB');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/files?access_token=${token}`, {
        method: 'POST',
        headers: {
          // 'Content-Type' is not set explicitly for FormData
     
        },
        body: formData
      });

      if (!response.ok) {
        console.error('Failed to upload image. Status code:', response.status);
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const data = await response.json();
      const fileId = data.data.id;
      console.log('Image uploaded successfully with ID:', fileId);
      return fileId;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  static async uploadFile(file, token) {
    try {
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error('File size exceeds maximum limit of 10MB');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/files?access_token=${token}`, {
        method: 'POST',
        headers: {
          // 'Content-Type' is not set explicitly for FormData
       
        },
        body: formData
      });

      if (!response.ok) {
        console.error('Failed to upload file. Status code:', response.status);
        throw new Error(`Failed to upload file: ${response.status}`);
      }

      const data = await response.json();
      const fileId = data.data.id;
      console.log('File uploaded successfully with ID:', fileId);
      return fileId;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }
}

export default {
  name: 'AddAssetManual',
  props: {
    productId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      productName: '',
      serialNumber: '',
      isSubmitting: false,
      isLoadingProduct: false,
      showSuccessMessage: false,
      errorMessage: null,
      imageFile: null,
      imagePreviewUrl: null,
      imageUploadProgress: 0,
      isDragOver: false,
      imageError: null,
      documentError: null,
      manualFile: null,
      manualFileName: null,
      warrantyFile: null,
      warrantyFileName: null,
      technicalFile: null,
      technicalFileName: null,
      currentDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      token: null,
      tenantId: null
    };
  },
  async created() {
    try {
      // Get token
      this.token = await authService.getToken();
      if (!this.token) {
        this.errorMessage = 'Authentication token is missing. Please log in again.';
        return;
      }

      // Get tenantId
      this.tenantId = await currentUserTenant.getTenantIdAsync();
      if (!this.tenantId) {
        this.errorMessage = 'Tenant information is missing. Please log in again.';
        return;
      }

      // Fetch product details using productId
      await this.fetchProductDetails();
    } catch (error) {
      console.error('Error initializing component:', error);
      this.errorMessage = 'Failed to initialize. Please try again.';
    }
  },
  methods: {
     handleBack() {
      if (confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
        this.$router.push(`/taskManagement/productviews/deviceManagementScreen`);
      }
    },
    async fetchProductDetails() {
      this.isLoadingProduct = true;
      this.errorMessage = null;
      try {
        if (!this.tenantId) {
          throw new Error('Tenant ID is not available.');
        }

        const url = `${import.meta.env.VITE_API_URL}/items/products?filter[_and][0][tenant][tenantId][_eq]=${encodeURIComponent(this.tenantId)}&filter[_and][1][productId][_eq]=${encodeURIComponent(this.productId)}&fields=productName`;
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to view this product.');
          }
          throw new Error(`Failed to fetch product details: ${response.status}`);
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
          this.productName = data.data[0].productName || 'Unknown Product';
        } else {
          this.errorMessage = 'Product not found.';
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        this.errorMessage = `Failed to fetch product details: ${error.message}`;
      } finally {
        this.isLoadingProduct = false;
      }
    },

    // Image upload methods
    triggerImageUpload() {
      this.$refs.imageInput.click();
    },

    handleImageSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.handleImageFile(file);
      }
    },

    handleDragEnter(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isDragOver = true;
    },

    handleDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
    },

    handleDragLeave(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isDragOver = false;
    },

    handleImageDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isDragOver = false;

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        this.handleImageFile(files[0]);
      }
    },

handleImageFile(file) {
  this.imageError = null;

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    this.imageError = 'Please select a valid image file (JPEG, PNG, WebP)';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    this.imageError = 'File size exceeds 5MB limit';
    return;
  }

  this.imageFile = file;
  
  // Create preview immediately
  const reader = new FileReader();
  reader.onload = (event) => {
    this.imagePreviewUrl = event.target.result;
    // Now simulate upload after preview is shown
    this.simulateImageUpload();
  };
  reader.onerror = (error) => {
    console.error('FileReader error:', error);
    this.imageError = 'Failed to read the image file';
  };
  reader.readAsDataURL(file);
},
    simulateImageUpload() {
      this.imageUploadProgress = 0;

      const interval = setInterval(() => {
        this.imageUploadProgress += 5;

        if (this.imageUploadProgress >= 100) {
          clearInterval(interval);
          console.log('Image upload simulated successfully');
        }
      }, 50);
    },

    removeImage() {
      this.imageFile = null;
      this.imagePreviewUrl = null;
      this.imageUploadProgress = 0;
      this.$refs.imageInput.value = '';
    },

    // Document upload methods
    triggerDocumentUpload(type) {
      this.$refs[`${type}Input`].click();
    },

    handleDocumentSelect(type, event) {
      const file = event.target.files[0];
      if (file) {
        this.handleDocumentFile(file, type);
      }
    },

    handleDocumentFile(file, type) {
      this.documentError = null;

      let validExtensions = [];
      if (type === 'manual') {
        validExtensions = ['pdf', 'doc', 'docx'];
      } else if (type === 'warranty') {
        validExtensions = ['pdf', 'xls', 'xlsx'];
      } else if (type == 'technical') {
        validExtensions = ['pdf', 'jpg', 'jpeg'];
      }

      const extension = file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(extension)) {
        this.documentError = `Invalid file type for ${type}. Allowed: ${validExtensions.join(', ').toUpperCase()}`;
        return;
      }

      this[`${type}File`] = file;
      this[`${type}FileName`] = file.name;
    },

    removeDocument(type) {
      this[`${type}File`] = null;
      this[`${type}FileName`] = null;
      this.$refs[`${type}Input`].value = '';
    },

    getFileIcon(filename) {
      const extension = filename.split('.').pop().toUpperCase();
      const iconMap = {
        'PDF': 'ri-file-pdf-line',
        'DOC': 'ri-file-word-line',
        'DOCX': 'ri-file-word-line',
        'XLS': 'ri-file-excel-line',
        'XLSX': 'ri-file-excel-line',
        'JPG': 'ri-image-line',
        'JPEG': 'ri-image-line',
        'PNG': 'ri-image-line'
      };
      return iconMap[extension] || 'ri-file-text-line';
    },

    getFileColor(filename) {
      const extension = filename.split('.').pop().toUpperCase();
      const colorMap = {
        'PDF': '#ef4444',
        'DOC': '#3b82f6',
        'DOCX': '#3b82f6',
        'XLS': '#10b981',
        'XLSX': '#10b981',
        'JPG': '#8b5cf6',
        'JPEG': '#8b5cf6',
        'PNG': '#8b5cf6'
      };
      return colorMap[extension] || '#6b7280';
    },

    getFileSize(file) {
      if (!file) return '';
      const bytes = file.size;
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    async uploadDocuments() {
      const uploadedIds = {};
      if (this.manualFile) {
        uploadedIds.manual = await FileService.uploadFile(this.manualFile, this.token);
        if (!uploadedIds.manual) {
          throw new Error('Failed to upload user manual.');
        }
      }
      if (this.warrantyFile) {
        uploadedIds.warranty = await FileService.uploadFile(this.warrantyFile, this.token);
        if (!uploadedIds.warranty) {
          throw new Error('Failed to upload specification sheet.');
        }
      }
      if (this.technicalFile) {
        uploadedIds.technical = await FileService.uploadFile(this.technicalFile, this.token);
        if (!uploadedIds.technical) {
          throw new Error('Failed to upload warranty certificate.');
        }
      }
      return uploadedIds;
    },

    async submitAsset() {
      if (!this.serialNumber) {
        this.errorMessage = 'Please enter a serial number.';
        return;
      }

      if (!this.productName) {
        this.errorMessage = 'Product name is missing. Please try again.';
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = null;

      try {
        // Upload image and documents
        let imageId = null;
        if (this.imageFile) {
          imageId = await FileService.uploadImage(this.imageFile, this.token);
          if (!imageId) {
            throw new Error('Failed to upload image.');
          }
        }

        const uploadedDocIds = await this.uploadDocuments();

        const url = `${import.meta.env.VITE_API_URL}/items/products`;
        const payload = {
          productId: this.productId,
          productName: this.productName,
          serialNumber: this.serialNumber,
          tenant: this.tenantId,
          status: 'draft',
          product: imageId || null,
          manual: uploadedDocIds.manual || null,
          warrantyDocument: uploadedDocIds.warranty || null,
          technicalDocument: uploadedDocIds.technical || null
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify(payload)
        });

        console.log('Payload:', JSON.stringify(payload, null, 2));

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to add an asset.');
          }
          throw new Error(`Failed to save asset: ${response.status}`);
        }

        this.showSuccessNotification();
        this.$emit('asset-added');
        // Reset form after success
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      } catch (error) {
        console.error('Error during submission:', error);
        this.errorMessage = `Error: ${error.message}`;
      } finally {
        this.isSubmitting = false;
      }
    },

    handleCancel() {
      if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
        this.resetForm();
        this.$emit('cancel');
        this.$router.push({ name: 'ProductManagement' });
      }
    },

    resetForm() {
      this.serialNumber = '';
      this.imageFile = null;
      this.imagePreviewUrl = null;
      this.imageUploadProgress = 0;
      this.manualFile = null;
      this.manualFileName = null;
      this.warrantyFile = null;
      this.warrantyFileName = null;
      this.technicalFile = null;
      this.technicalFileName = null;
      this.imageError = null;
      this.documentError = null;
      this.errorMessage = null;
    },

    showSuccessNotification() {
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.hideSuccessMessage();
        this.$router.push({ name: 'ProductManagement' });
      }, 3000);
    },

    hideSuccessMessage() {
      this.showSuccessMessage = false;
    }
  }
};
</script>

<style scoped>
/* Import Remix Icons */
@import url('https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Base Styles */
.app-container {
  background-color: #f9fafb;

}

/* Main Content */
.main-content {
  max-width: 100%;
  margin: 0;
  overflow: auto;
}

.form-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
  margin-left: auto;
  margin-right: auto;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.back-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  color: #374151;
  background: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #f9fafb;
}

/* Form Styles */
.asset-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  outline: none;
}

.form-input[readonly] {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-input:focus {
  border-color: #4361ee;
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.input-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0.75rem;
  color: #6b7280;
  font-size: 1rem;
}

/* Image Upload Styles */
.image-upload-area {
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-area:hover {
  border-color: #4361ee;
}

.image-upload-area.drag-over {
  border-color: #4361ee;
  background-color: rgba(67, 97, 238, 0.05);
}

.upload-placeholder {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(67, 97, 238, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.upload-icon i {
  color: #4361ee;
  font-size: 1.5rem;
}

.upload-text {
  color: #374151;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.upload-subtext {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.browse-btn {
  padding: 0.5rem 1rem;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.browse-btn:hover {
  background: #3730a3;
}

.file-info {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 1rem;
  text-align: center;
}

.image-preview {
  position: relative;
  background: white;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  max-height: 300px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview.show {
  opacity: 1;
}

.preview-container {
  position: relative;
}

.preview-image {
  max-height: 200px;
  border-radius: 0.375rem;
  object-fit: contain;
}

.remove-image-btn {
  position: absolute;
  top: -0.75rem;
  right: -0.75rem;
  width: 2rem;
  height: 2rem;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.remove-image-btn:hover {
  color: #ef4444;
}

.progress-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0.25rem;
  background: #f3f4f6;
}

.progress-bar {
  height: 100%;
  background: #4361ee;
  transition: width 0.3s ease;
}

/* Document Upload Styles */
.documents-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .documents-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.document-card {
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.document-card:hover {
  border-color: #4361ee;
}

.document-upload {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.document-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.document-icon-blue {
  background: #dbeafe;
  color: #3b82f6;
}

.document-icon-green {
  background: #dcfce7;
  color: #16a34a;
}

.document-icon-purple {
  background: #f3e8ff;
  color: #8b5cf6;
}

.document-icon i {
  font-size: 1.25rem;
}

.document-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.document-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  text-align: center;
}

.upload-doc-btn {
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-doc-btn:hover {
  background: #f9fafb;
}

.document-files {
  padding: 0 1rem 1rem;
}

.file-item {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.file-item.show {
  opacity: 1;
  transform: translateY(0);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-details {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.remove-file-btn {
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.remove-file-btn:hover {
  color: #ef4444;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn, .submit-btn {
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.cancel-btn {
  border: 1px solid #d1d5db;
  color: #374151;
  background: white;
}

.cancel-btn:hover {
  background: #f9fafb;
}

.submit-btn {
  background: #4361ee;
  color: white;
  border: none;
}

.submit-btn:hover {
  background: rgba(67, 97, 238, 0.9);
}

.submit-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.submit-btn.loading {
  background: #4361ee;
}

/* Success Notification */
.success-notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: #f0fdf4;
  border-left: 4px solid #16a34a;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  display: flex;
  align-items: flex-start;
  max-width: 24rem;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.3s ease;
}

.success-notification.show {
  opacity: 1;
  transform: translateX(0);
}

.success-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #dcfce7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  margin-top: 0.125rem;
}

.success-icon i {
  color: #16a34a;
}

.success-content {
  flex: 1;
}

.success-title {
  font-weight: 500;
  color: #166534;
  margin: 0 0 0.25rem 0;
}

.success-text {
  font-size: 0.875rem;
  color: #15803d;
  margin: 0;
}

.success-close {
  margin-left: auto;
  color: #15803d;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.success-close:hover {
  color: #166534;
}

/* Utility Classes */
.hidden-input {
  display: none;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Error Messages */
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .form-container {
    padding: 1rem;
  }

  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn, .submit-btn, .back-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
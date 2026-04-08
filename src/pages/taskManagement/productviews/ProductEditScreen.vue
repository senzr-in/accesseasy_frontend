<template>
  <div class="product-edit-container">
    <!-- Sidebar Navigation -->
    

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <header class="content-header">
        <div class="header-left">
          <button class="back-button" @click="goBack" aria-label="Go back">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h1 class="page-title">{{ isEditMode ? 'Edit asset type' : 'Add New Product' }}</h1>
        </div>
        <div class="header-right">
          <span class="date-info">Today: June 20, 2025</span>
          <div class="user-info">
            <span class="user-name">KAWIN S V</span>
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- Form Content -->
      <div v-else class="form-container">
        <form @submit.prevent="submitProduct" class="product-form">
          <!-- Product Details Section -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">Asset type Details</h2>
            </div>
            <div class="card-content">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Asset type Name</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    v-model="productName" 
                    placeholder="Asset"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Model Name</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    v-model="modelNumber" 
                    placeholder="Assets-01"
                  />
                </div>
              </div>
              <div class="form-row">
                <!-- <div class="form-group">
                  <label class="form-label">Serial Number</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    v-model="serialNumber" 
                    placeholder="Enter serial number"
                  />
                </div> -->
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <div class="select-wrapper">
                    <select class="form-select" v-model="selectedCategoryId">
                      <option :value="null">mdj</option>
                      <option 
                        v-for="category in categories" 
                        :key="category.id" 
                        :value="category.id"
                      >
                        {{ category.categoryName }}
                      </option>
                    </select>
                    <i class="fas fa-chevron-down select-icon"></i>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <!-- <div class="form-group">
                  <label class="form-label">Variant</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    v-model="variant" 
                    placeholder="e.g., Standard, Pro, Lite"
                  />
                </div> -->
                <!-- <div class="form-group">
                  <label class="form-label">Device Type</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    v-model="deviceType" 
                    placeholder="e.g., Smartphone, Tablet"
                  />
                </div> -->
              </div>
              <button 
                type="button" 
                class="add-category-link" 
                @click="showAddCategoryDialog"
              >
                <i class="fas fa-plus"></i>
                Add New Category
              </button>
            </div>
          </div>

          <!-- Product Image Section -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">Asset type Image</h2>
            </div>
            <div class="card-content">
              <div class="image-upload-area">
                <div 
                  class="image-dropzone" 
                  :class="{ 'has-image': imageFile || existingImageUrl }"
                  @click="pickImage"
                  @dragover.prevent
                  @drop.prevent="handleImageDrop"
                >
                  <img 
                    v-if="imagePreview" 
                    :src="imagePreview" 
                    alt="Product preview" 
                    class="preview-image"
                  />
                  <img 
                    v-else-if="existingImageUrl" 
                    :src="`${existingImageUrl}?access_token=${token}`" 
                    alt="Product image" 
                    class="preview-image"
                    @error="handleImageError"
                  />
                  <div v-else class="dropzone-content">
                    <i class="fas fa-image dropzone-icon"></i>
                    <p class="dropzone-text">Drag & drop Asset image here</p>
                    <p class="dropzone-subtext">or click to browse files</p>
                    <p class="dropzone-format">Supported formats: JPEG, PNG, WebP. Max size: 5MB</p>
                  </div>
                  <button 
                    v-if="imageFile || existingImageUrl" 
                    type="button" 
                    class="remove-image-btn" 
                    @click.stop="removeImage"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <input 
                  type="file" 
                  ref="fileInput" 
                  accept="image/jpeg,image/png,image/webp" 
                  style="display: none" 
                  @change="onFileSelected"
                />
                <p v-if="imageError" class="error-message">{{ imageError }}</p>
              </div>
            </div>
          </div>

          <!-- Product Documents Section -->
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">Asset Documents</h2>
            </div>
            <div class="card-content">
              <div class="documents-grid">
                <!-- User Manual -->
                <div 
                  class="document-card" 
                  :class="{ 'has-file': manualFileName }"
                  @click="handleDocumentClick('manual')"
                >
                  <div class="document-icon blue">
                    <i class="fas fa-file-alt"></i>
                  </div>
                  <div class="document-info">
                    <h3 class="document-title">User Manual</h3>
                    <p class="document-status">
                      {{ manualFileName || 'Upload PDF, DOC, or DOCX' }}
                    </p>
                  </div>
                  <button 
                    v-if="manualFileName" 
                    type="button" 
                    class="remove-doc-btn" 
                    @click.stop="removeDocument('manual')"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <!-- Specification Sheet -->
                <div 
                  class="document-card" 
                  :class="{ 'has-file': technicalFileName }"
                  @click="handleDocumentClick('technical')"
                >
                  <div class="document-icon green">
                    <i class="fas fa-file-alt"></i>
                  </div>
                  <div class="document-info">
                    <h3 class="document-title">Specification Sheet</h3>
                    <p class="document-status">
                      {{ technicalFileName || 'Upload XLS, or XLSX' }}
                    </p>
                  </div>
                  <button 
                    v-if="technicalFileName" 
                    type="button" 
                    class="remove-doc-btn" 
                    @click.stop="removeDocument('technical')"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <!-- Warranty Certificate -->
                <div 
                  class="document-card" 
                  :class="{ 'has-file': warrantyFileName }"
                  @click="handleDocumentClick('warranty')"
                >
                  <div class="document-icon purple">
                    <i class="fas fa-file-alt"></i>
                  </div>
                  <div class="document-info">
                    <h3 class="document-title">Warranty Certificate</h3>
                    <p class="document-status">
                      {{ warrantyFileName || 'Upload PDF or JPG' }}
                    </p>
                  </div>
                  <button 
                    v-if="warrantyFileName" 
                    type="button" 
                    class="remove-doc-btn" 
                    @click.stop="removeDocument('warranty')"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <p v-if="documentError" class="error-message">{{ documentError }}</p>
            </div>
          </div>

          <!-- Info Message -->
          <div v-if="!isEditMode" class="info-alert">
            <i class="fas fa-info-circle"></i>
            <span>Asset will be created in "draft" status by default</span>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="goBack">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="btn-spinner"></span>
              {{ isEditMode ? 'Update' : 'Add Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddCategoryModal" class="modal-overlay" @click="showAddCategoryModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Add New Category</h3>
          <button class="modal-close" @click="showAddCategoryModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Category Name</label>
            <input 
              type="text" 
              class="form-input" 
              v-model="newCategoryName" 
              placeholder="Enter category name"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Select Icon (Optional)</label>
            <div class="icon-grid">
              <div 
                v-for="(icon, index) in iconOptions" 
                :key="index"
                class="icon-option"
                :class="{ 'selected': selectedIcon === icon }"
                @click="selectedIcon = icon"
              >
                <i :class="icon"></i>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Select Color (Optional)</label>
            <div class="color-options">
              <div 
                v-for="(color, index) in colorOptions" 
                :key="index"
                class="color-option"
                :style="{ backgroundColor: color }"
                :class="{ 'selected': selectedColor === color }"
                @click="selectedColor = color"
              >
                <i v-if="selectedColor === color" class="fas fa-check"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddCategoryModal = false">
            Cancel
          </button>
          <button 
            class="btn btn-primary" 
            @click="addCategory" 
            :disabled="!newCategoryName || isAddingCategory"
          >
            <span v-if="isAddingCategory">Adding...</span>
            <span v-else>Add Category</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ProductService, CategoryService, FileService } from '../productservices/ProductService';
import { Product, ProductCategory } from '../productmodels/Product';
import { currentUserTenant } from "@/utils/currentUserTenant";


export default {
  name: 'ProductEditScreen',
  props: {
    id: {
      type: String,
      default: null
    },
    tenantId: {
      type: String,
      default: ''
    },
    userId: {
      type: String,
      default: 'r'
    }
  },
  data() {
    return {
      // Product data
      productName: '',
      modelNumber: '',
      serialNumber: '',
      variant: '',
      deviceType: '',
      selectedCategoryId: null,
      
      // Image handling
      imageFile: null,
      imagePreview: null,
      existingImageUrl: null,
      imageError: null,
      
      // Document handling
      manualFile: null,
      warrantyFile: null,
      technicalFile: null,
      manualFileName: null,
      warrantyFileName: null,
      technicalFileName: null,
      manualId: null,
      warrantyId: null,
      technicalId: null,
      documentError: null,
      
      // UI state
      isLoading: true,
      isSubmitting: false,
      isLoadingCategories: true,
      isAddingCategory: false,
      showAddCategoryModal: false,
      
      // Categories
      categories: [],
      newCategoryName: '',
      selectedIcon: null,
      selectedColor: null,
      
      // Options for category creation
      iconOptions: [
        'fas fa-tag', 'fas fa-boxes', 'fas fa-laptop', 
        'fas fa-memory', 'fas fa-plug', 'fas fa-bolt', 
        'fas fa-battery-full', 'fas fa-mobile-alt', 
        'fas fa-desktop', 'fas fa-headphones'
      ],
      colorOptions: [
        '#00897B', '#F44336', '#4CAF50', '#FFA000', 
        '#9C27B0', '#009688', '#E91E63', '#FFC107'
      ],
      
      token: "bennGJlPG_qUNKhCSE9WFUo6G_RnQAts" || process.env.VUE_APP_API_TOKEN
    }
  },
  computed: {
    isEditMode() {
      return !!this.id;
    }
  },
  created() {
    this.productService = new ProductService();
    this.categoryService = new CategoryService();
    this.fileService = FileService;
    
    this.loadCategories();
    
    if (this.isEditMode) {
      this.loadProduct();
    } else {
      this.isLoading = false;
    }
  },
  methods: {
    async loadProduct() {
                const tenantId = currentUserTenant.getTenantId();

      try {
        const products = await this.productService.getProducts(this.tenantId);
        const product = products.find(p => p.id === this.id);
        
        if (!product) {
          throw new Error('Product not found');
        }
        
        // Set form values
        this.productName = product.productName;
        this.modelNumber = product.productId || product.modelNumber || '';
        this.serialNumber = product.serialNumber || '';
        this.variant = product.variant || '';
        this.deviceType = product.deviceType || '';
        this.selectedCategoryId = product.category;
        this.existingImageUrl = product.imageUrl;
        
        // Set document IDs and names
        if (product.manual) {
          this.manualId = product.manual;
          this.manualFileName = "Existing manual document";
        }
        
        if (product.warrantyDocument) {
          this.warrantyId = product.warrantyDocument;
          this.warrantyFileName = "Existing warranty document";
        }
        
        if (product.technicalDocument) {
          this.technicalId = product.technicalDocument;
          this.technicalFileName = "Existing technical document";
        }
      } catch (error) {
        console.error('Error loading product:', error);
        this.imageError = `Failed to load product: ${error.message}`;
      } finally {
        this.isLoading = false;
      }
    },
    
    async loadCategories() {
                const tenantId = currentUserTenant.getTenantId();

      try {
        this.categories = await this.categoryService.getCategories(this.tenantId);
      } catch (error) {
        console.error('Error loading categories:', error);
        this.imageError = `Failed to load categories: ${error.message}`;
      } finally {
        this.isLoadingCategories = false;
      }
    },
    
    pickImage() {
      this.$refs.fileInput.click();
    },
    
    handleImageDrop(event) {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        this.processImageFile(file);
      }
    },
    
    onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.processImageFile(file);
    },
    
    processImageFile(file) {
      this.imageError = null;
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.imageError = 'Only JPG, JPEG, PNG, and WebP files are supported';
        return;
      }
      
      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.imageError = 'Image size exceeds 5MB limit';
        return;
      }
      
      this.imageFile = file;
      this.existingImageUrl = null;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    
    removeImage() {
      this.imageFile = null;
      this.imagePreview = null;
      this.existingImageUrl = null;
      this.$refs.fileInput.value = '';
    },
    
    handleImageError() {
      this.existingImageUrl = null;
      this.imageError = 'Failed to load image';
    },

    handleDocumentClick(type) {
      this.pickDocument(type);
    },

    pickDocument(type) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
      
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        this.documentError = null;
        
        if (file.size > 10 * 1024 * 1024) {
          this.documentError = 'Document size exceeds 10MB limit';
          return;
        }
        
        const fileName = file.name;
        
        switch (type) {
          case 'manual':
            this.manualFile = file;
            this.manualFileName = fileName;
            this.manualId = null;
            break;
          case 'warranty':
            this.warrantyFile = file;
            this.warrantyFileName = fileName;
            this.warrantyId = null;
            break;
          case 'technical':
            this.technicalFile = file;
            this.technicalFileName = fileName;
            this.technicalId = null;
            break;
        }
      };
      
      input.click();
    },

    removeDocument(type) {
      switch (type) {
        case 'manual':
          this.manualFile = null;
          this.manualFileName = null;
          this.manualId = null;
          break;
        case 'warranty':
          this.warrantyFile = null;
          this.warrantyFileName = null;
          this.warrantyId = null;
          break;
        case 'technical':
          this.technicalFile = null;
          this.technicalFileName = null;
          this.technicalId = null;
          break;
      }
    },
    
    showAddCategoryDialog() {
      this.newCategoryName = '';
      this.selectedIcon = null;
      this.selectedColor = null;
      this.showAddCategoryModal = true;
    },
    
    async addCategory() {
                const tenantId = currentUserTenant.getTenantId();

      if (!this.newCategoryName) return;
      
      this.isAddingCategory = true;
      
      try {
        const newCategory = new ProductCategory({
          categoryName: this.newCategoryName,
          tenant: this.tenantId,
          icon: this.selectedIcon ? this.iconOptions.indexOf(this.selectedIcon).toString() : null,
          color: this.selectedColor ? this.selectedColor.substring(1) : null
        });
        
        const addedCategory = await this.categoryService.createCategory(newCategory);
        
        if (addedCategory) {
          this.categories.push(addedCategory);
          this.selectedCategoryId = addedCategory.id;
          
          this.showAddCategoryModal = false;
          if (this.$toast) {
            this.$toast.success(`Category "${newCategory.categoryName}" added successfully`);
          } else {
            console.log(`Category "${newCategory.categoryName}" added successfully`);
          }
        } else {
          this.imageError = 'Failed to add category';
        }
      } catch (error) {
        console.error('Error adding category:', error);
        this.imageError = `Error adding category: ${error.message}`;
      } finally {
        this.isAddingCategory = false;
      }
    },
    
    async uploadDocuments() {
      try {
        if (this.manualFile) {
          const manualId = await this.fileService.uploadFile(this.manualFile);
          if (manualId) {
            this.manualId = manualId;
          }
        }
        
        if (this.warrantyFile) {
          const warrantyId = await this.fileService.uploadFile(this.warrantyFile);
          if (warrantyId) {
            this.warrantyId = warrantyId;
          }
        }
        
        if (this.technicalFile) {
          const technicalId = await this.fileService.uploadFile(this.technicalFile);
          if (technicalId) {
            this.technicalId = technicalId;
          }
        }
      } catch (error) {
        throw new Error(`Document upload failed: ${error.message}`);
      }
    },
    
    async submitProduct() {
                const tenantId = currentUserTenant.getTenantId();

      if (!this.productName) {
        this.imageError = 'Please enter a product name';
        return;
      }
      
      this.isSubmitting = true;
      this.imageError = null;
      
      try {
        await this.uploadDocuments();
        
        let imageId = null;
        if (this.imageFile) {
          imageId = await this.fileService.uploadImage(this.imageFile);
        }
        
        if (this.isEditMode) {
          const updateData = {
            productName: this.productName,
            productId: this.modelNumber || null,
            category: this.selectedCategoryId,
            serialNumber: this.serialNumber || null,
            variant: this.variant || null,
            deviceType: this.deviceType || null,
          };
          
          if (this.manualId) updateData.manual = this.manualId;
          if (this.warrantyId) updateData.warrantyDocument = this.warrantyId;
          if (this.technicalId) updateData.technicalDocument = this.technicalId;
          
          if (imageId) {
            updateData.imageUrl = imageId;
          }
          
          const success = await this.productService.updateProduct(this.id, updateData, this.imageFile);
          
          if (success) {
            if (this.$toast) {
              this.$toast.success('Product updated successfully');
            } else {
              console.log('Product updated successfully');
            }
            this.$router.push({ name: 'ProductDetail', params: { id: this.id } });
          } else {
            this.imageError = 'Failed to update product';
          }
        } else {
          const product = new Product({
            productName: this.productName,
            productId: this.modelNumber || null,
            category: this.selectedCategoryId,
            tenant: this.tenantId,
            userCreated: this.userId,
            serialNumber: this.serialNumber || null,
            variant: this.variant || null,
            deviceType: this.deviceType || null,
            manual: this.manualId,
            warrantyDocument: this.warrantyId,
            technicalDocument: this.technicalId,
            imageUrl: imageId
          });
          
          const success = await this.productService.addProduct(product, this.imageFile);
          
          if (success) {
            if (this.$toast) {
              this.$toast.success('Product added successfully');
            } else {
              console.log('Product added successfully');
            }
            this.$router.push({ name: 'Products', query: { tenantId: this.tenantId } });
          } else {
            this.imageError = 'Failed to add product';
          }
        }
      } catch (error) {
        console.error('Error submitting product:', error);
        this.imageError = `Error: ${error.message}`;
      } finally {
        this.isSubmitting = false;
      }
    },
    
    goBack() {
      try {
        this.$router.go(-1);
      } catch (error) {
        console.error('Error navigating back:', error);
        this.imageError = `Failed to navigate back: ${error.message}`;
      }
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.product-edit-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;

}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.sidebar-nav {
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #64748b;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.nav-item.active {
  background-color: #eff6ff;
  color: #2563eb;
  border-right: 3px solid #2563eb;
}

.nav-item i {
  width: 20px;
  margin-right: 12px;
  font-size: 16px;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  max-height: 80vh;
  /* 👈 extra scroll at the bottom */

}

/* Header */
.content-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date-info {
  color: #64748b;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-weight: 500;
}

/* Form Container */
.form-container {
  flex: 1;

  overflow-y: auto;
}

.product-form {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Form Cards */
.form-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.card-content {
  padding: 24px;
}

/* Form Layout */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background-color: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

/* Select Wrapper */
.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background-color: #ffffff;
  appearance: none;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.select-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

/* Add Category Link */
.add-category-link {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  margin-top: 12px;
}

.add-category-link:hover {
  color: #1d4ed8;
}

/* Image Upload */
.image-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-dropzone {
  width: 100%;
  max-width: 400px;
  height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background-color: #f9fafb;
}

.image-dropzone:hover {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.image-dropzone.has-image {
  border-style: solid;
  border-color: #2563eb;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.dropzone-content {
  text-align: center;
  padding: 20px;
}

.dropzone-icon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.dropzone-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 8px 0;
}

.dropzone-subtext {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.dropzone-format {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.remove-image-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.remove-image-btn:hover {
  background-color: #ef4444;
}

/* Documents Grid */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.document-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f9fafb;
}

.document-card:hover {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.document-card.has-file {
  border-color: #10b981;
  background-color: #ecfdf5;
}

.document-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.document-icon.blue {
  background-color: #3b82f6;
}

.document-icon.green {
  background-color: #10b981;
}

.document-icon.purple {
  background-color: #8b5cf6;
}

.document-info {
  flex: 1;
}

.document-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 4px 0;
}

.document-status {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.remove-doc-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #fee2e2;
  color: #ef4444;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.remove-doc-btn:hover {
  background-color: #fecaca;
}

/* Info Alert */
.info-alert {
  background-color: #fffbeb;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #92400e;
  font-size: 14px;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #2563eb;
  animation: spin 0.8s linear infinite;
}

/* Error Message */
.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.modal-close:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Icon Grid */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.icon-option {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  background-color: #f3f4f6;
}

.icon-option.selected {
  background-color: #eff6ff;
  border-color: #2563eb;
}

.icon-option i {
  color: #6b7280;
}

.icon-option.selected i {
  color: #2563eb;
}

/* Color Options */
.color-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #374151;
  transform: scale(1.1);
}

.color-option i {
  color: white;
  font-size: 12px;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .product-edit-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 10px 0;
  }
  
  .nav-item {
    white-space: nowrap;
    padding: 8px 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .documents-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .content-header {
    padding: 12px 16px;
  }
  

}
</style>
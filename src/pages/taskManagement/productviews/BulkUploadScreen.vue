<template>
  <div class="bulk-upload">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <button class="btn-back" @click="goBack" aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div class="header-title">
          <h1>Bulk Upload Products</h1>
          <span class="header-subtitle">Upload multiple products efficiently</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content" v-if="!isLoading">
      <!-- Welcome Card -->
      <div class="welcome-card">
        <div class="welcome-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        <div class="welcome-content">
          <h2>Streamlined Bulk Upload Process</h2>
          <p>Upload up to 10 product models at once with our guided workflow. Follow the steps below to ensure a smooth upload experience.</p>
        </div>
      </div>

      <!-- Instructions -->
      <div class="instructions-section">
        <h3>How it works</h3>
        <div class="instructions-grid">
          <div class="instruction-item">
            <div class="instruction-number">1</div>
            <div class="instruction-content">
              <h4>Download Template</h4>
              <p>Get the CSV template with required fields: productName, productId, product (image), category, and document files.</p>
            </div>
          </div>
          <div class="instruction-item">
            <div class="instruction-number">2</div>
            <div class="instruction-content">
              <h4>Fill Template</h4>
              <p>Complete the template with your product data. Maximum 10 products per batch. File names must match uploaded files.</p>
            </div>
          </div>
          <div class="instruction-item">
            <div class="instruction-number">3</div>
            <div class="instruction-content">
              <h4>Upload Files</h4>
              <p>Upload your CSV, product images (.jpg/.png), and documents (.pdf/.doc) that match your template references.</p>
            </div>
          </div>
          <div class="instruction-item">
            <div class="instruction-number">4</div>
            <div class="instruction-content">
              <h4>Submit & Track</h4>
              <p>Review your data and submit. Track the upload progress and receive detailed success or error feedback.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="progress-section">
        <div class="progress-header">
          <h3>Upload Progress</h3>
          <div class="progress-counter">Step {{ currentStep + 1 }} of {{ steps.length }}</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"></div>
        </div>
        <div class="steps-container">
          <div 
            v-for="(step, index) in steps" 
            :key="index" 
            class="step-item"
            :class="{ 
              'active': currentStep === index, 
              'completed': currentStep > index,
              'upcoming': currentStep < index
            }"
          >
            <div class="step-circle">
              <svg v-if="currentStep > index" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-info">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="successMessage" class="alert alert-success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <div v-if="errorMessage" class="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Step Content -->
      <div class="step-content-container">
        <!-- Step 1: Download Template -->
        <div v-if="currentStep === 0" class="step-content">
          <div class="step-card">
            <div class="step-header">
              <div class="step-icon template">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <h4>Download CSV Template</h4>
                <p>Get the structured template with all required fields and example data</p>
              </div>
            </div>
            <div class="step-actions">
              <button class="btn-primary" @click="downloadTemplate">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Template
              </button>
              <button class="btn-secondary" @click="pickCSVFile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload Existing CSV
              </button>
            </div>
            <input 
              type="file" 
              ref="csvInput" 
              accept=".csv" 
              class="file-input" 
              @change="onCSVSelected"
            >
          </div>
        </div>

        <!-- Step 2: Upload CSV -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="step-card">
            <div class="step-header">
              <div class="step-icon csv">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div>
                <h4>Upload CSV File</h4>
                <p>Upload your completed CSV file with product data</p>
              </div>
            </div>
            
            <div v-if="csvFile" class="file-preview">
              <div class="file-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div class="file-info">
                <div class="file-name">{{ csvFileName }}</div>
                <div class="file-details">{{ parsedProducts.length }} products found</div>
              </div>
              <div class="file-status success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
            </div>
            
            <div class="step-actions">
              <button class="btn-secondary" @click="pickCSVFile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z"/>
                  <path d="M8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/>
                </svg>
                {{ csvFile ? 'Change CSV File' : 'Upload CSV File' }}
              </button>
              <button 
                class="btn-primary" 
                :disabled="!csvUploaded" 
                @click="pickImageFiles"
              >
                Next: Upload Images
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: Upload Images -->
        <!-- <div v-if="currentStep === 2" class="step-content">
          <div class="step-card">
            <div class="step-header">
              <div class="step-icon images">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <div>
                <h4>Upload Product Images</h4>
                <p>Upload image files that match the references in your CSV</p>
              </div>
            </div>
            
            <div v-if="selectedImageFiles.length > 0" class="file-preview">
              <div class="file-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <div class="file-info">
                <div class="file-name">{{ selectedImageFiles.length }} image files</div>
                <div class="file-details">{{ Object.keys(imageFileMap).length }} of {{ parsedProducts.length }} products matched</div>
              </div>
              <div class="file-status" :class="{ success: Object.keys(imageFileMap).length === parsedProducts.length }">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
            </div>
            
            <div class="step-actions">
              <button class="btn-secondary" @click="pickImageFiles">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                {{ selectedImageFiles.length > 0 ? 'Change Images' : 'Upload Images' }}
              </button>
              <input 
                type="file" 
                ref="imageInput" 
                accept="image/jpeg,image/png,image/jpg" 
                class="file-input" 
                multiple
                @change="onImagesSelected"
              >
              <button 
                class="btn-primary" 
                :disabled="!imagesUploaded" 
                @click="pickDocumentFiles"
              >
                Next: Upload Documents
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div> -->

        <!-- Step 4: Upload Documents -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="step-card">
            <div class="step-header">
              <div class="step-icon documents">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div>
                <h4>Upload Document Files</h4>
                <p>Upload manuals, warranty documents, and technical documentation</p>
              </div>
            </div>
            
            <div v-if="selectedDocumentFiles.length > 0" class="file-preview">
              <div class="file-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div class="file-info">
                <div class="file-name">{{ selectedDocumentFiles.length }} document files</div>
                <div class="file-details">{{ Object.keys(documentFileMap).length }} document references matched</div>
              </div>
              <div class="file-status success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
            </div>
            
            <div class="step-actions">
              <button class="btn-secondary" @click="pickDocumentFiles">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                {{ selectedDocumentFiles.length > 0 ? 'Change Documents' : 'Upload Documents' }}
              </button>
              <input 
                type="file" 
                ref="documentInput" 
                accept=".pdf,.doc,.docx" 
                class="file-input" 
                multiple
                @change="onDocumentsSelected"
              >
              <button 
                class="btn-primary" 
                :disabled="!documentsUploaded" 
                @click="goToSubmitStep"
              >
                Next: Review & Submit
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 5: Submit -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="step-card">
            <div class="step-header">
              <div class="step-icon submit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m4 12 8-8 8 8"/>
                  <path d="m6 20 7-7 7 7"/>
                </svg>
              </div>
              <div>
                <h4>Review & Submit</h4>
                <p>Final review of your upload before submission</p>
              </div>
            </div>
            
            <div class="upload-summary">
              <h5>Upload Summary</h5>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <div class="summary-details">
                    <div class="summary-label">CSV File</div>
                    <div class="summary-value">{{ csvFileName }}</div>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="summary-details">
                    <div class="summary-label">Products</div>
                    <div class="summary-value">{{ parsedProducts.length }} items</div>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                  </div>
                  <div class="summary-details">
                    <div class="summary-label">Images</div>
                    <div class="summary-value">{{ selectedImageFiles.length }} files</div>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <div class="summary-details">
                    <div class="summary-label">Documents</div>
                    <div class="summary-value">{{ selectedDocumentFiles.length }} files</div>
                  </div>
                </div>
              </div>
              <div class="summary-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                All products will be created with draft status for review
              </div>
            </div>
            
            <div class="step-actions">
              <button class="btn-submit" @click="uploadProducts">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m4 12 8-8 8 8"/>
                  <path d="m6 20 7-7 7 7"/>
                </svg>
                Upload {{ parsedProducts.length }} Products
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Preview -->
      <div v-if="parsedProducts.length > 0" class="preview-section">
        <div class="preview-header">
          <h3>Product Preview</h3>
          <div class="preview-count">{{ parsedProducts.length }} products ready</div>
        </div>
        <div class="preview-grid">
          <div v-for="(product, index) in parsedProducts" :key="index" class="preview-card">
            <div class="preview-image">
              <img 
                v-if="imageFileMap[product.imageFileName]" 
                :src="getImagePreview(product.imageFileName)" 
                alt="Product preview"
              >
              <div v-else class="preview-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
            </div>
            <div class="preview-content">
              <div class="preview-title">{{ product.productName }}</div>
              <div class="preview-id">{{ product.productId }}</div>
              <div class="preview-category">{{ getCategoryName(product) }}</div>
              <div class="preview-files">
                <span class="file-tag image" v-if="imageFileMap[product.imageFileName]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  Image
                </span>
                <span class="file-tag docs" v-if="hasDocuments(product)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  {{ countDocuments(product) }} docs
                </span>
              </div>
            </div>
            <div class="preview-status">
              <div class="status-indicator" :class="{ 
                success: imageFileMap[product.imageFileName] && (!hasDocuments(product) || allDocumentsFound(product)),
                warning: !imageFileMap[product.imageFileName] || (hasDocuments(product) && !allDocumentsFound(product))
              }">
                <svg v-if="imageFileMap[product.imageFileName] && (!hasDocuments(product) || allDocumentsFound(product))" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Loading State -->
    <div v-else class="loading-state">
      <div class="loading-spinner"></div>
      <h3>{{ loadingMessage }}</h3>
      <p>Please wait while we process your request...</p>
    </div>
  </div>
</template>

<script>
import { ProductService, CategoryService, FileService } from '../productservices/ProductService';
import { Product, ProductCategory } from '../productmodels/Product';

export default {
  name: 'BulkUpload',

  data() {
    return {
      // File handling
      csvFile: null,
      selectedImageFiles: [],
      imageFileMap: {},
      selectedDocumentFiles: [],
      documentFileMap: {},
      
      // Data handling
      parsedProducts: [],
      isLoading: false,
      loadingMessage: '',
      errorMessage: '',
      successMessage: '',
      
      // Category handling
      categories: [],
      isCategoriesLoading: true,
      productCategoryMap: {},
      
      // Step tracking
      currentStep: 0,
      csvUploaded: false,
      imagesUploaded: false,
      documentsUploaded: false,
      validationPassed: false,
      
      // Steps configuration
      steps: [
        { 
          title: 'Download Template', 
          description: 'Get the CSV template with required fields'
        },
        { 
          title: 'Upload CSV', 
          description: 'Upload your completed product data file'
        },
        // { 
        //   title: 'Upload Images', 
        //   description: 'Add product images referenced in CSV'
        // },
        { 
          title: 'Upload Documents', 
          description: 'Add manuals and technical documentation'
        },
        { 
          title: 'Submit Upload', 
          description: 'Review and submit your bulk upload'
        }
      ],
      
      // Constants
      maxProductsPerBatch: 10
    }
  },
  computed: {
    csvFileName() {
      return this.csvFile ? this.csvFile.name : '';
    }
  },
  created() {
    this.productService = new ProductService();
    this.categoryService = new CategoryService();
    this.loadCategories();
  },
  methods: {
    async loadCategories() {
      try {
        const categories = await this.categoryService.getCategories(this.tenantId);
        this.categories = categories.filter(cat => cat.id !== 'all' && cat.id !== 'uncategorized');
        this.isCategoriesLoading = false;
      } catch (error) {
        console.error('Error loading categories:', error);
        this.isCategoriesLoading = false;
      }
    },
    
    async downloadTemplate() {
      this.isLoading = true;
      this.loadingMessage = 'Preparing template...';
      this.errorMessage = '';
      
      try {
        const headers = ['productName', 'productId', 'product', 'category', 'manual', 'warrantyDocument', 'technicalDocument'];
        
        const rows = [
          ['Face ID F22', 'F22', 'face_f22.jpg', 'Security', 'f22_manual.pdf', 'f22_warranty.pdf', 'f22_tech.pdf'],
          ['Biometric Scanner', 'BS-100', 'scanner_bs100.jpg', 'Access Control', 'bs100_manual.pdf', 'bs100_warranty.pdf', 'bs100_tech.pdf']
        ];
        
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
          csv += row.join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.successMessage = 'Template downloaded successfully';
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        this.errorMessage = 'Error creating template: ' + error.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    pickCSVFile() {
      this.$refs.csvInput.click();
    },
    
    async onCSVSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      this.errorMessage = '';
      this.parsedProducts = [];
      this.isLoading = true;
      this.loadingMessage = 'Processing CSV file...';
      
      try {
        this.csvFile = file;
        await this.parseCSVFile();
        
        this.csvUploaded = true;
        this.currentStep = 1;
      } catch (error) {
        this.errorMessage = 'Error processing CSV: ' + error.message;
        this.csvUploaded = false;
      } finally {
        this.isLoading = false;
      }
    },
    
    async parseCSVFile() {
      if (!this.csvFile) {
        throw new Error('No CSV file selected');
      }
      
      const text = await this.readFileAsText(this.csvFile);
      const rows = this.parseCSV(text);
      
      if (rows.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      const headers = rows[0].map(e => e.trim());
      
      if (!headers.includes('productName') || !headers.includes('productId') || !headers.includes('product')) {
        throw new Error('CSV must contain "productName", "productId", and "product" columns');
      }
      
      if (rows.length - 1 > this.maxProductsPerBatch) {
        throw new Error(`CSV exceeds maximum of ${this.maxProductsPerBatch} products per batch`);
      }
      
      const products = [];
      const requiredImageFiles = new Set();
      const requiredDocumentFiles = new Set();
      const modelNumbers = new Set();
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0) continue;
        
        const productNameIndex = headers.indexOf('productName');
        const productIdIndex = headers.indexOf('productId');
        const productImageIndex = headers.indexOf('product');
        const categoryIndex = headers.indexOf('category');
        const manualIndex = headers.indexOf('manual');
        const warrantyDocumentIndex = headers.indexOf('warrantyDocument');
        const technicalDocumentIndex = headers.indexOf('technicalDocument');
        
        if (productNameIndex >= 0 && productNameIndex < row.length &&
            productIdIndex >= 0 && productIdIndex < row.length &&
            productImageIndex >= 0 && productImageIndex < row.length) {
          
          const productName = row[productNameIndex].trim();
          const productId = row[productIdIndex].trim();
          const imageFileName = row[productImageIndex].trim();
          
          let category = null;
          if (categoryIndex >= 0 && categoryIndex < row.length) {
            category = row[categoryIndex].trim();
            if (category === '') category = null;
            
            if (category) {
              this.productCategoryMap[productId] = category;
            }
          }
          
          let manual = null;
          if (manualIndex >= 0 && manualIndex < row.length) {
            manual = row[manualIndex].trim();
            if (manual) {
              requiredDocumentFiles.add(manual);
            } else {
              manual = null;
            }
          }
          
          let warrantyDocument = null;
          if (warrantyDocumentIndex >= 0 && warrantyDocumentIndex < row.length) {
            warrantyDocument = row[warrantyDocumentIndex].trim();
            if (warrantyDocument) {
              requiredDocumentFiles.add(warrantyDocument);
            } else {
              warrantyDocument = null;
            }
          }
          
          let technicalDocument = null;
          if (technicalDocumentIndex >= 0 && technicalDocumentIndex < row.length) {
            technicalDocument = row[technicalDocumentIndex].trim();
            if (technicalDocument) {
              requiredDocumentFiles.add(technicalDocument);
            } else {
              technicalDocument = null;
            }
          }
          
          if (productName === '') {
            throw new Error(`Row ${i+1}: Product name cannot be empty`);
          }
          
          if (productId === '') {
            throw new Error(`Row ${i+1}: Product ID cannot be empty`);
          }
          
          if (modelNumbers.has(productId)) {
            throw new Error(`Row ${i+1}: Duplicate model number "${productId}" in CSV`);
          }
          modelNumbers.add(productId);
          
          const modelExists = await this.productService.checkModelNumberExists(productId);
          if (modelExists) {
            throw new Error(`Row ${i+1}: Model number "${productId}" already exists in the database`);
          }
          
          if (imageFileName === '') {
            throw new Error(`Row ${i+1}: Image file name cannot be empty`);
          }
          
          requiredImageFiles.add(imageFileName);
          
          products.push({
            productName,
            productId,
            imageFileName,
            category,
            manual,
            warrantyDocument,
            technicalDocument,
            status: 'draft',
            tenant: this.tenantId
          });
        } else {
          throw new Error(`Row ${i+1} is missing required fields`);
        }
      }
      
      this.parsedProducts = products;
      this.successMessage = `CSV processed successfully. Found ${products.length} products.`;
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    },
    
    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    },
    
    parseCSV(text) {
      const lines = text.split('\n');
      return lines.map(line => {
        const result = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        result.push(currentValue);
        return result;
      }).filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''));
    },
    
    pickImageFiles() {
      if (this.parsedProducts.length === 0) {
        this.errorMessage = 'Please upload a CSV file first';
        return;
      }

      if (this.currentStep !== 2) {
        this.currentStep = 2;
      }

      this.$nextTick(() => {
        if (this.$refs.imageInput) {
          this.$refs.imageInput.click();
        } else {
          console.error('imageInput ref is not available');
          this.errorMessage = 'Unable to open file picker. Please try again.';
        }
      });
    },    
    
    async onImagesSelected(event) {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      
      this.errorMessage = '';
      this.isLoading = true;
      this.loadingMessage = 'Processing image files...';
      
      try {
        this.selectedImageFiles = files;
        await this.processImageFiles();
        
        this.imagesUploaded = true;
        this.currentStep = 2;
      } catch (error) {
        this.errorMessage = 'Error processing images: ' + error.message;
        this.imagesUploaded = false;
      } finally {
        this.isLoading = false;
      }
    },
    
    async processImageFiles() {
      const requiredImages = new Set();
      for (const product of this.parsedProducts) {
        requiredImages.add(product.imageFileName);
      }
      
      const imageMap = {};
      for (const file of this.selectedImageFiles) {
        imageMap[file.name] = file;
      }
      
      const missingImages = [];
      for (const requiredImage of requiredImages) {
        if (!imageMap[requiredImage]) {
          missingImages.push(requiredImage);
        }
      }
      
      if (missingImages.length > 0) {
        throw new Error('Missing image files: ' + missingImages.join(', '));
      }
      
      const extraImages = [];
      for (const filename in imageMap) {
        if (!requiredImages.has(filename)) {
          extraImages.push(filename);
        }
      }
      
      this.imageFileMap = imageMap;
      
      this.successMessage = 'All required images found. Ready to upload.';
      this.validationPassed = true;
      
      if (extraImages.length > 0) {
        this.successMessage += `\nNote: ${extraImages.length} extra images will be ignored.`;
      }
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    },
    
    pickDocumentFiles() {
      if (this.parsedProducts.length === 0) {
        this.errorMessage = 'Please upload a CSV file first';
        return;
      }

      if (this.currentStep !== 3) {
        this.currentStep = 3;
      }

      this.$nextTick(() => {
        if (this.$refs.documentInput) {
          this.$refs.documentInput.click();
        } else {
          console.error('documentInput ref is not available');
          this.errorMessage = 'Unable to open document file picker. Please try again.';
        }
      });
    },
    
    async onDocumentsSelected(event) {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      
      this.errorMessage = '';
      this.isLoading = true;
      this.loadingMessage = 'Processing document files...';
      
      try {
        this.selectedDocumentFiles = files;
        await this.processDocumentFiles();
        
        this.documentsUploaded = true;
        this.currentStep = 3;
      } catch (error) {
        this.errorMessage = 'Error processing documents: ' + error.message;
        this.documentsUploaded = false;
      } finally {
        this.isLoading = false;
      }
    },
    
    async processDocumentFiles() {
      const requiredDocuments = new Set();
      for (const product of this.parsedProducts) {
        if (product.manual) requiredDocuments.add(product.manual);
        if (product.warrantyDocument) requiredDocuments.add(product.warrantyDocument);
        if (product.technicalDocument) requiredDocuments.add(product.technicalDocument);
      }
      
      if (requiredDocuments.size === 0) {
        this.successMessage = 'No documents required. Ready to upload.';
        this.validationPassed = true;
        this.documentsUploaded = true;
        return;
      }
      
      const documentMap = {};
      for (const file of this.selectedDocumentFiles) {
        documentMap[file.name] = file;
      }
      
      const missingDocuments = [];
      for (const requiredDoc of requiredDocuments) {
        if (!documentMap[requiredDoc]) {
          missingDocuments.push(requiredDoc);
        }
      }
      
      if (missingDocuments.length > 0) {
        throw new Error('Missing document files: ' + missingDocuments.join(', '));
      }
      
      const extraDocuments = [];
      for (const filename in documentMap) {
        if (!requiredDocuments.has(filename)) {
          extraDocuments.push(filename);
        }
      }
      
      this.documentFileMap = documentMap;
      
      this.successMessage = 'All required documents found. Ready to upload.';
      this.validationPassed = true;
      
      if (extraDocuments.length > 0) {
        this.successMessage += `\nNote: ${extraDocuments.length} extra documents will be ignored.`;
      }
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    },
    
    goToSubmitStep() {
      this.currentStep = 4;
    },
    
    async uploadProducts() {
      if (this.parsedProducts.length === 0) {
        this.errorMessage = 'No products to upload';
        return;
      }

      if (!this.validationPassed) {
        this.errorMessage = 'Please complete all steps before uploading';
        return;
      }

      this.isLoading = true;
      this.loadingMessage = 'Uploading products...';
      this.errorMessage = '';

      try {
        const products = [];
        const imageFiles = [];
        const documentFiles = [];

        for (const productData of this.parsedProducts) {
          let categoryId = null;
          if (this.productCategoryMap[productData.productId]) {
            const categoryName = this.productCategoryMap[productData.productId];
            for (const category of this.categories) {
              if (category.categoryName.toLowerCase() === categoryName.toLowerCase()) {
                categoryId = category.id;
                break;
              }
            }

            if (!categoryId && categoryName) {
              try {
                const newCategory = await this.categoryService.createCategory(
                  new ProductCategory({
                    categoryName,
                    tenant: this.tenantId
                  })
                );
                if (newCategory) {
                  categoryId = newCategory.id;
                  this.categories.push(newCategory);
                }
              } catch (error) {
                console.error('Error creating category:', error);
                this.errorMessage = `Failed to create category "${categoryName}": ${error.response?.data?.errors?.[0]?.message || error.message}`;
                return;
              }
            }
          }

          const product = new Product({
            productName: productData.productName,
            productId: productData.productId,
            status: 'draft',
            tenant: this.tenantId,
            userCreated: this.userId,
            category: categoryId
          });

          products.push(product);

          const imageFileName = productData.imageFileName;
          const imageFile = this.imageFileMap[imageFileName];
          imageFiles.push(imageFile);

          const docs = {
            manual: productData.manual ? this.documentFileMap[productData.manual] : null,
            warrantyDocument: productData.warrantyDocument ? this.documentFileMap[productData.warrantyDocument] : null,
            technicalDocument: productData.technicalDocument ? this.documentFileMap[productData.technicalDocument] : null
          };
          documentFiles.push(docs);
        }

        for (let i = 0; i < products.length; i++) {
          this.loadingMessage = `Uploading product ${i + 1} of ${products.length}...`;

          const docs = documentFiles[i];
          const docIds = {
            manual: null,
            warrantyDocument: null,
            technicalDocument: null
          };

          if (docs.manual) {
            docIds.manual = await FileService.uploadFile(docs.manual);
            if (!docIds.manual) throw new Error(`Failed to upload manual for product ${products[i].productId}`);
          }
          if (docs.warrantyDocument) {
            docIds.warrantyDocument = await FileService.uploadFile(docs.warrantyDocument);
            if (!docIds.warrantyDocument) throw new Error(`Failed to upload warranty document for product ${products[i].productId}`);
          }
          if (docs.technicalDocument) {
            docIds.technicalDocument = await FileService.uploadFile(docs.technicalDocument);
            if (!docIds.technicalDocument) throw new Error(`Failed to upload technical document for product ${products[i].productId}`);
          }

          products[i].manual = docIds.manual;
          products[i].warrantyDocument = docIds.warrantyDocument;
          products[i].technicalDocument = docIds.technicalDocument;

          const success = await this.productService.addProduct(products[i], imageFiles[i]);
          if (!success) {
            throw new Error(`Failed to upload product ${products[i].productId}`);
          }
        }

        alert(`${products.length} products uploaded successfully`);
        this.$emit('products-uploaded');
        this.goBack();
      } catch (error) {
        console.error('Error uploading products:', error);
        this.errorMessage = `Error uploading products: ${error.message}`;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Helper methods
    getImagePreview(fileName) {
      const file = this.imageFileMap[fileName];
      if (file) {
        return URL.createObjectURL(file);
      }
      return null;
    },
    
    getCategoryName(product) {
      if (!product.category) return 'Uncategorized';
      const categoryName = this.productCategoryMap[product.productId];
      return categoryName || 'Uncategorized';
    },
    
    hasDocuments(product) {
      return product.manual || product.warrantyDocument || product.technicalDocument;
    },
    
    countDocuments(product) {
      let count = 0;
      if (product.manual) count++;
      if (product.warrantyDocument) count++;
      if (product.technicalDocument) count++;
      return count;
    },
    
    allDocumentsFound(product) {
      if (product.manual && !this.documentFileMap[product.manual]) return false;
      if (product.warrantyDocument && !this.documentFileMap[product.warrantyDocument]) return false;
      if (product.technicalDocument && !this.documentFileMap[product.technicalDocument]) return false;
      return true;
    },
    
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.bulk-upload {

  background:white;
  min-height: 100vh;
  color: #1a202c;
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  /* max-width: 1200px; */
  /* margin: 0 auto; */
}

.btn-back {
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
  margin-right: 1rem;
}

.btn-back:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #2d3748;
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

/* Main Content */
.main-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  overflow: auto;
  max-height: 80vh;
  padding-bottom: 200px;
}

/* Welcome Card */
.welcome-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.welcome-icon {
  width: 4rem;
  height: 4rem;
  background: #68ade1;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.welcome-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #1a202c;
}

.welcome-content p {
  font-size: 1rem;
  color: #718096;
  margin: 0;
  line-height: 1.6;
}

/* Instructions */
.instructions-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.instructions-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: #1a202c;
}

.instructions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.instruction-item {
  display: flex;
  gap: 1rem;
}

.instruction-number {
  width: 2rem;
  height: 2rem;
  background:#68ade1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.instruction-content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1a202c;
}

.instruction-content p {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

/* Progress Section */
.progress-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1a202c;
}

.progress-counter {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #e2e8f0;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 2rem;
}

.progress-fill {
  height: 100%;
  background: #68ade1;
  transition: width 0.3s ease;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.step-item.active {
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid #667eea;
}

.step-item.completed {
  background: rgba(72, 187, 120, 0.1);
}

.step-item.upcoming {
  background: #f7fafc;
}

.step-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-item.active .step-circle {
  background: #68ade1;
  color: white;
}

.step-item.completed .step-circle {
  background: #48bb78;
  color: white;
}

.step-item.upcoming .step-circle {
  background: #e2e8f0;
  color: #718096;
}

.step-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.step-description {
  font-size: 0.75rem;
  color: #718096;
  line-height: 1.4;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.alert-success {
  background: rgba(72, 187, 120, 0.1);
  color: #2f855a;
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.alert-error {
  background: rgba(245, 101, 101, 0.1);
  color: #c53030;
  border: 1px solid rgba(245, 101, 101, 0.3);
}

/* Step Content */
.step-content-container {
  margin-bottom: 2rem;
}

.step-content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.step-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.step-icon.template {
  background: #68ade1;
}

.step-icon.csv {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.step-icon.images {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.step-icon.documents {
  background: #68ade1;
}

.step-icon.submit {
  background: linear-gradient(135deg, #38b2ac 0%, #319795 100%);
}

.step-header h4 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1a202c;
}

.step-header p {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

/* File Preview */
.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  border: 2px solid #e2e8f0;
}

.file-icon {
  color:#68ade1;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.file-details {
  font-size: 0.875rem;
  color: #718096;
}

.file-status {
  flex-shrink: 0;
}

.file-status.success {
  color: #48bb78;
}

.file-status.warning {
  color: #ed8936;
}

/* Step Actions */
.step-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-submit {
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: #68ade1;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.btn-submit {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  width: 100%;
  justify-content: center;
  padding: 1.25rem 2rem;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.6);
}

/* Upload Summary */
.upload-summary {
  background: #f7fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.upload-summary h5 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.summary-icon {
  color: #667eea;
  flex-shrink: 0;
}

.summary-label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
}

.summary-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #48bb78;
  font-weight: 500;
}

/* Preview Section */
.preview-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.preview-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1a202c;
}

.preview-count {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 600;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.preview-card {
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
  position: relative;
}

.preview-card:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: 8rem;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  color: #a0aec0;
}

.preview-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.preview-id {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.preview-category {
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.75rem;
}

.preview-files {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.file-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.file-tag.image {
  background: rgba(102, 126, 234, 0.1);
  color:#68ade1;
}

.file-tag.docs {
  background: rgba(160, 174, 192, 0.1);
  color: #718096;
}

.preview-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.status-indicator {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator.success {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.status-indicator.warning {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

/* File Input */
.file-input {
  display: none;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.loading-state p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .welcome-card {
    flex-direction: column;
    text-align: center;
  }
  
  .instructions-grid {
    grid-template-columns: 1fr;
  }
  
  .steps-container {
    grid-template-columns: 1fr;
  }
  
  .step-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .preview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 1rem;
  }
  
  .welcome-card, .step-card, .preview-section {
    padding: 1.5rem;
  }
  
  .instructions-section {
    padding: 1.5rem;
  }
}
</style>

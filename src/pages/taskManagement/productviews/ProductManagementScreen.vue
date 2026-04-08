<template>
  <div class="product-management">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 class="title">Assets Types</h1>
        <!-- Search Bar -->
        <div class="search-container">
          <div class="search-input">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search assets types..."
              class="form-input"
            />
          </div>
        </div>
        <!-- Filter Toggle -->
        <button class="filter-toggle" @click="showFilters = !showFilters" :class="{ active: showFilters }">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
          </svg>
          Filters
          <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
        </button>
        <!-- Add Button -->
        <button class="btn-primary" @click="toggleAddAssetSlider">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Asset Types
        </button>
      </div>
    </header>
    <!-- Filter Sidebar -->
    <div class="filter-sidebar-overlay" :class="{ 'show': showFilters }" @click="showFilters = false">
      <div class="filter-sidebar" @click.stop>
        <div class="filter-sidebar-header">
          <h3>Filters</h3>
          <button class="close-btn" @click="showFilters = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="filter-sidebar-content">
          <div class="filter-group">
            <label class="filter-label">Branch</label>
            <select v-model="selectedBranch" class="filter-select">
              <option value="">All Branches</option>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <select v-model="selectedCategoryFilter" class="filter-select">
              <option value="">All Categories</option>
              <option v-for="category in categories.filter(c => c.id !== 'all')" :key="category.id" :value="category.id">
                {{ category.categoryName }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Status</label>
            <select v-model="selectedStatus" class="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Date Range</label>
            <div class="date-range">
              <input type="date" v-model="dateFrom" class="filter-input">
              <span class="date-separator">to</span>
              <input type="date" v-model="dateTo" class="filter-input">
            </div>
          </div>
          <div class="filter-actions">
            <button class="btn-secondary" @click="clearFilters">Clear All</button>
            <button class="btn-primary" @click="applyFilters">Apply</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Category Filter -->
    <div class="category-filter">
      <div class="category-tabs">
        <button
          v-for="(category, index) in categories"
          :key="category.id"
          class="category-tab"
          :class="{ 'active': selectedCategoryIndex === index }"
          @click="onCategoryTabSelected(index)"
        >
          {{ category.categoryName }}
          <span v-if="category.id !== 'all' && category.id !== 'uncategorized'"
                class="delete-btn"
                @click.stop="deleteCategory(category)">
            ×
          </span>
        </button>
        <button class="add-category-btn" @click="showAddCategoryDialog">
          + Add Category
        </button>
      </div>
    </div>
    <!-- Main Content -->
    <main class="main-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
      <!-- Empty State -->
      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6m6-6v6"/>
          </svg>
        </div>
        <h3>{{ emptyStateTitle }}</h3>
        <p>{{ emptyStateDescription }}</p>
        <button class="btn-primary" @click="toggleAddAssetSlider">
          Add First Product
        </button>
      </div>
      <!-- Products List -->
      <div v-else class="products-list">
        <table class="product-table">
          <thead>
            <tr>
              <th class="checkbox-col">
                <input
                  type="checkbox"
                  :checked="selected.length === filteredProducts.length && filteredProducts.length > 0"
                  :indeterminate="selected.length > 0 && selected.length < filteredProducts.length"
                  @change="toggleAll"
                />
              </th>
              <th
                v-for="header in headers"
                :key="header.value"
                :class="['column', header.sortable ? 'sortable' : '', pagination.sortBy === header.value ? (pagination.descending ? 'desc' : 'asc') : '']"
                @click="header.sortable && changeSort(header.value)"
              >
                <svg v-if="header.sortable" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sort-icon">
                  <path d="m6 17 6 6 6-6"/>
                  <path d="m12 18V6"/>
                </svg>
                {{ header.text }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              :class="{ 'selected-row': selected.includes(product.id) }"
              @click="navigateToProductDetail(product)"
            >
              <td class="checkbox-col">
                <input
                  type="checkbox"
                  :checked="selected.includes(product.id)"
                  @click.stop="toggleSelection(product.id)"
                />
              </td>
              <td class="product-col">
                <div class="product-info">
                  <div class="product-image">
                    <img v-if="product.image" :src="product.image" :alt="product.productName" />
                    <div v-else class="placeholder-image">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6m6-6v6"/>
                      </svg>
                    </div>
                  </div>
                  <span class="product-name">{{ product.productName }}</span>
                </div>
              </td>
              <td class="category-col">
                <span class="category-badge">{{ getCategoryName(product.category) }}</span>
              </td>
              <td class="branch-col">
                <span class="branch-badge">{{ getBranchName(product.branch) }}</span>
              </td>
              <td class="id-col">{{ product.productId || 'N/A' }}</td>
              <td class="status-col">
                <span class="status-badge" :class="product.status || 'draft'">
                  {{ (product.status || 'draft').charAt(0).toUpperCase() + (product.status || 'draft').slice(1) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
    <!-- Add Asset Slider -->
    <div class="slider-overlay" :class="{ 'show': showAddAssetSlider }" @click="closeAddAssetSlider">
      <div class="slider-panel" @click.stop>
        <div class="slider-header">
          <h2>Add New Asset</h2>
          <button class="close-btn" @click="closeAddAssetSlider">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="slider-content">
          <div class="add-option" @click="navigateToManualEntry">
            <div class="option-icon manual">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div class="option-content">
              <h3>Manual Entry</h3>
              <p>Add a single asset with detailed information</p>
            </div>
            <div class="option-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
          <div class="add-option" @click="navigateToBulkUpload">
            <div class="option-icon bulk">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div class="option-content">
              <h3>Bulk Upload</h3>
              <p>Import multiple assets from CSV or Excel file</p>
            </div>
            <div class="option-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Add Category Modal -->
    <div v-if="showAddCategoryModalFlag" class="modal-overlay" @click="showAddCategoryModalFlag = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add New Category</h2>
          <button class="close-btn" @click="showAddCategoryModalFlag = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Category Name</label>
            <input
              type="text"
              v-model="newCategoryName"
              placeholder="Enter category name"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddCategoryModalFlag = false">Cancel</button>
          <button class="btn-primary" @click="addCategory" :disabled="!newCategoryName || isAddingCategory">
            {{ isAddingCategory ? 'Adding...' : 'Add Category' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ProductService, CategoryService } from '../productservices/ProductService';

export default {
  name: 'ProductManagementScreen',
  props: {
    tenantId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      products: [],
      categories: [],
      branches: [
        { id: 'main', name: 'Main Branch' },
        { id: 'north', name: 'North Branch' },
        { id: 'south', name: 'South Branch' },
        { id: 'east', name: 'East Branch' },
        { id: 'west', name: 'West Branch' }
      ],
      isLoading: true,
      isCategoriesLoading: true,
      searchQuery: '',
      selectedCategoryIndex: 0,
      selectedCategory: null,
      showAddAssetSlider: false,
      showAddCategoryModalFlag: false,
      newCategoryName: '',
      isAddingCategory: false,
      // Filters
      showFilters: false,
      selectedBranch: '',
      selectedCategoryFilter: '',
      selectedStatus: '',
      dateFrom: '',
      dateTo: '',
      // Table selection and sorting
      selected: [], // Array to hold selected product IDs
      headers: [
        { text: 'Asset types', value: 'productName', sortable: true },
        { text: 'Category', value: 'category', sortable: true },
        { text: 'Branch', value: 'branch', sortable: true },
        { text: 'Assets ID', value: 'productId', sortable: true },
        { text: 'Status', value: 'status', sortable: true },
      ],
      pagination: { // Mimicking Vuetify's pagination object for sorting
        sortBy: 'productName',
        descending: false,
      },
    }
  },
  computed: {
    filteredProducts() {
      let products = this.products.filter(product => {
        const matchesSearch = this.searchQuery === '' ||
          product.productName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (product.productId && product.productId.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (product.variant && product.variant.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (product.deviceType && product.deviceType.toLowerCase().includes(this.searchQuery.toLowerCase()));

        let matchesCategory = true;
        if (this.selectedCategory && this.selectedCategory.id !== 'all') {
          if (this.selectedCategory.id === 'uncategorized') {
            matchesCategory = !product.category || product.category === '';
          } else {
            matchesCategory = product.category === this.selectedCategory.id;
          }
        }

        // Additional filters
        const matchesBranch = !this.selectedBranch || product.branch === this.selectedBranch;
        const matchesCategoryFilter = !this.selectedCategoryFilter || product.category === this.selectedCategoryFilter;
        const matchesStatus = !this.selectedStatus || (product.status || 'draft') === this.selectedStatus;

        let matchesDateRange = true;
        if (this.dateFrom || this.dateTo) {
          const productDate = new Date(product.createdAt || Date.now());
          if (this.dateFrom) {
            matchesDateRange = matchesDateRange && productDate >= new Date(this.dateFrom);
          }
          if (this.dateTo) {
            matchesDateRange = matchesDateRange && productDate <= new Date(this.dateTo);
          }
        }
        return matchesSearch && matchesCategory && matchesBranch && matchesCategoryFilter && matchesStatus && matchesDateRange;
      });

      // Apply sorting
      if (this.pagination.sortBy) {
        const sortBy = this.pagination.sortBy;
        const descending = this.pagination.descending;
        products.sort((a, b) => {
          const valA = a[sortBy] || '';
          const valB = b[sortBy] || '';

          if (typeof valA === 'string' && typeof valB === 'string') {
            return descending ? valB.localeCompare(valA) : valA.localeCompare(valB);
          }
          // Fallback for non-string values, assuming numerical comparison
          return descending ? valB - valA : valA - valB;
        });
      }

      return products;
    },
    activeFiltersCount() {
      let count = 0;
      if (this.selectedBranch) count++;
      if (this.selectedCategoryFilter) count++;
      if (this.selectedStatus) count++;
      if (this.dateFrom || this.dateTo) count++;
      return count;
    },
    emptyStateTitle() {
      return 'No products found';
    },
    emptyStateDescription() {
      if (this.searchQuery) return 'Try adjusting your search terms';
      if (this.selectedCategory?.id !== 'all') return 'No products in this category';
      return 'Add your first product to get started';
    }
  },
  created() {
    this.productService = new ProductService();
    this.categoryService = new CategoryService();
    this.loadData();
  },
  methods: {
    async loadData() {
      await Promise.all([
        this.loadCategories(),
        this.loadProducts()
      ]);
    },
    async loadCategories() {
      this.isCategoriesLoading = true;
      try {
        const allCategory = { id: 'all', categoryName: 'All', tenant: this.tenantId };
        const uncategorizedCategory = { id: 'uncategorized', categoryName: 'Uncategorized', tenant: this.tenantId };
        const apiCategories = await this.categoryService.getCategories(this.tenantId);
        this.categories = [allCategory, ...apiCategories, uncategorizedCategory];

        if (!this.selectedCategory) {
          this.selectedCategory = allCategory;
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        this.isCategoriesLoading = false;
      }
    },
    async loadProducts() {
      this.isLoading = true;
      try {
        this.products = await this.productService.getProducts(this.tenantId);
        // Add mock branch, status, and createdAt data to products
        this.products = this.products.map(product => ({
          ...product,
          branch: this.branches[Math.floor(Math.random() * this.branches.length)].id,
          status: ['active', 'inactive', 'draft'][Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Mock createdAt within last 30 days
        }));
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        this.isLoading = false;
      }
    },
    onCategoryTabSelected(index) {
      this.selectedCategoryIndex = index;
      this.selectedCategory = this.categories[index];
    },
    getCategoryName(categoryId) {
      if (!categoryId) return 'Uncategorized';
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.categoryName : 'Unknown';
    },
    getBranchName(branchId) {
      if (!branchId) return 'N/A';
      const branch = this.branches.find(b => b.id === branchId);
      return branch ? branch.name : 'Unknown';
    },
    toggleAddAssetSlider() {
      this.showAddAssetSlider = !this.showAddAssetSlider;
    },
    closeAddAssetSlider() {
      this.showAddAssetSlider = false;
    },
    clearFilters() {
      this.selectedBranch = '';
      this.selectedCategoryFilter = '';
      this.selectedStatus = '';
      this.dateFrom = '';
      this.dateTo = '';
    },
    applyFilters() {
      this.showFilters = false;
    },
    showAddCategoryDialog() {
      this.newCategoryName = '';
      this.showAddCategoryModalFlag = true;
    },
    async addCategory() {
      if (!this.newCategoryName) return;

      this.isAddingCategory = true;
      try {
        const newCategory = {
          categoryName: this.newCategoryName,
          tenant: this.tenantId
        };

        const addedCategory = await this.categoryService.createCategory(newCategory);

        if (addedCategory) {
          this.categories.splice(this.categories.length - 1, 0, addedCategory);
          this.selectedCategoryIndex = this.categories.indexOf(addedCategory);
          this.selectedCategory = addedCategory;
          this.showAddCategoryModalFlag = false;
        }
      } catch (error) {
        console.error('Error adding category:', error);
      } finally {
        this.isAddingCategory = false;
      }
    },
    async deleteCategory(category) {
      if (category.id === 'all' || category.id === 'uncategorized') return;

      if (confirm(`Delete category "${category.categoryName}"?`)) {
        try {
          await this.categoryService.deleteCategory(category.id);
          const index = this.categories.findIndex(c => c.id === category.id);
          if (index !== -1) {
            this.categories.splice(index, 1);
          }
          if (this.selectedCategory && this.selectedCategory.id === category.id) {
            this.selectedCategoryIndex = 0;
            this.selectedCategory = this.categories[0];
          }
        } catch (error) {
          console.error('Error deleting category:', error);
        }
      }
    },
    editProduct(product) {
      this.$router.push({ name: 'EditProduct', params: { id: product.id } });
    },
    deleteProduct(product) {
      if (confirm(`Delete product "${product.productName}"?`)) {
        console.log('Delete product:', product);
      }
    },
    navigateToProductDetail(product) {
      this.$router.push({ name: 'ProductDetail', params: { id: product.id } });
    },
    navigateToManualEntry() {
      this.closeAddAssetSlider();
      this.$router.push({
        name: 'ManualEntry',
        query: { tenantId: this.tenantId }
      });
    },
    navigateToBulkUpload() {
      this.closeAddAssetSlider();
      this.$router.push({
        name: 'BulkUpload',
        query: { tenantId: this.tenantId }
      });
    },
    navigateToQRScan() {
      this.closeAddAssetSlider();
      this.$router.push({
        name: 'QRScan',
        query: { tenantId: this.tenantId }
      });
    },
    goBack() {
      this.$router.go(-1);
    },
    toggleSelection(productId) {
      const index = this.selected.indexOf(productId);
      if (index > -1) {
        this.selected.splice(index, 1);
      } else {
        this.selected.push(productId);
      }
    },
    toggleAll() {
      if (this.selected.length === this.filteredProducts.length) {
        this.selected = [];
      } else {
        this.selected = this.filteredProducts.map(p => p.id);
      }
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    },
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}
.product-management {
  max-height: 100vh;
  background-color: #f8fafc;

  overflow-y: auto;
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
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  max-width: 1600px;
  margin: 0 auto;
}
.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}
.back-button:hover {
  background: #e2e8f0;
  color: #475569;
}
.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Search */
.search-container {
  flex: 1;
  max-width: 280px;
}
.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
.search-input:focus-within {
  border-color: #68ade1;
  box-shadow: 0 0 0 3px rgba(104, 173, 225, 0.1);
}
.search-input svg {
  position: absolute;
  left: 0.625rem;
  color: #64748b;
}
.search-input input {
  width: 100%;
  padding: 0.375rem 1.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  background: transparent;
  color: #1e293b;
}
.search-input input:focus {
  outline: none;
}
.search-input input::placeholder {
  color: #94a3b8;
}

/* Filter Toggle */
.filter-toggle {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8125rem;
  position: relative;
}
.filter-toggle:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.filter-toggle.active {
  background: #eff6ff;
  border-color: #68ade1;
  color: #68ade1;
}
.filter-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 600;
}

/* Filter Sidebar */
.filter-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}
.filter-sidebar-overlay.show {
  opacity: 1;
  visibility: visible;
}
.filter-sidebar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}
.filter-sidebar-overlay.show .filter-sidebar {
  transform: translateX(0);
}
.filter-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}
.filter-sidebar-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}
.filter-sidebar-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.filter-group {
  display: flex;
  flex-direction: column;
}
.filter-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}
.filter-select, .filter-input {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.8125rem;
  background: white;
}
.filter-select:focus, .filter-input:focus {
  outline: none;
  border-color: #68ade1;
  box-shadow: 0 0 0 3px rgba(104, 173, 225, 0.1);
}
.date-range {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.date-separator {
  font-size: 0.8125rem;
  color: #64748b;
}
.filter-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
}

/* Category Filter */
.category-filter {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
}
.category-tabs {
  display: flex;
  gap: 0.375rem;
  overflow-x: auto;
  max-width: 1600px;
  margin: 0 auto;
}
.category-tab {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #64748b;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.category-tab:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.category-tab.active {
  background: #68ade1;
  border-color: #68ade1;
  color: white;
}
.delete-btn {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
}
.category-tab.active .delete-btn {
  background: rgba(255, 255, 255, 0.2);
}
.add-category-btn {
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px dashed #68ade1;
  border-radius: 4px;
  color: #68ade1;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.add-category-btn:hover {
  background: rgba(104, 173, 225, 0.05);
}

/* Main Content */
.main-content {
 
  margin: 0 auto;
 
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #68ade1;
  animation: spin 1s linear infinite;
  margin-bottom: 0.75rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px;
  padding: 2rem 1.5rem;
  text-align: center;
  border: 1px solid #e2e8f0;
}
.empty-icon {
  color: #94a3b8;
  margin-bottom: 0.75rem;
}
.empty-state h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.375rem 0;
}
.empty-state p {
  color: #64748b;
  margin: 0 0 1rem 0;
  font-size: 0.8125rem;
}

/* Products List (Table) */
.products-list {
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  width: 100%; /* Ensure it takes full width */
}

.product-table {
  width: 100%;
  border-collapse: collapse; /* Important for tables */
}

.product-table thead tr {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #475569;
  font-size: 0.75rem;
}

.product-table th {
  padding: 0.625rem 0.75rem;
  text-align: left; /* Default for table headers */
  position: relative; /* For sort icon positioning */
  white-space: nowrap; /* Prevent header text from wrapping */
}

.product-table th.sortable {
  cursor: pointer;
}

.product-table th .sort-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0; /* Hide by default */
  transition: opacity 0.2s ease;
}

.product-table th.sortable:hover .sort-icon,
.product-table th.active .sort-icon {
  opacity: 1; /* Show on hover or if active */
}

.product-table th.desc .sort-icon {
  transform: translateY(-50%) rotate(180deg); /* Rotate for descending */
}

.product-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
  cursor: pointer;
}

.product-table tbody tr:last-child {
  border-bottom: none;
}

.product-table tbody tr:hover {
  background-color: #f8fafc;
}

.product-table tbody tr.selected-row {
  background-color: #eff6ff; /* Highlight selected row */
}

.product-table td {
  padding: 0.625rem 0.75rem;
  vertical-align: middle;
  font-size: 0.8125rem;
  color: #1e293b;
}

/* Column Widths */
.product-table th.checkbox-col, .product-table td.checkbox-col { width: 5%; text-align: center; }
.product-table th.product-col, .product-table td.product-col { width: 30%; }
.product-table th.category-col, .product-table td.category-col { width: 15%; }
.product-table th.branch-col, .product-table td.branch-col { width: 15%; }
.product-table th.id-col, .product-table td.id-col { width: 20%; }
.product-table th.status-col, .product-table td.status-col { width: 15%; }


.checkbox-col {
    width: 18px;
    height: 18px;
}
/* Product Info */
.product-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.product-image {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  background: #68ade1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder-image {
  color: white;
}
.product-name {
  font-weight: 500;
}

/* Badges */
.category-badge, .branch-badge {
  padding: 0.1875rem 0.375rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 500;
}
.branch-badge {
  background: #ecfdf5;
  color: #065f46;
}
.status-badge {
  padding: 0.1875rem 0.375rem;
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 500;
}
.status-badge.active {
  background: #dcfce7;
  color: #166534;
}
.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}
.status-badge.draft {
  background: #fef3c7;
  color: #92400e;
}

/* Actions (kept for consistency, though not directly used in table cells now) */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.375rem;
}
.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}
.action-btn.delete:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

/* Slider */
.slider-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}
.slider-overlay.show {
  opacity: 1;
  visibility: visible;
}
.slider-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}
.slider-overlay.show .slider-panel {
  transform: translateX(0);
}
.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}
.slider-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.slider-content {
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.add-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}
.add-option:hover {
  border-color: #68ade1;
  box-shadow: 0 4px 12px rgba(104, 173, 225, 0.1);
  transform: translateY(-1px);
}
.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.option-icon.manual {
  background: linear-gradient(135deg, #68ade1, #4a8fd6);
}
.option-icon.bulk {
  background: linear-gradient(135deg, #10b981, #059669);
}
.option-content {
  flex: 1;
}
.option-content h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.1875rem 0;
}
.option-content p {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
}
.option-arrow {
  color: #9ca3af;
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
.modal-content {
  background: white;
  border-radius: 6px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.modal-body {
  padding: 1.25rem;
}
.form-group {
  margin-bottom: 0.75rem;
}
.form-group label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}
.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.8125rem;
  transition: border-color 0.2s ease;
}
.form-input:focus {
  outline: none;
  border-color: #68ade1;
  box-shadow: 0 0 0 3px rgba(104, 173, 225, 0.1);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1.25rem;
  border-top: 1px solid #e2e8f0;
}

/* Buttons */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #68ade1;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-primary:hover:not(:disabled) {
  background: #5a9fd4;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Responsive */
@media (max-width: 1024px) {
  .products-list {
    overflow-x: auto;
  }
  .product-table {
    min-width: 800px; /* Ensure table content doesn't collapse too much */
  }
  .slider-panel, .filter-sidebar {
    width: 100%;
  }
}
@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .search-container {
    order: 3;
    flex: 1 1 100%;
    max-width: none;
  }
  .main-content {
    padding: 0.75rem;
  }
}
</style>

<template>
  <div class="category-tab-bar">
    <div class="tabs-container" ref="tabsContainer">
      <div 
        v-for="(category, index) in categories" 
        :key="category.id"
        class="tab"
        :class="{ 'active': selectedIndex === index }"
        @click="onTabSelected(index)"
        @contextmenu.prevent="showDeleteDialog(category)"
      >
        <i v-if="category.icon" class="tab-icon" :class="getIconClass(category.icon)"></i>
        <span class="tab-text">{{ category.categoryName }}</span>
        <span v-if="category.productCount" class="tab-count">{{ category.productCount }}</span>
      </div>
      <div v-if="showAddTab" class="tab add-tab" @click="onAddCategory">
        <i class="tab-icon fas fa-plus"></i>
        <span class="tab-text">Add Category</span>
      </div>
    </div>
    <button v-if="showOverflowButton" class="overflow-button" @click="showCategoryDropdown">
      <i class="fas fa-chevron-down"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'CategoryTabBar',
  props: {
    categories: {
      type: Array,
      required: true
    },
    selectedIndex: {
      type: Number,
      default: 0
    },
    showAddTab: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showOverflowButton: false
    }
  },
  mounted() {
    this.checkOverflow();
    window.addEventListener('resize', this.checkOverflow);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkOverflow);
  },
  methods: {
    onTabSelected(index) {
      this.$emit('tab-selected', index);
    },
    onAddCategory() {
      this.$emit('add-category');
    },
    showDeleteDialog(category) {
      // Don't allow deleting special categories
      if (category.id === 'all' || category.id === 'uncategorized') {
        this.$emit('show-error', 'Cannot delete this category');
        return;
      }
      
      if (confirm(`Are you sure you want to delete "${category.categoryName}"? All products in this category will be moved to Uncategorized.`)) {
        this.$emit('delete-category', category);
      }
    },
    checkOverflow() {
      if (!this.$refs.tabsContainer) return;
      
      const container = this.$refs.tabsContainer;
      this.showOverflowButton = container.scrollWidth > container.clientWidth;
    },
    showCategoryDropdown() {
      // This would be implemented with a modal or dropdown component
      // For simplicity, we'll just emit an event
      this.$emit('show-category-dropdown');
    },
    getIconClass(iconCode) {
      // Convert icon code to class name
      // This is a simplified version - you might need to map Flutter icons to Font Awesome
      return 'fas fa-tag';
    }
  }
}
</script>

<style scoped>
.category-tab-bar {
  height: 48px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  position: relative;
}

.tabs-container {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  flex-grow: 1;
}

.tabs-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.tab {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 100%;
  white-space: nowrap;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  position: relative;
}

.tab.active {
  color: var(--primary-color);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--primary-color);
}

.tab-icon {
  margin-right: 6px;
  font-size: 16px;
}

.tab-text {
  font-size: 14px;
  font-weight: 500;
}

.tab-count {
  margin-left: 6px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

.add-tab {
  color: var(--primary-color);
}

.overflow-button {
  width: 40px;
  height: 48px;
  background: linear-gradient(to left, white 70%, rgba(255, 255, 255, 0) 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
}
</style>

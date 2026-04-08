<template>
  <div class="data-table-wrapper" :class="wrapperClass">
    <!-- Title Only Row (when in loading/empty/error state) -->
    <div v-if="shouldShowTitleOnly" class="table-title-only-row">
      <h2 v-if="title" class="table-title">{{ title }}</h2>
    </div>

    <!-- Full Header Row (when showing data) -->
    <div v-else class="table-header-row">
      <!-- Left Side: Title and Search -->
      <div class="header-left">
        <h2 v-if="title" class="table-title">{{ title }}</h2>
        <slot name="before-search"></slot>
        <!-- Search Bar -->
        <div v-if="showSearch" class="search-input-wrapper">
          <Search :size="16" class="search-icon" />
          <input
            type="text"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            :placeholder="searchPlaceholder"
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="$emit('update:searchQuery', '')"
            class="search-clear"
          >
            <X :size="14" />
          </button>
        </div>
      </div>

      <!-- Right Side: Action Buttons -->
      <div class="header-right">
        <slot name="toolbar-actions" />
      </div>
    </div>

    <!-- Description (if provided and not in state) -->
    <div
      v-if="description && !shouldShowTitleOnly"
      class="table-description-row"
    >
      <p class="table-description">{{ description }}</p>
    </div>
    <!-- Table Content -->
    <slot name="below-search" />
    <div class="table-container">
      <slot />
    </div>

    <!-- Pagination (only show when not in loading/empty/error state) -->
    <div
      v-if="$slots.pagination && !shouldHidePagination"
      class="table-pagination"
    >
      <slot name="pagination" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Search, X } from "lucide-vue-next";

const props = defineProps({
  title: String,
  description: String,
  searchQuery: String,
  searchPlaceholder: {
    type: String,
    default: "Search...",
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  showDefaultToolbar: {
    type: Boolean,
    default: true,
  },
  wrapperClass: String,
  // New props to control visibility during states
  hideHeaderOnLoading: {
    type: Boolean,
    default: true,
  },
  hideHeaderOnEmpty: {
    type: Boolean,
    default: true,
  },
  hideHeaderOnError: {
    type: Boolean,
    default: true,
  },
  hidePaginationOnStates: {
    type: Boolean,
    default: true,
  },
  // State indicators
  isLoading: Boolean,
  isEmpty: Boolean,
  hasError: Boolean,
});

defineEmits(["update:searchQuery"]);

const shouldShowTitleOnly = computed(() => {
  return (
    (props.isLoading && props.hideHeaderOnLoading) ||
    (props.isEmpty && props.hideHeaderOnEmpty) ||
    (props.hasError && props.hideHeaderOnError)
  );
});

const shouldHidePagination = computed(() => {
  return (
    props.hidePaginationOnStates &&
    (props.isLoading || props.isEmpty || props.hasError)
  );
});
</script>

<style scoped>
.data-table-wrapper {
  border-radius: 0.5rem;
  /* overflow: hidden; */
}

.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
  gap: 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border: 1px solid #b9b4b4;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #1e293b;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: #e2e8f0;
  color: #475569;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  position: relative;
  z-index: 10001;
}

.table-description-row {
  padding: 0 1.5rem 1rem 1.5rem;
  background: #fafbfc;
  border-bottom: 1px solid #f1f5f9;
}

.table-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.table-container {
  border-radius: 8px;
  overflow: visible;
}

.table-pagination {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}

.table-title-only-row {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.table-title-only-row .table-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

@media (max-width: 768px) {
  .table-header-row {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-right {
    justify-content: flex-start;
  }

  .search-input-wrapper {
    max-width: none;
  }
}
</style>

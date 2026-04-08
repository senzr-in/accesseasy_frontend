<template>
  <div v-if="!isSearching" class="pagination-container">
    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <!-- Top row: Page numbers and navigation -->
      <div class="mobile-nav-row">
        <!-- Previous page button -->
        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="nav-button"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <!-- Page numbers -->
        <div class="page-numbers">
          <!-- First page -->
          <button
            v-if="shouldShowFirstPage"
            @click="handlePageChange(1)"
            :class="['page-number', { active: currentPage === 1 }]"
          >
            1
          </button>

          <!-- Left ellipsis -->
          <span v-if="shouldShowLeftEllipsis" class="ellipsis">...</span>

          <!-- Visible page numbers -->
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="handlePageChange(page)"
            :class="['page-number', { active: currentPage === page }]"
          >
            {{ page }}
          </button>

          <!-- Right ellipsis -->
          <span v-if="shouldShowRightEllipsis" class="ellipsis">...</span>

          <!-- Last page -->
          <button
            v-if="shouldShowLastPage"
            @click="handlePageChange(totalPages)"
            :class="['page-number', { active: currentPage === totalPages }]"
          >
            {{ totalPages }}
          </button>
        </div>

        <!-- Next page button -->
        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="nav-button"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Bottom row: Controls and info -->
      <div class="mobile-controls-row">
        <!-- Go to page dropdown with total count and pages -->
        <div class="go-to-page">
          <span class="go-to-label">Go to page:</span>
          <select
            v-model="localItemsPerPage"
            @change="updateItemsPerPage"
            class="page-select"
          >
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
            <option :value="100">100 per page</option>
            <option :value="500">500 per page</option>
            <option :value="3000">3000 per page</option>
          </select>
          <div class="info-section">
            <span class="total-count">Total: {{ totalItems }}</span>
            <span class="total-pages">Pages: {{ totalPages }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Layout (hidden on mobile) -->
    <div class="desktop-layout">
      <!-- Previous page button -->
      <button
        @click="handlePageChange(currentPage - 1)"
        :disabled="currentPage === 1"
        class="nav-button"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <!-- Page numbers -->
      <div class="page-numbers">
        <!-- First page -->
        <button
          v-if="shouldShowFirstPage"
          @click="handlePageChange(1)"
          :class="['page-number', { active: currentPage === 1 }]"
        >
          1
        </button>

        <!-- Left ellipsis -->
        <span v-if="shouldShowLeftEllipsis" class="ellipsis">...</span>

        <!-- Visible page numbers -->
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="handlePageChange(page)"
          :class="['page-number', { active: currentPage === page }]"
        >
          {{ page }}
        </button>

        <!-- Right ellipsis -->
        <span v-if="shouldShowRightEllipsis" class="ellipsis">...</span>

        <!-- Last page -->
        <button
          v-if="shouldShowLastPage"
          @click="handlePageChange(totalPages)"
          :class="['page-number', { active: currentPage === totalPages }]"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Next page button -->
      <button
        @click="handlePageChange(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="nav-button"
      >
        <i class="fas fa-chevron-right"></i>
      </button>

      <!-- Go to page dropdown with total count and pages -->
      <div class="go-to-page">
        <span class="go-to-label">Go to page:</span>
        <select
          v-model="localItemsPerPage"
          @change="updateItemsPerPage"
          class="page-select"
        >
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <!-- <option :value="100">100 per page</option>
          <option :value="500">500 per page</option>
          <option :value="3000">3000 per page</option> -->
        </select>
        <div class="info-section">
          <span class="total-count">Total: {{ totalItems }}</span>
          <span class="total-pages">Pages: {{ totalPages }}</span>
        </div>
      </div>
    </div>

    <!-- Hidden input for direct page navigation (keeping original functionality) -->
    <input
      v-model.number="currentPageInput"
      @keyup.enter="handlePageInputChange"
      type="number"
      min="1"
      :max="totalPages"
      style="display: none"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  isSearching: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:page", "update:itemsPerPage"]);

const currentPage = computed({
  get: () => props.page,
  set: (value) => emit("update:page", value),
});

const currentPageInput = ref(props.page);
const localItemsPerPage = ref(props.itemsPerPage);

const totalPages = computed(() =>
  Math.ceil(props.totalItems / props.itemsPerPage),
);

// Enhanced mobile-friendly pagination logic
const visiblePages = computed(() => {
  const pages = [];
  const current = currentPage.value;
  const total = totalPages.value;

  // For mobile, show fewer pages
  const isMobile = window.innerWidth <= 768;
  const maxVisible = isMobile ? 3 : 5;

  if (total <= maxVisible + 2) {
    // Show all pages if total is small
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Show pages around current page
    let start = Math.max(2, current - Math.floor(maxVisible / 2));
    let end = Math.min(total - 1, start + maxVisible - 1);

    // Adjust if we're near the beginning
    if (start === 2 && current <= Math.ceil(maxVisible / 2)) {
      end = Math.min(total - 1, maxVisible);
    }

    // Adjust if we're near the end
    if (end === total - 1 && current >= total - Math.floor(maxVisible / 2)) {
      start = Math.max(2, total - maxVisible);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

const shouldShowFirstPage = computed(() => {
  return totalPages.value > 1 && !visiblePages.value.includes(1);
});

const shouldShowLastPage = computed(() => {
  return totalPages.value > 1 && !visiblePages.value.includes(totalPages.value);
});

const shouldShowLeftEllipsis = computed(() => {
  return shouldShowFirstPage.value && visiblePages.value[0] > 2;
});

const shouldShowRightEllipsis = computed(() => {
  return (
    shouldShowLastPage.value &&
    visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1
  );
});

// Keep all your existing methods unchanged
const handlePageChange = (newPage) => {
  emit("update:page", newPage);
};

const handlePageInputChange = () => {
  let newPage = parseInt(currentPageInput.value);
  if (isNaN(newPage) || newPage < 1) {
    newPage = 1;
  } else if (newPage > totalPages.value) {
    newPage = totalPages.value;
  }
  handlePageChange(newPage);
};

const updateItemsPerPage = () => {
  emit("update:itemsPerPage", localItemsPerPage.value);
};

watch(
  () => props.page,
  (newPage) => {
    currentPageInput.value = newPage;
  },
);

watch(
  () => props.itemsPerPage,
  (newItemsPerPage) => {
    localItemsPerPage.value = newItemsPerPage;
  },
);
</script>

<style scoped>
.pagination-container {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 1rem rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Mobile Layout */
.mobile-layout {
  display: none;
}

.mobile-nav-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.mobile-controls-row {
  display: flex;
  justify-content: center;
}

/* Desktop Layout */
.desktop-layout {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem;
}

.nav-button {
  background-color: #6b7280;
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.nav-button:hover:not(:disabled) {
  background-color: #4b5563;
  transform: translateY(-1px);
}

.nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.page-numbers::-webkit-scrollbar {
  display: none;
}

.page-number {
  background-color: transparent;
  color: #6b7280;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.page-number:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.page-number.active {
  background-color: #059367;
  color: white;
  font-weight: 600;
}

.ellipsis {
  color: #9ca3af;
  font-weight: 500;
  padding: 0 0.25rem;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.go-to-page {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.go-to-label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.page-select {
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background-color: white;
  font-size: 0.875rem;
  cursor: pointer;
  color: #374151;
  min-width: 120px;
  transition: all 0.2s ease;
}

.page-select:hover {
  border-color: #9ca3af;
}

.page-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* INFO SECTION WITH TOTAL COUNT AND PAGES */
.info-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 0.75rem;
  border-left: 1px solid #d1d5db;
}

.total-count,
.total-pages {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.total-pages {
  color: #3b82f6;
  font-weight: 600;
}

/* Tablet Responsive */
@media (max-width: 1024px) {
  .pagination-container {
    padding: 0.875rem 1.25rem;
  }

  .desktop-layout {
    gap: 0.5rem;
  }

  .go-to-page {
    margin-left: 0.75rem;
    gap: 0.5rem;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .pagination-container {
    padding: 1rem;
  }

  /* Hide desktop layout, show mobile layout */
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .nav-button,
  .page-number {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.8rem;
  }

  .page-numbers {
    gap: 0.375rem;
    max-width: calc(100vw - 8rem);
  }

  .go-to-page {
    margin-left: 0;
    gap: 0.5rem;
  }

  .page-select {
    min-width: 110px;
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
  }

  .info-section {
    gap: 0.5rem;
    padding-left: 0.5rem;
  }

  .total-count,
  .total-pages {
    font-size: 0.8rem;
  }

  .go-to-label {
    font-size: 0.8rem;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .pagination-container {
    padding: 0.75rem;
  }

  .mobile-nav-row {
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }

  .nav-button,
  .page-number {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  .page-numbers {
    gap: 0.25rem;
    max-width: calc(100vw - 6rem);
  }

  .go-to-page {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .go-to-label {
    display: none;
  }

  .page-select {
    min-width: 100px;
    font-size: 0.75rem;
  }

  .info-section {
    border-left: none;
    padding-left: 0;
    justify-content: center;
  }

  .total-count,
  .total-pages {
    font-size: 0.75rem;
    text-align: center;
  }

  .ellipsis {
    font-size: 0.75rem;
  }
}

/* Extra Small Mobile */
@media (max-width: 360px) {
  .pagination-container {
    padding: 0.5rem;
  }

  .mobile-nav-row {
    margin-bottom: 0.5rem;
  }

  .nav-button,
  .page-number {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.7rem;
  }

  .page-numbers {
    max-width: calc(100vw - 5rem);
  }

  .page-select {
    min-width: 90px;
    font-size: 0.7rem;
    padding: 0.3rem 0.5rem;
  }

  .total-count,
  .total-pages {
    font-size: 0.7rem;
  }

  .info-section {
    gap: 0.375rem;
  }
}

/* Landscape Mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .mobile-layout {
    display: none;
  }

  .desktop-layout {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .go-to-page {
    margin-left: 0;
    margin-top: 0.5rem;
    width: 100%;
    justify-content: center;
  }
}
</style>

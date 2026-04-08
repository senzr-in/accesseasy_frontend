<!-- src/components/common/states/SkeletonLoading.vue -->
<template>
  <div class="skeleton-wrapper">
    <!-- Data Table Skeleton -->
    <div v-if="variant === 'data-table'" class="data-table-skeleton">
      <!-- Table Header -->
      <div class="table-header-skeleton">
        <div class="header-row-skeleton">
          <div class="skeleton-checkbox"></div>
          <div
            v-for="col in columns"
            :key="col"
            class="header-cell-skeleton"
            :style="{ flex: getColumnFlex(col) }"
          >
            <div class="skeleton-shimmer header-text"></div>
            <div class="skeleton-sort-icon"></div>
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="table-body-skeleton">
        <div v-for="row in rows" :key="row" class="body-row-skeleton">
          <div class="skeleton-checkbox"></div>
          <div
            v-for="col in columns"
            :key="col"
            class="body-cell-skeleton"
            :style="{ flex: getColumnFlex(col) }"
          >
            <div class="cell-content-skeleton">
              <div
                class="skeleton-shimmer"
                :class="getCellContentClass(col)"
              ></div>
              <div
                v-if="col === 1"
                class="skeleton-shimmer secondary-text"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Body Only Skeleton - Only shows data rows, no header -->
    <div
      v-else-if="variant === 'table-body-only'"
      class="table-body-only-skeleton"
    >
      <div v-for="row in rows" :key="row" class="body-row-skeleton">
        <div class="skeleton-checkbox"></div>
        <div
          v-for="col in columns"
          :key="col"
          class="body-cell-skeleton"
          :style="{ flex: getColumnFlex(col) }"
        >
          <div class="cell-content-skeleton">
            <div
              class="skeleton-shimmer"
              :class="getCellContentClass(col)"
            ></div>
            <div v-if="col === 1" class="skeleton-shimmer secondary-text"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Panel Skeleton -->
    <div v-else-if="variant === 'filter-panel'" class="filter-panel-skeleton">
      <div class="filter-header-skeleton">
        <div class="skeleton-shimmer filter-title"></div>
        <div class="filter-actions-skeleton">
          <div class="skeleton-shimmer action-btn"></div>
          <div class="skeleton-shimmer action-btn"></div>
        </div>
      </div>

      <div class="filter-sections-skeleton">
        <div
          v-for="section in sections"
          :key="section"
          class="filter-section-skeleton"
        >
          <div class="section-header-skeleton">
            <div class="skeleton-shimmer section-icon"></div>
            <div class="skeleton-shimmer section-title"></div>
          </div>
          <div class="skeleton-shimmer filter-input"></div>
        </div>
      </div>
    </div>

    <!-- Toolbar Skeleton -->
    <div v-else-if="variant === 'toolbar'" class="toolbar-skeleton">
      <div class="toolbar-left-skeleton">
        <div class="skeleton-shimmer search-input"></div>
      </div>
      <div class="toolbar-right-skeleton">
        <div
          v-for="btn in toolbarButtons"
          :key="btn"
          class="skeleton-shimmer toolbar-btn"
        ></div>
      </div>
    </div>

    <!-- Pagination Skeleton -->
    <div v-else-if="variant === 'pagination'" class="pagination-skeleton">
      <div class="pagination-nav-skeleton">
        <div class="skeleton-shimmer nav-btn"></div>
        <div class="page-numbers-skeleton">
          <div
            v-for="page in 5"
            :key="page"
            class="skeleton-shimmer page-number"
          ></div>
        </div>
        <div class="skeleton-shimmer nav-btn"></div>
      </div>
      <div class="pagination-info-skeleton">
        <div class="skeleton-shimmer page-select"></div>
        <div class="pagination-text-skeleton">
          <div class="skeleton-shimmer info-text"></div>
          <div class="skeleton-shimmer info-text"></div>
        </div>
      </div>
    </div>

    <!-- Card Grid Skeleton -->
    <div v-else-if="variant === 'card-grid'" class="card-grid-skeleton">
      <div v-for="card in cards" :key="card" class="card-skeleton">
        <div class="card-header-skeleton">
          <div class="skeleton-shimmer card-title"></div>
          <div class="skeleton-shimmer card-subtitle"></div>
        </div>
        <div class="card-body-skeleton">
          <div class="skeleton-shimmer card-content"></div>
          <div class="skeleton-shimmer card-content short"></div>
          <div class="skeleton-shimmer card-content medium"></div>
        </div>
        <div class="card-footer-skeleton">
          <div class="skeleton-shimmer card-action"></div>
        </div>
      </div>
    </div>

    <!-- List Items Skeleton -->
    <div v-else-if="variant === 'list'" class="list-skeleton">
      <div v-for="item in items" :key="item" class="list-item-skeleton">
        <div class="skeleton-shimmer list-avatar"></div>
        <div class="list-content-skeleton">
          <div class="skeleton-shimmer list-title"></div>
          <div class="skeleton-shimmer list-subtitle"></div>
        </div>
        <div class="list-actions-skeleton">
          <div class="skeleton-shimmer list-action"></div>
        </div>
      </div>
    </div>

    <!-- Form Skeleton -->
    <div v-else-if="variant === 'form'" class="form-skeleton">
      <div v-for="field in formFields" :key="field" class="form-field-skeleton">
        <div class="skeleton-shimmer field-label"></div>
        <div class="skeleton-shimmer field-input"></div>
      </div>
      <div class="form-actions-skeleton">
        <div class="skeleton-shimmer form-btn primary"></div>
        <div class="skeleton-shimmer form-btn secondary"></div>
      </div>
    </div>

    <!-- Text Block Skeleton -->
    <div v-else-if="variant === 'text'" class="text-skeleton">
      <div
        v-for="line in textLines"
        :key="line"
        class="skeleton-shimmer text-line"
        :class="{ short: line === textLines }"
      ></div>
    </div>

    <!-- Custom Content Skeleton -->
    <div v-else-if="variant === 'custom'" class="custom-skeleton">
      <slot name="skeleton-content">
        <div class="skeleton-shimmer default-content"></div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "data-table",
    validator: (value) =>
      [
        "data-table",
        "table-body-only",
        "filter-panel",
        "toolbar",
        "pagination",
        "card-grid",
        "list",
        "form",
        "text",
        "custom",
      ].includes(value),
  },
  rows: {
    type: Number,
    default: 6,
  },
  columns: {
    type: Number,
    default: 6,
  },
  cards: {
    type: Number,
    default: 4,
  },
  items: {
    type: Number,
    default: 5,
  },
  sections: {
    type: Number,
    default: 4,
  },
  toolbarButtons: {
    type: Number,
    default: 4,
  },
  formFields: {
    type: Number,
    default: 5,
  },
  textLines: {
    type: Number,
    default: 4,
  },
  height: {
    type: String,
    default: "auto",
  },
  animated: {
    type: Boolean,
    default: true,
  },
});

// Column flex values for realistic table layout
const getColumnFlex = (index) => {
  const flexValues = ["2", "2.5", "1.5", "1.5", "2", "2"];
  return flexValues[index - 1] || "1";
};

// Cell content classes for different column types
const getCellContentClass = (index) => {
  const classes = [
    "primary-text",
    "description-text",
    "badge-text",
    "status-text",
    "user-text",
    "client-text",
  ];
  return classes[index - 1] || "primary-text";
};
</script>

<style scoped>
.skeleton-wrapper {
  width: 100%;

}

/* Base Shimmer Animation */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* Data Table Skeleton */
.data-table-skeleton {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Table Body Only Skeleton - No header, just data rows */
.table-body-only-skeleton {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header-skeleton {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem;
}

.header-row-skeleton {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skeleton-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.header-cell-skeleton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.header-text {
  height: 14px;
  width: 70%;
}

.skeleton-sort-icon {
  width: 12px;
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 2px;
}

.table-body-skeleton {
  padding: 0;
}

.body-row-skeleton {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
}

.body-row-skeleton:last-child {
  border-bottom: none;
}

.body-cell-skeleton {
  min-width: 0;
}

.cell-content-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.primary-text {
  height: 16px;
  width: 85%;
}

.secondary-text {
  height: 12px;
  width: 60%;
}

.description-text {
  height: 14px;
  width: 90%;
}

.badge-text {
  height: 20px;
  width: 60px;
  border-radius: 10px;
}

.status-text {
  height: 18px;
  width: 70px;
  border-radius: 9px;
}

.user-text {
  height: 16px;
  width: 75%;
}

.client-text {
  height: 16px;
  width: 80%;
}

/* Filter Panel Skeleton */
.filter-panel-skeleton {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-header-skeleton {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-title {
  height: 20px;
  width: 120px;
}

.filter-actions-skeleton {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  height: 32px;
  width: 70px;
  border-radius: 6px;
}

.filter-sections-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-section-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header-skeleton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.section-title {
  height: 16px;
  width: 100px;
}

.filter-input {
  height: 40px;
  border-radius: 6px;
}

/* Toolbar Skeleton */
.toolbar-skeleton {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar-left-skeleton {
  flex: 1;
  max-width: 300px;
}

.search-input {
  height: 40px;
  border-radius: 6px;
}

.toolbar-right-skeleton {
  display: flex;
  gap: 0.75rem;
}

.toolbar-btn {
  height: 36px;
  width: 100px;
  border-radius: 6px;
}

/* Pagination Skeleton */
.pagination-skeleton {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination-nav-skeleton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.page-numbers-skeleton {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.pagination-info-skeleton {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-select {
  height: 36px;
  width: 120px;
  border-radius: 6px;
}

.pagination-text-skeleton {
  display: flex;
  gap: 0.75rem;
}

.info-text {
  height: 16px;
  width: 80px;
}

/* Card Grid Skeleton */
.card-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.card-skeleton {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header-skeleton {
  margin-bottom: 1rem;
}

.card-title {
  height: 20px;
  width: 80%;
  margin-bottom: 0.5rem;
}

.card-subtitle {
  height: 14px;
  width: 60%;
}

.card-body-skeleton {
  margin-bottom: 1rem;
}

.card-content {
  height: 14px;
  width: 100%;
  margin-bottom: 0.5rem;
}

.card-content.short {
  width: 70%;
}

.card-content.medium {
  width: 85%;
}

.card-footer-skeleton {
  display: flex;
  justify-content: flex-end;
}

.card-action {
  height: 32px;
  width: 80px;
  border-radius: 6px;
}

/* List Skeleton */
.list-skeleton {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.list-item-skeleton {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
}

.list-item-skeleton:last-child {
  border-bottom: none;
}

.list-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.list-content-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.list-title {
  height: 16px;
  width: 70%;
}

.list-subtitle {
  height: 12px;
  width: 50%;
}

.list-actions-skeleton {
  flex-shrink: 0;
}

.list-action {
  height: 32px;
  width: 70px;
  border-radius: 6px;
}

/* Form Skeleton */
.form-skeleton {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-field-skeleton {
  margin-bottom: 1.5rem;
}

.field-label {
  height: 16px;
  width: 120px;
  margin-bottom: 0.5rem;
}

.field-input {
  height: 40px;
  border-radius: 6px;
}

.form-actions-skeleton {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.form-btn {
  height: 40px;
  border-radius: 6px;
}

.form-btn.primary {
  width: 100px;
}

.form-btn.secondary {
  width: 80px;
}

/* Text Skeleton */
.text-skeleton {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.text-line {
  height: 16px;
  width: 100%;
  margin-bottom: 0.75rem;
}

.text-line.short {
  width: 70%;
}

.text-line:last-child {
  margin-bottom: 0;
}

/* Custom Skeleton */
.custom-skeleton {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.default-content {
  height: 200px;
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-row-skeleton,
  .body-row-skeleton {
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .toolbar-skeleton {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .toolbar-right-skeleton {
    justify-content: center;
  }

  .pagination-skeleton {
    flex-direction: column;
    gap: 1rem;
  }

  .card-grid-skeleton {
    grid-template-columns: 1fr;
  }

  .toolbar-btn {
    width: 80px;
  }
}

/* Dark Mode Support */
/* @media (prefers-color-scheme: dark) {
  .skeleton-shimmer,
  .skeleton-checkbox,
  .skeleton-sort-icon {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  }

  .data-table-skeleton,
  .table-body-only-skeleton,
  .filter-panel-skeleton,
  .toolbar-skeleton,
  .pagination-skeleton,
  .card-skeleton,
  .list-skeleton,
  .form-skeleton,
  .text-skeleton,
  .custom-skeleton {
    background: #1a1a1a;
    border-color: #333;
  }

  .table-header-skeleton {
    background: #222;
  }

  .body-row-skeleton,
  .list-item-skeleton {
    border-color: #333;
  }
} */

/* Animation Control */
.skeleton-wrapper[data-animated="false"] .skeleton-shimmer,
.skeleton-wrapper[data-animated="false"] .skeleton-checkbox,
.skeleton-wrapper[data-animated="false"] .skeleton-sort-icon {
  animation: none;
  background: #f0f0f0;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer,
  .skeleton-checkbox,
  .skeleton-sort-icon {
    animation: none;
  }
}
</style>

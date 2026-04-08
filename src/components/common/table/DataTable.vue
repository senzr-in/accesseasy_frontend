<template>
  <div class="data-table">
    <div class="table-scroll-container">
      <!-- Table Header -->
      <DataTableHeader
        :columns="columns"
        :selectedItems="selectedItems"
        :allItems="items"
        :sortBy="currentSortBy"
        :sortDirection="currentSortDirection"
        :showSelection="showSelection"
        @toggleSelectAll="handleToggleSelectAll"
        @requestSort="handleSort"
      />

      <!-- Table Body -->
      <div class="table-body">
        <DataTableRow
          v-for="item in items"
          :key="getItemKey(item)"
          :item="item"
          :columns="columns"
          :isSelected="isItemSelected(item)"
          :isExpanded="expandedItemId === getItemKey(item)"
          :showSelection="showSelection"
          :expandable="expandable"
          @toggleSelection="handleToggleSelection(item)"
          @rowClick="handleRowClick(item)"
          @toggleExpanded="handleToggleExpanded(item)"
        >
          <!-- Expandable Content Slot -->
          <template #expanded-content="{ item }" v-if="expandable">
            <slot name="expanded-content" :item="item" />
          </template>

          <!-- Custom Cell Content Slots -->
          <template
            v-for="column in columns"
            :key="column.key"
            #[`cell-${column.key}`]="{ item, value }"
          >
            <slot
              :name="`cell-${column.key}`"
              :item="item"
              :value="value"
              :column="column"
            >
              <!-- Default cell content -->
              <span>{{ value }}</span>
            </slot>
          </template>
        </DataTableRow>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="empty-state">
      <slot name="empty-state">
        <div class="empty-content">
          <div class="empty-icon">📋</div>
          <h3>No data found</h3>
          <p>There are no items to display</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTableHeader from "./DataTableHeader.vue";
import DataTableRow from "./DataTableRow.vue";

const props = defineProps({
  // Data
  items: {
    type: Array,
    default: () => [],
  },

  columns: {
    type: Array,
    required: true,
    validator: (columns) => {
      return columns.every((col) => col.key && col.label);
    },
  },

  showSelection: {
    type: Boolean,
    default: false,
  },
  selectedItems: {
    type: Array,
    default: () => [],
  },

  sortBy: {
    type: String,
    default: "",
  },
  sortDirection: {
    type: String,
    default: "asc",
    validator: (value) => ["asc", "desc"].includes(value),
  },

  expandable: {
    type: Boolean,
    default: false,
  },

  itemKey: {
    type: String,
    default: "id",
  },

  rowClickable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update:selectedItems",
  "update:sortBy",
  "update:sortDirection",
  "rowClick",
  "sort",
]);

// Internal state
const expandedItemId = ref(null);
const currentSortBy = ref(props.sortBy);
const currentSortDirection = ref(props.sortDirection);

// Computed
const allItemsSelected = computed(() => {
  return (
    props.items.length > 0 && props.selectedItems.length === props.items.length
  );
});

// Methods
const getItemKey = (item) => {
  return (
    item[props.itemKey] || item.id || Math.random().toString(36).substr(2, 9)
  );
};

const isItemSelected = (item) => {
  const itemKey = getItemKey(item);
  return props.selectedItems.some(
    (selectedItem) => getItemKey(selectedItem) === itemKey,
  );
};

const handleToggleSelection = (item) => {
  const itemKey = getItemKey(item);
  const currentSelected = [...props.selectedItems];
  const existingIndex = currentSelected.findIndex(
    (selectedItem) => getItemKey(selectedItem) === itemKey,
  );

  if (existingIndex > -1) {
    currentSelected.splice(existingIndex, 1);
  } else {
    currentSelected.push(item);
  }

  emit("update:selectedItems", currentSelected);
};

const handleToggleSelectAll = () => {
  if (allItemsSelected.value) {
    emit("update:selectedItems", []);
  } else {
    emit("update:selectedItems", [...props.items]);
  }
};

const handleSort = (field) => {
  if (currentSortBy.value === field) {
    currentSortDirection.value =
      currentSortDirection.value === "asc" ? "desc" : "asc";
  } else {
    currentSortBy.value = field;
    currentSortDirection.value = "asc";
  }

  emit("update:sortBy", currentSortBy.value);
  emit("update:sortDirection", currentSortDirection.value);
  emit("sort", {
    field: currentSortBy.value,
    direction: currentSortDirection.value,
  });
};

const handleRowClick = (item) => {
  if (props.rowClickable) {
    emit("rowClick", item);
  }
};

const handleToggleExpanded = (item) => {
  const itemKey = getItemKey(item);
  expandedItemId.value = expandedItemId.value === itemKey ? null : itemKey;
};

// Watch for prop changes
watch(
  () => props.sortBy,
  (newValue) => {
    currentSortBy.value = newValue;
  },
);

watch(
  () => props.sortDirection,
  (newValue) => {
    currentSortDirection.value = newValue;
  },
);
</script>

<style scoped>
.data-table {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow-y: auto;

  height: calc(90vh - 190px);
}

.table-scroll-container {
  /* overflow: auto; */
  position: relative;
}

.table-body {
  min-height: 0;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.empty-content p {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

.table-scroll-container {
  width: 100%;
  /* overflow-x: auto;
  overflow-y: auto; */
}

.table-body {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.table-body > div {
  display: table-row;
}

.table-body > div > div {
  display: table-cell;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .data-table {
    font-size: 0.75rem;
  }

  .table-body {
    min-width: 600px;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}
.table-header {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background: #f9fafb;
}

.table-header > div {
  display: table-row;
}

.table-header > div > div {
  display: table-cell;
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
}
</style>

<template>
  <div class="table-header">
    <!-- Selection Column -->
    <div v-if="showSelection" class="header-cell selection-col">
      <input
        type="checkbox"
        class="table-checkbox"
        :checked="allSelected"
        :indeterminate="someSelected"
        @change="handleSelectAllChange"
      />
    </div>

    <!-- Dynamic Columns -->
    <DataTableHeaderCell
      v-for="column in columns"
      :key="column.key"
      :column="column"
      :sortBy="sortBy"
      :sortDirection="sortDirection"
      @sort="$emit('requestSort', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import DataTableHeaderCell from "./DataTableHeaderCell.vue";

const props = defineProps({
  columns: Array,
  selectedItems: Array,
  allItems: Array,
  sortBy: String,
  sortDirection: String,
  showSelection: Boolean,
});

const emit = defineEmits(["toggleSelectAll", "requestSort"]);

const allSelected = computed(
  () =>
    props.allItems.length > 0 &&
    props.selectedItems.length === props.allItems.length
);

const someSelected = computed(
  () =>
    props.selectedItems.length > 0 &&
    props.selectedItems.length < props.allItems.length
);

const handleSelectAllChange = () => {
  emit("toggleSelectAll");
};
</script>

<style scoped>
.table-header {
  display: flex;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
  background-color: #f5dcda !important;
  color: black;
  font-size: 0.875rem;
  border: 1px solid red;
  min-width: max-content;
  position: sticky !important;
  top: 0;
}

.header-cell {
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
}

.selection-col {
  flex: 0 0 50px;
  justify-content: center;
  position: sticky;
  left: 0;
  z-index: 30;
  background: #f5dcda;
  box-shadow: 1px 0 0 #e2e8f0;
}

.table-checkbox {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}
.table-checkbox:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}
.table-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
.table-checkbox:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -50%) rotate(45deg);
}
.table-checkbox:indeterminate {
  background-color: #3b82f6;
  border-color: #3b82f6;
}
.table-checkbox:indeterminate::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 2px;
  background-color: white;
  transform: translate(-50%, -50%);
  border-radius: 1px;
}
</style>

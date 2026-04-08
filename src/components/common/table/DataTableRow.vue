<template>
  <div
    class="table-row"
    :class="{
      expanded: isExpanded,
      selected: isSelected,
      clickable: $attrs.onClick || rowClickable,
    }"
  >
    <div class="row-content" @click="handleRowClick">
      <!-- Selection Column -->
      <div v-if="showSelection" class="row-cell selection-col" @click.stop>
        <input
          type="checkbox"
          class="table-checkbox"
          :checked="isSelected"
          @change="toggleSelection"
        />
      </div>

      <!-- Dynamic Columns -->
      <DataTableCell
        v-for="column in columns"
        :key="column.key"
        :column="column"
        :item="item"
        :value="getColumnValue(item, column)"
      >
        <slot
          :name="`cell-${column.key}`"
          :item="item"
          :value="getColumnValue(item, column)"
          :column="column"
        >
          <span>{{ getColumnValue(item, column) }}</span>
        </slot>
      </DataTableCell>

      <!-- Expand Button -->
      <div v-if="expandable" class="row-cell expand-col" @click.stop>
        <button
          class="expand-button"
          @click="toggleExpanded"
          :aria-expanded="isExpanded"
        >
          <ChevronDown :class="{ 'rotate-180': isExpanded }" :size="16" />
        </button>
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded && expandable" class="expanded-content">
      <slot name="expanded-content" :item="item">
        <div class="default-expanded">
          <pre>{{ JSON.stringify(item, null, 2) }}</pre>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ChevronDown } from "lucide-vue-next";
import DataTableCell from "./DataTableCell.vue";

const props = defineProps({
  item: Object,
  columns: Array,
  isSelected: Boolean,
  isExpanded: Boolean,
  showSelection: Boolean,
  expandable: Boolean,
  rowClickable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["toggleSelection", "toggleExpanded", "rowClick"]);

const toggleSelection = () => emit("toggleSelection");
const toggleExpanded = () => emit("toggleExpanded");
const handleRowClick = () => {
  if (props.rowClickable) emit("rowClick");
};

const getColumnValue = (item, column) => {
  if (column.field) {
    return column.field.split(".").reduce((obj, key) => obj?.[key], item);
  }
  return item[column.key];
};
</script>

<style scoped>
.table-row {
  border-bottom: 1px solid#d9d9d9;
  transition: all 0.2s ease;
  min-width: max-content;
}
/* .table-row:last-child {
  border-bottom: none;
} */
.table-row:hover {
  background-color: #f8fafc;
}
.table-row.selected {
  background-color: #eff6ff;
}

.row-content {
  display: flex;
  align-items: center;
  min-height: 60px;


  font-size: 0.85rem;
}
.row-content.clickable {
  cursor: pointer;
}

.row-cell {
  padding: 0.75rem 0.5rem;
  display: flex;
  align-items: center;
  font-size: 0.995rem;
  color: #b31d98;

}

/* <CHANGE> Sticky selection column in the body rows */
.selection-col {
  flex: 0 0 50px;
  justify-content: center;
  position: sticky;
  left: 0;
  z-index: 15;
  background: #ffffff00;
  box-shadow: 1px 0 0 #e2e8f0;
}

.expand-col {
  flex: 0 0 50px;
  justify-content: center;
}

.expand-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}
.expand-button:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}
.expand-button svg {
  transition: transform 0.2s ease;
}
.expand-button svg.rotate-180 {
  transform: rotate(180deg);
}

.expanded-content {
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.default-expanded {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;

  font-size: 0.75rem;
  overflow-x: auto;
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
.row-cell.selection-col {
  padding: 0.6rem 0.5rem;
  margin-left: 0.5rem;
}
</style>

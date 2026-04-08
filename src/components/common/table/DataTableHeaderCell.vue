<template>
  <div
    class="header-cell"
    :class="[
      `col-${column.key}`,
      column.width ? `width-${column.width}` : '',
      column.sortable !== false ? 'sortable' : '',
    ]"
    :style="getColumnStyle"
    @click="handleSort"
  >
    <span class="header-label">{{ column.label }}</span>
    <span
      v-if="column.sortable !== false && sortBy === column.key"
      class="sort-icon"
    >
      <ChevronDown
        :class="{ 'rotate-180': sortDirection === 'desc' }"
        :size="14"
      />
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ChevronDown } from "lucide-vue-next";

const props = defineProps({
  column: {
    type: Object,
    required: true,
  },
  sortBy: String,
  sortDirection: String,
});

const emit = defineEmits(["sort"]);

const getColumnStyle = computed(() => {
  const styles = {};

  if (props.column.width) {
    if (typeof props.column.width === "string") {
      if (
        props.column.width.includes("%") ||
        props.column.width.includes("px")
      ) {
        styles.flex = `0 0 ${props.column.width}`;
        styles.width = props.column.width;
      } else {
        styles.flex = props.column.width;
      }
    } else {
      styles.flex = props.column.width;
    }
  } else {
    styles.flex = "1 1 auto";
  }

  if (props.column.minWidth) {
    styles.minWidth = props.column.minWidth;
  } else {
    styles.minWidth = "120px";
  }

  return styles;
});

const handleSort = () => {
  if (props.column.sortable !== false) {
    emit("sort", props.column.key);
  }
};
</script>

<style scoped>
.header-cell {
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 120px;
}

.header-cell.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.header-cell.sortable:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

.header-label {
  font-weight: 600;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.sort-icon {
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  color: #6b7280;
  flex-shrink: 0;
}

.sort-icon svg {
  transition: transform 0.2s ease;
}

.sort-icon svg.rotate-180 {
  transform: rotate(180deg);
}

/* Updated width utilities with better responsive behavior */
.width-xs {
  flex: 0 0 80px;
  min-width: 80px;
}
.width-sm {
  flex: 0 0 120px;
  min-width: 120px;
}
.width-md {
  flex: 0 0 160px;
  min-width: 160px;
}
.width-lg {
  flex: 0 0 200px;
  min-width: 200px;
}
.width-xl {
  flex: 0 0 240px;
  min-width: 240px;
}
.width-2xl {
  flex: 0 0 280px;
  min-width: 280px;
}
</style>

<template>
  <div
    class="table-cell"
    :class="[
      `cell-${column.key}`,
      column.align ? `text-${column.align}` : 'text-left',
      column.width ? `width-${column.width}` : '',
      { 'employeeId-sticky': column.key === 'employeeId' },
    ]"
    :style="getCellStyle"
  >
    <slot>
      <span class="cell-content">{{ value }}</span>
    </slot>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  column: Object,
  item: Object,
  value: [String, Number, Boolean, Object, Array],
});

const getCellStyle = computed(() => {
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

  styles.minWidth = props.column.minWidth || "120px";

  return styles;
});
</script>

<style scoped>
.table-cell {
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center; /* vertical center */
  justify-content: flex-start; /* default */
  min-width: 120px;
  word-break: break-word;
  overflow: hidden;
}

.cell-content {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* single line */
  width: 100%;
  line-height: 1.5;
  font-size: 0.75rem;
  color: #1a202c;

}

.text-left {
  justify-content: flex-start;
  text-align: left;
}
.text-center {
  justify-content: center;
  text-align: center;
}
.text-right {
  justify-content: flex-end;
  text-align: right;
}

/* widths */
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

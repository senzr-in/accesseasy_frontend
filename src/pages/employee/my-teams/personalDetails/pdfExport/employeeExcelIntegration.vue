<template>
  <div>
    <!-- Add this button next to your existing export button -->
    <EmployeeExcelExport
      :headers="headers"
      :filters="filters"
      :search="search"
    />
  </div>
</template>

<script setup>
import EmployeeExcelExport from "./employeeExcelExport.vue";
import { ref, reactive } from "vue";
const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  search: {
    type: String,
    default: "",
  },
});
</script>

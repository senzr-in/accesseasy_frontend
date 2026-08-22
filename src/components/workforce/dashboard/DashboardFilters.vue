<template>
  <div class="filter-bar bg-[#FFFFFF] border border-[#E8E8E8] rounded-xl p-3 shadow-sm flex flex-wrap items-center gap-2.5">
    <div class="flex items-center gap-2 text-xs font-semibold text-[#171717] pr-2 border-r border-[#E8E8E8] shrink-0">
      <SlidersHorizontal class="w-3.5 h-3.5 text-[#6B6B6B]" />
      <span>Filters</span>
    </div>

    <!-- Site / Location -->
    <div class="relative shrink-0">
      <select
        v-model="filters.site"
        class="filter-select"
        @change="emitChange"
      >
        <option value="all">All Sites</option>
        <option v-for="s in options.sites" :key="s.id" :value="s.id">
          {{ s.name }}
        </option>
      </select>
    </div>

    <!-- Department -->
    <div class="relative shrink-0">
      <select
        v-model="filters.department"
        class="filter-select"
        @change="emitChange"
      >
        <option value="all">All Departments</option>
        <option v-for="d in options.departments" :key="d.id" :value="d.id">
          {{ d.name }}
        </option>
      </select>
    </div>

    <!-- Access Group / Team -->
    <div class="relative shrink-0">
      <select
        v-model="filters.team"
        class="filter-select"
        @change="emitChange"
      >
        <option value="all">All Access Groups</option>
        <option v-for="t in options.teams" :key="t.id" :value="t.id">
          {{ t.name }}
        </option>
      </select>
    </div>

    <!-- Shift -->
    <div class="relative shrink-0">
      <select
        v-model="filters.shift"
        class="filter-select"
        @change="emitChange"
      >
        <option value="all">All Shifts</option>
        <option v-for="sh in options.shifts" :key="sh.id" :value="sh.id">
          {{ sh.name }}
        </option>
      </select>
    </div>

    <!-- Reset / Clear Button if filtered -->
    <button
      v-if="hasActiveFilters"
      class="ml-auto text-xs font-medium text-[#6B6B6B] hover:text-[#171717] px-2 py-1 rounded hover:bg-[#F7F7F8] transition-colors cursor-pointer"
      @click="resetFilters"
    >
      Reset Filters
    </button>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { SlidersHorizontal } from 'lucide-vue-next';
import { workforceService } from '@/services/workforceService';

const emit = defineEmits(['filter-change']);

const options = ref({
  organizations: [],
  sites: [],
  departments: [],
  teams: [],
  shifts: []
});

const filters = reactive({
  organization: 'all',
  site: 'all',
  department: 'all',
  team: 'all',
  shift: 'all'
});

const loadOptions = async () => {
  try {
    const res = await workforceService.getFilterOptions();
    if (res) {
      options.value = {
        organizations: (res.organizations || []).filter(o => o.id !== 'all'),
        sites: (res.sites || []).filter(s => s.id !== 'all'),
        departments: (res.departments || []).filter(d => d.id !== 'all'),
        teams: (res.teams || []).filter(t => t.id !== 'all'),
        shifts: (res.shifts || []).filter(s => s.id !== 'all')
      };
    }
  } catch (err) {
    console.warn('Error loading filter options:', err);
  }
};

onMounted(() => {
  loadOptions();
});

const hasActiveFilters = computed(() => {
  return (
    filters.site !== 'all' ||
    filters.department !== 'all' ||
    filters.team !== 'all' ||
    filters.shift !== 'all'
  );
});

const emitChange = () => {
  emit('filter-change', { ...filters });
};

const resetFilters = () => {
  filters.organization = 'all';
  filters.site = 'all';
  filters.department = 'all';
  filters.team = 'all';
  filters.shift = 'all';
  emitChange();
};
</script>

<style scoped>
.filter-select {
  font-size: 12px;
  color: #171717;
  background-color: #F7F7F8;
  border: 1px solid #E8E8E8;
  border-radius: 6px;
  padding: 5px 10px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-select:hover {
  border-color: #D2D2D7;
  background-color: #FFFFFF;
}

.filter-select:focus {
  border-color: #3478F6;
  background-color: #FFFFFF;
}
</style>

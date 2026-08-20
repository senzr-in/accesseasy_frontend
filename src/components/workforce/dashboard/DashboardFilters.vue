<template>
  <div class="filter-bar bg-[#FFFFFF] border border-[#E8E8E8] rounded-xl p-3 shadow-sm flex flex-wrap items-center gap-2.5">
    <div class="flex items-center gap-2 text-xs font-semibold text-[#171717] pr-2 border-r border-[#E8E8E8] shrink-0">
      <SlidersHorizontal class="w-3.5 h-3.5 text-[#6B6B6B]" />
      <span>Filters</span>
    </div>

    <!-- Organization -->
    <div class="relative shrink-0">
      <select
        v-model="filters.organization"
        class="filter-select"
        @change="emitChange"
      >
        <option value="all">All Organizations</option>
        <option value="acme_hq">Acme Corporation</option>
        <option value="acme_tech">Acme Technologies</option>
        <option value="acme_logistics">Acme Logistics</option>
      </select>
    </div>

    <!-- Site -->
    <div class="relative shrink-0">
      <select
        v-model="filters.site"
        class="filter-select"
        @change="emitChange"
      >
        <option value="all">All Sites</option>
        <option value="site_nyc">Global HQ (New York)</option>
        <option value="site_sf">Tech Campus (SF)</option>
        <option value="site_blr">APAC Hub (Bengaluru)</option>
        <option value="site_ldn">EMEA Office (London)</option>
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
        <option value="eng">Engineering</option>
        <option value="ops">Operations</option>
        <option value="sec">Security</option>
        <option value="fin">Finance</option>
        <option value="hr">Human Resources</option>
        <option value="sales">Sales & Marketing</option>
      </select>
    </div>

    <!-- Team -->
    <div class="relative shrink-0">
      <select
        v-model="filters.team"
        class="filter-select"
        @change="emitChange"
      >
        <option value="all">All Teams</option>
        <option value="backend">Backend Platform</option>
        <option value="frontend">Frontend Web</option>
        <option value="devops">Cloud Infrastructure</option>
        <option value="facilities">Facilities & Guard</option>
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
        <option value="morning">Morning (09:00 - 18:00)</option>
        <option value="afternoon">Afternoon (13:00 - 22:00)</option>
        <option value="night">Night (22:00 - 06:00)</option>
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
import { reactive, computed } from 'vue';
import { SlidersHorizontal } from 'lucide-vue-next';

const emit = defineEmits(['filter-change']);

const filters = reactive({
  organization: 'all',
  site: 'all',
  department: 'all',
  team: 'all',
  shift: 'all'
});

const hasActiveFilters = computed(() => {
  return (
    filters.organization !== 'all' ||
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

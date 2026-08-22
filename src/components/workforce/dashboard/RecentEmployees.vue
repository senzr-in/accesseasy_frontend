<template>
  <div class="recent-employees-card">
    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
      <div>
        <h3 class="text-sm font-bold text-[#0F172A]">Recently Active</h3>
        <p class="text-xs text-[#64748B] mt-0.5">Latest workforce directory updates</p>
      </div>
      <router-link
        to="/dashboard/easy-access/employees"
        class="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer no-underline"
      >
        Directory
        <ChevronRight class="w-3.5 h-3.5" />
      </router-link>
    </div>

    <!-- Employee Items -->
    <div v-if="activeEmployees.length > 0" class="divide-y divide-[#F1F5F9] pt-1">
      <div
        v-for="emp in activeEmployees"
        :key="emp.id"
        class="flex items-center justify-between py-3.5 px-2 hover:bg-[#F8FAFC] rounded-xl transition-colors cursor-pointer group"
        @click="openProfile(emp)"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0 border border-[#DBEAFE]">
            {{ getInitials(emp.first_name, emp.last_name) }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
              {{ emp.first_name }} {{ emp.last_name }}
            </p>
            <p class="text-[11px] text-[#64748B] truncate mt-0.5">
              {{ emp.department || 'General' }} &bull; {{ emp.location }}
            </p>
          </div>
        </div>

        <div class="text-right shrink-0 ml-3">
          <span class="text-xs font-mono font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded-md">
            {{ emp.last_active }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="py-8 text-center text-xs text-[#94A3B8]">
      No employee activity recorded yet.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ChevronRight } from 'lucide-vue-next';
import { employeeService } from '@/services/employeeService';

const emit = defineEmits(['select-employee']);

const activeEmployees = ref([]);

onMounted(async () => {
  try {
    const list = await employeeService.getRecentlyActive(5);
    activeEmployees.value = list || [];
  } catch (e) {
    console.error('Error loading recently active employees:', e);
  }
});

const getInitials = (first, last) => {
  return `${(first?.[0] || 'E')}${(last?.[0] || '')}`.toUpperCase();
};

const openProfile = (emp) => {
  emit('select-employee', emp);
};
</script>

<style scoped>
.recent-employees-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
</style>

<template>
  <div class="workforce-dashboard-root h-full overflow-y-auto custom-scrollbar bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 space-y-6">
    <!-- 0. Hero Section with Quick Actions -->
    <QuickActions
      @open-add-employee="isAddModalOpen = true"
      @open-import="isImportModalOpen = true"
      @open-register-device="isRegisterDeviceModalOpen = true"
    />

    <!-- Loading Skeleton State -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-28 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
          <div class="h-4 bg-[#F1F5F9] rounded w-1/3" />
          <div class="h-8 bg-[#F1F5F9] rounded w-2/3" />
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-5 h-80 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl" />
        <div class="lg:col-span-7 h-80 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl" />
      </div>
    </div>

    <!-- Error State with Retry -->
    <div
      v-else-if="hasError"
      class="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-sm"
    >
      <AlertTriangle class="w-10 h-10 text-[#EF4444] mx-auto mb-3" />
      <h3 class="text-sm font-bold text-[#0F172A]">Unable to load workforce data</h3>
      <p class="text-xs text-[#64748B] mt-1 mb-4">
        There was an issue connecting to the workforce telemetry API. Please try again.
      </p>
      <button
        class="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors cursor-pointer shadow-sm"
        @click="loadDashboardData"
      >
        Retry Loading
      </button>
    </div>

    <!-- Main Active Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- 1. KPI Summary Band -->
      <WorkforceKpi />

      <!-- 2. Workforce Presence & Attendance Analytics (Row 1) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-5">
          <WorkforcePresence />
        </div>
        <div class="lg:col-span-7">
          <AttendanceChart />
        </div>
      </div>

      <!-- 3. Live Access Stream & Access Control Overview (Row 2) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7">
          <LiveAccessTable @select-event="handleSelectEvent" />
        </div>
        <div class="lg:col-span-5">
          <AccessOverview />
        </div>
      </div>

      <!-- 4. Biometric & Device Health, Needs Attention, Recent Employees (Row 3) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Biometric Health -->
        <DeviceHealth />

        <!-- Needs Attention -->
        <AttentionList />

        <!-- Recently Active Staff -->
        <RecentEmployees @select-employee="handleSelectEmployee" />
      </div>

      <!-- 5. Inactive Employees & Security Audit (Row 4) -->
      <div class="pb-6">
        <InactiveEmployeesSection />
      </div>
    </div>

    <!-- Modals & Slide-over Drawers -->
    <AddEmployeeModal
      :is-open="isAddModalOpen"
      @update:is-open="isAddModalOpen = $event"
      @success="handleEmployeeAdded"
    />

    <ImportEmployeesModal
      :is-open="isImportModalOpen"
      @update:is-open="isImportModalOpen = $event"
      @success="handleEmployeesImported"
    />

    <RegisterDeviceModal
      :is-open="isRegisterDeviceModalOpen"
      @update:is-open="isRegisterDeviceModalOpen = $event"
      @success="handleDeviceRegistered"
    />

    <EmployeeProfileDrawer
      :is-open="isProfileDrawerOpen"
      :employee="selectedEmployee"
      @update:is-open="isProfileDrawerOpen = $event"
      @close="selectedEmployee = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { AlertTriangle } from 'lucide-vue-next';

// Components
import QuickActions from '@/components/workforce/dashboard/QuickActions.vue';
import WorkforceKpi from '@/components/workforce/dashboard/WorkforceKpi.vue';
import WorkforcePresence from '@/components/workforce/dashboard/WorkforcePresence.vue';
import AttendanceChart from '@/components/workforce/dashboard/AttendanceChart.vue';
import LiveAccessTable from '@/components/workforce/dashboard/LiveAccessTable.vue';
import AccessOverview from '@/components/workforce/dashboard/AccessOverview.vue';
import DeviceHealth from '@/components/workforce/dashboard/DeviceHealth.vue';
import AttentionList from '@/components/workforce/dashboard/AttentionList.vue';
import RecentEmployees from '@/components/workforce/dashboard/RecentEmployees.vue';
import InactiveEmployeesSection from '@/pages/dashboard/components/workforce/InactiveEmployeesSection.vue';

// Modals & Drawers
import AddEmployeeModal from '@/components/workforce/dashboard/AddEmployeeModal.vue';
import ImportEmployeesModal from '@/components/workforce/dashboard/ImportEmployeesModal.vue';
import RegisterDeviceModal from '@/components/workforce/dashboard/RegisterDeviceModal.vue';
import EmployeeProfileDrawer from '@/components/workforce/dashboard/EmployeeProfileDrawer.vue';

const isLoading = ref(false);
const hasError = ref(false);

const isAddModalOpen = ref(false);
const isImportModalOpen = ref(false);
const isRegisterDeviceModalOpen = ref(false);
const isProfileDrawerOpen = ref(false);
const selectedEmployee = ref(null);

const loadDashboardData = async () => {
  isLoading.value = true;
  hasError.value = false;
  try {
    await new Promise(resolve => setTimeout(resolve, 150));
  } catch (e) {
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});

const handleSelectEmployee = (emp) => {
  selectedEmployee.value = emp;
  isProfileDrawerOpen.value = true;
};

const handleSelectEvent = (ev) => {
  selectedEmployee.value = {
    first_name: ev.employee?.split(' ')[0] || 'User',
    last_name: ev.employee?.split(' ')[1] || '',
    department: ev.department || 'Operations',
    designation: 'Staff',
    status: ev.result === 'Granted' ? 'On-site' : 'Denied',
    location: ev.location,
    id: ev.id,
    card_number: 'CRD-89421'
  };
  isProfileDrawerOpen.value = true;
};

const handleEmployeeAdded = (newEmp) => {
  console.log('Employee added successfully:', newEmp);
};

const handleEmployeesImported = (res) => {
  console.log('Employees imported successfully:', res);
};

const handleDeviceRegistered = (res) => {
  console.log('Device registered successfully:', res);
};
</script>

<style scoped>
.workforce-dashboard-root {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif;
  color: #0F172A;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
</style>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- 1. Total Employees -->
    <div
      class="kpi-card group cursor-pointer"
      @click="navigateTo('/dashboard/easy-access/employees')"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-[#64748B]">Total Employees</span>
        <div class="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center transition-transform group-hover:scale-105">
          <Users class="w-4 h-4" />
        </div>
      </div>
      <div class="flex items-baseline justify-between">
        <span class="text-3xl font-bold tracking-tight text-[#0F172A]">2,486</span>
        <span class="inline-flex items-center text-xs font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
          <TrendingUp class="w-3 h-3 mr-1" />
          +4.2%
        </span>
      </div>
      <p class="text-[11px] text-[#94A3B8] mt-2.5 font-normal">
        Active company workforce directory
      </p>
    </div>

    <!-- 2. Present Today -->
    <div
      class="kpi-card group cursor-pointer"
      @click="navigateTo('/dashboard/easy-access/employees?status=on-site')"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-[#64748B]">Present Today</span>
        <div class="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center transition-transform group-hover:scale-105">
          <UserCheck class="w-4 h-4" />
        </div>
      </div>
      <div class="flex items-baseline justify-between">
        <span class="text-3xl font-bold tracking-tight text-[#0F172A]">1,842</span>
        <span class="inline-flex items-center text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#DBEAFE]">
          74.1%
        </span>
      </div>
      <p class="text-[11px] text-[#94A3B8] mt-2.5 font-normal">
        Checked in across all shifts
      </p>
    </div>

    <!-- 3. Currently On-Site -->
    <div
      class="kpi-card group cursor-pointer"
      @click="navigateTo('/dashboard/easy-access/employees?status=on-site')"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-[#64748B]">Currently On-Site</span>
        <div class="w-9 h-9 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center transition-transform group-hover:scale-105">
          <Building2 class="w-4 h-4" />
        </div>
      </div>
      <div class="flex items-baseline justify-between">
        <span class="text-3xl font-bold tracking-tight text-[#0F172A]">1,731</span>
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
          Live
        </span>
      </div>
      <p class="text-[11px] text-[#94A3B8] mt-2.5 font-normal">
        Real-time badge & face occupancy
      </p>
    </div>

    <!-- 4. Attendance Rate -->
    <div
      class="kpi-card group cursor-pointer"
      @click="navigateTo('/dashboard/settings/logs')"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-[#64748B]">Attendance Rate</span>
        <div class="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center transition-transform group-hover:scale-105">
          <CheckCircle2 class="w-4 h-4" />
        </div>
      </div>
      <div class="flex items-baseline justify-between">
        <span class="text-3xl font-bold tracking-tight text-[#0F172A]">97.4%</span>
        <span class="inline-flex items-center text-xs font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
          <TrendingUp class="w-3 h-3 mr-1" />
          +1.2%
        </span>
      </div>
      <p class="text-[11px] text-[#94A3B8] mt-2.5 font-normal">
        Punctual & scheduled compliance
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { Users, UserCheck, Building2, CheckCircle2, TrendingUp } from 'lucide-vue-next';

const router = useRouter();

const navigateTo = (path) => {
  router.push(path);
};
</script>

<style scoped>
.kpi-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px 22px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.kpi-card:hover {
  border-color: #CBD5E1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}
</style>

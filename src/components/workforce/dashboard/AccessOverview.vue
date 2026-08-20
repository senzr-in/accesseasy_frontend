<template>
  <div class="access-overview-card">
    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
      <div>
        <h3 class="text-sm font-bold text-[#0F172A]">Access Control</h3>
        <p class="text-xs text-[#64748B] mt-0.5">Authorization & infrastructure</p>
      </div>
      <router-link
        to="/dashboard/access-control/doors"
        class="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer no-underline"
      >
        Manage
        <ChevronRight class="w-3.5 h-3.5" />
      </router-link>
    </div>

    <!-- 3 High Level KPI Tiles -->
    <div class="grid grid-cols-3 gap-3 pt-4 pb-4">
      <!-- Granted -->
      <div
        class="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all cursor-pointer shadow-2xs"
        @click="navigateTo('/dashboard/settings/logs?status=granted')"
      >
        <span class="text-[10px] uppercase font-bold text-[#64748B]">Granted</span>
        <p class="text-xl font-bold text-[#0F172A] mt-1">12,481</p>
        <span class="inline-flex items-center text-[10px] text-[#059669] font-semibold mt-1">
          99.8% rate
        </span>
      </div>

      <!-- Denied -->
      <div
        class="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all cursor-pointer shadow-2xs"
        @click="navigateTo('/dashboard/settings/logs?status=denied')"
      >
        <span class="text-[10px] uppercase font-bold text-[#64748B]">Denied</span>
        <p class="text-xl font-bold text-[#DC2626] mt-1">23</p>
        <span class="inline-flex items-center text-[10px] text-[#DC2626] font-semibold mt-1">
          0.2% rate
        </span>
      </div>

      <!-- Suspicious -->
      <div
        class="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all cursor-pointer shadow-2xs"
        @click="navigateTo('/dashboard/settings/logs?filter=suspicious')"
      >
        <span class="text-[10px] uppercase font-bold text-[#64748B]">Suspicious</span>
        <p class="text-xl font-bold text-[#D97706] mt-1">5</p>
        <span class="inline-flex items-center text-[10px] text-[#D97706] font-semibold mt-1">
          Flagged
        </span>
      </div>
    </div>

    <!-- Infrastructure Hardware Breakdown -->
    <div class="space-y-2.5 pt-2 border-t border-[#E2E8F0]">
      <!-- Doors -->
      <div
        class="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] transition-all cursor-pointer shadow-2xs"
        @click="navigateTo('/dashboard/access-control/doors')"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <DoorClosed class="w-4 h-4" />
          </div>
          <span class="text-xs font-bold text-[#0F172A]">Doors</span>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <span class="text-[#059669] font-bold">42 Online</span>
          <span class="text-[#DC2626] font-bold">2 Offline</span>
        </div>
      </div>

      <!-- Turnstiles -->
      <div
        class="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] transition-all cursor-pointer shadow-2xs"
        @click="navigateTo('/dashboard/access-control/doors?type=turnstile')"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
            <ShieldCheck class="w-4 h-4" />
          </div>
          <span class="text-xs font-bold text-[#0F172A]">Turnstiles</span>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <span class="text-[#059669] font-bold">8 Online</span>
          <span class="text-[#94A3B8] font-medium">0 Offline</span>
        </div>
      </div>

      <!-- Controllers -->
      <div
        class="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] transition-all cursor-pointer shadow-2xs"
        @click="navigateTo('/dashboard/settings/devices')"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
            <Server class="w-4 h-4" />
          </div>
          <span class="text-xs font-bold text-[#0F172A]">Controllers</span>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <span class="text-[#059669] font-bold">31 Online</span>
          <span class="text-[#DC2626] font-bold">1 Offline</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ChevronRight, DoorClosed, ShieldCheck, Server } from 'lucide-vue-next';

const router = useRouter();

const navigateTo = (path) => {
  router.push(path);
};
</script>

<style scoped>
.access-overview-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
</style>

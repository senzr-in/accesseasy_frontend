<template>
  <div class="device-health-card">
    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
      <div>
        <h3 class="text-sm font-bold text-[#0F172A]">Biometric & Device Health</h3>
        <p class="text-xs text-[#64748B] mt-0.5">Hardware operational telemetry</p>
      </div>
      <router-link
        to="/dashboard/settings/devices"
        class="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer no-underline"
      >
        Diagnostics
        <ChevronRight class="w-3.5 h-3.5" />
      </router-link>
    </div>

    <!-- Health Progress Items -->
    <div class="space-y-4 pt-4 pb-4">
      <!-- 1. Face Recognition -->
      <div>
        <div class="flex justify-between text-xs mb-1.5">
          <span class="font-semibold text-[#0F172A]">Face Recognition</span>
          <span class="font-bold text-[#2563EB]">96%</span>
        </div>
        <div class="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
          <div class="bg-[#2563EB] h-full rounded-full transition-all duration-500" style="width: 96%" />
        </div>
        <p class="text-[10px] text-[#94A3B8] mt-1">2,387 / 2,486 employees enrolled</p>
      </div>

      <!-- 2. Fingerprint Devices -->
      <div>
        <div class="flex justify-between text-xs mb-1.5">
          <span class="font-semibold text-[#0F172A]">Fingerprint Devices</span>
          <span class="font-bold text-[#059669]">100%</span>
        </div>
        <div class="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
          <div class="bg-[#059669] h-full rounded-full transition-all duration-500" style="width: 100%" />
        </div>
        <p class="text-[10px] text-[#94A3B8] mt-1">All biometric templates synchronized</p>
      </div>

      <!-- 3. Credential Synchronization -->
      <div>
        <div class="flex justify-between text-xs mb-1.5">
          <span class="font-semibold text-[#0F172A]">Credential Synchronization</span>
          <span class="font-bold text-[#D97706]">91%</span>
        </div>
        <div class="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
          <div class="bg-[#F59E0B] h-full rounded-full transition-all duration-500" style="width: 91%" />
        </div>
        <p class="text-[10px] text-[#94A3B8] mt-1">1 gateway queue syncing</p>
      </div>
    </div>

    <!-- Bottom Status Counters -->
    <div class="pt-3.5 border-t border-[#E2E8F0] grid grid-cols-3 gap-2.5 text-center text-xs">
      <div
        class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#CBD5E1] transition-all shadow-2xs"
        @click="navigateTo('/dashboard/settings/devices?status=online')"
      >
        <p class="font-bold text-[#059669]">48</p>
        <p class="text-[10px] text-[#64748B] mt-0.5 font-medium">Online</p>
      </div>
      <div
        class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#CBD5E1] transition-all shadow-2xs"
        @click="navigateTo('/dashboard/settings/devices?status=offline')"
      >
        <p class="font-bold text-[#DC2626]">2</p>
        <p class="text-[10px] text-[#64748B] mt-0.5 font-medium">Offline</p>
      </div>
      <div
        class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#CBD5E1] transition-all shadow-2xs"
        @click="navigateTo('/dashboard/settings/devices?sync=pending')"
      >
        <p class="font-bold text-[#D97706]">1</p>
        <p class="text-[10px] text-[#64748B] mt-0.5 font-medium">Sync Req.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';

const router = useRouter();

const navigateTo = (path) => {
  router.push(path);
};
</script>

<style scoped>
.device-health-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
</style>

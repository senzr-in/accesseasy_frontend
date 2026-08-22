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
          <span class="font-bold text-[#2563EB]">{{ faceScore }}%</span>
        </div>
        <div class="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
          <div class="bg-[#2563EB] h-full rounded-full transition-all duration-500" :style="{ width: `${faceScore}%` }" />
        </div>
        <p class="text-[10px] text-[#94A3B8] mt-1">
          {{ faceEnrolled.toLocaleString() }} / {{ totalEligible.toLocaleString() }} employees enrolled
        </p>
      </div>

      <!-- 2. Fingerprint Devices -->
      <div>
        <div class="flex justify-between text-xs mb-1.5">
          <span class="font-semibold text-[#0F172A]">Fingerprint Templates</span>
          <span class="font-bold text-[#059669]">{{ fingerScore }}%</span>
        </div>
        <div class="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
          <div class="bg-[#059669] h-full rounded-full transition-all duration-500" :style="{ width: `${fingerScore}%` }" />
        </div>
        <p class="text-[10px] text-[#94A3B8] mt-1">
          {{ fingerEnrolled.toLocaleString() }} / {{ totalEligible.toLocaleString() }} templates enrolled
        </p>
      </div>

      <!-- 3. Credential Synchronization -->
      <div>
        <div class="flex justify-between text-xs mb-1.5">
          <span class="font-semibold text-[#0F172A]">Device Online Rate</span>
          <span class="font-bold text-[#D97706]">{{ syncScore }}%</span>
        </div>
        <div class="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
          <div class="bg-[#F59E0B] h-full rounded-full transition-all duration-500" :style="{ width: `${syncScore}%` }" />
        </div>
        <p class="text-[10px] text-[#94A3B8] mt-1">
          {{ devicesOffline > 0 ? `${devicesOffline} gateway(s) offline` : 'All gateways responding' }}
        </p>
      </div>
    </div>

    <!-- Bottom Status Counters -->
    <div class="pt-3.5 border-t border-[#E2E8F0] grid grid-cols-3 gap-2.5 text-center text-xs">
      <div
        class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#CBD5E1] transition-all shadow-2xs"
        @click="navigateTo('/dashboard/settings/devices?status=online')"
      >
        <p class="font-bold text-[#059669]">{{ devicesOnline }}</p>
        <p class="text-[10px] text-[#64748B] mt-0.5 font-medium">Online</p>
      </div>
      <div
        class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#CBD5E1] transition-all shadow-2xs"
        @click="navigateTo('/dashboard/settings/devices?status=offline')"
      >
        <p class="font-bold text-[#DC2626]">{{ devicesOffline }}</p>
        <p class="text-[10px] text-[#64748B] mt-0.5 font-medium">Offline</p>
      </div>
      <div
        class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#CBD5E1] transition-all shadow-2xs"
        @click="navigateTo('/dashboard/settings/devices?sync=pending')"
      >
        <p class="font-bold text-[#D97706]">{{ devicesOffline }}</p>
        <p class="text-[10px] text-[#64748B] mt-0.5 font-medium">Sync Req.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import { useDeviceStatus } from '@/composables/workforce/useDeviceStatus';

const router = useRouter();
const { biometricHealth } = useDeviceStatus();

const faceScore = computed(() => biometricHealth.value?.faceRecognition?.score || 0);
const faceEnrolled = computed(() => biometricHealth.value?.faceRecognition?.enrolledCount || 0);
const totalEligible = computed(() => biometricHealth.value?.faceRecognition?.totalEligible || 0);

const fingerScore = computed(() => biometricHealth.value?.fingerprintDevices?.score || 0);
const fingerEnrolled = computed(() => biometricHealth.value?.fingerprintDevices?.enrolledCount || 0);

const syncScore = computed(() => biometricHealth.value?.credentialSync?.score || 0);

const devicesOnline = computed(() => biometricHealth.value?.summary?.devicesOnline || 0);
const devicesOffline = computed(() => biometricHealth.value?.summary?.devicesOffline || 0);

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

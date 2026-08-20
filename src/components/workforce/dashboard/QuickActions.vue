<template>
  <div class="hero-section flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
    <!-- Left: Welcome Greeting & Subtext -->
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
          Good morning, {{ userName }}
        </h1>
        <span class="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          ● All Systems Active
        </span>
      </div>
      <p class="text-sm text-[#64748B] mt-1 font-normal">
        Here's what's happening across your company workforce today.
      </p>
    </div>

    <!-- Right: Date Selector & Quick Actions -->
    <div class="flex flex-wrap items-center gap-2.5">
      <!-- Friendly Date Display -->
      <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] shadow-2xs">
        <Calendar class="w-4 h-4 text-[#2563EB]" />
        <span class="font-semibold">Aug 19, 2026</span>
        <span class="text-[#CBD5E1]">&bull;</span>
        <span class="text-[#2563EB] font-semibold">Today</span>
      </div>

      <!-- Action Buttons -->
      <button
        class="btn-secondary"
        @click="$emit('open-register-device')"
      >
        <HardDrive class="w-3.5 h-3.5 text-[#64748B]" />
        Register Device
      </button>

      <button
        class="btn-secondary"
        @click="$emit('open-import')"
      >
        <Upload class="w-3.5 h-3.5 text-[#64748B]" />
        Import
      </button>

      <button
        class="btn-primary"
        @click="$emit('open-add-employee')"
      >
        <Plus class="w-4 h-4" />
        Add Employee
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Calendar, Plus, Upload, HardDrive } from 'lucide-vue-next';
import { authService } from '@/services/authService';

defineEmits(['open-add-employee', 'open-import', 'open-register-device']);

const userData = authService.getUserData();
const userName = computed(() => {
  if (!userData) return 'Admin';
  return userData.first_name || 'Admin';
});
</script>

<style scoped>
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #2563EB;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #1D4ED8;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover {
  background-color: #1D4ED8;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #FFFFFF;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.btn-secondary:hover {
  background-color: #F8FAFC;
  border-color: #CBD5E1;
  color: #0F172A;
}
</style>

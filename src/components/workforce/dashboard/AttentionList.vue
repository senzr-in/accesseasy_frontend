<template>
  <div class="attention-card">
    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
      <div>
        <h3 class="text-sm font-bold text-[#0F172A]">Needs Attention</h3>
        <p class="text-xs text-[#64748B] mt-0.5">Exceptions requiring operational review</p>
      </div>
      <span class="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] px-2.5 py-0.5 rounded-full border border-[#FECACA]">
        5 Active
      </span>
    </div>

    <!-- Exception Rows List -->
    <div class="divide-y divide-[#F1F5F9] pt-1">
      <div
        v-for="item in attentionItems"
        :key="item.id"
        class="flex items-center justify-between py-3.5 px-2 hover:bg-[#F8FAFC] rounded-xl transition-colors cursor-pointer group"
        @click="navigateTo(item.path)"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span
            class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border"
            :class="item.severityClass"
          >
            {{ item.count }}
          </span>
          <span class="text-xs font-semibold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
            {{ item.title }}
          </span>
        </div>

        <ChevronRight class="w-4 h-4 text-[#94A3B8] group-hover:text-[#0F172A] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';

const router = useRouter();

const attentionItems = [
  {
    id: 'att-1',
    count: 5,
    title: 'Unauthorized access attempts',
    severityClass: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    path: '/dashboard/settings/logs?status=denied'
  },
  {
    id: 'att-2',
    count: 2,
    title: 'Biometric devices offline',
    severityClass: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    path: '/dashboard/settings/devices?status=offline'
  },
  {
    id: 'att-3',
    count: 12,
    title: 'Employees missing checkout',
    severityClass: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    path: '/dashboard/easy-access/employees?flag=missing_checkout'
  },
  {
    id: 'att-4',
    count: 8,
    title: 'Regularisation requests pending',
    severityClass: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    path: '/dashboard/easy-access/employees?tab=regularisation'
  },
  {
    id: 'att-5',
    count: 14,
    title: 'Access cards expiring soon',
    severityClass: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]',
    path: '/dashboard/easy-access/configurators/access-levels?filter=expiring'
  }
];

const navigateTo = (path) => {
  router.push(path);
};
</script>

<style scoped>
.attention-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
</style>

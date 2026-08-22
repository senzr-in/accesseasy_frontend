<template>
  <div class="presence-card">
    <!-- Card Header -->
    <div class="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
      <div>
        <h3 class="text-sm font-bold text-[#0F172A]">Workforce Presence</h3>
        <p class="text-xs text-[#64748B] mt-0.5">Real-time occupancy status</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-lg border border-[#DBEAFE]">
          Today
        </span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="pt-5 flex flex-col md:flex-row items-center justify-between gap-6">
      <!-- Donut Chart & Center Metric -->
      <div class="relative flex items-center justify-center w-48 h-48 shrink-0">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="65"
            stroke="#F1F5F9"
            stroke-width="18"
            fill="none"
          />
          <!-- 1. On-site -->
          <circle
            cx="80"
            cy="80"
            r="65"
            stroke="#2563EB"
            stroke-width="18"
            fill="none"
            :stroke-dasharray="`${onSitePct * 4.084} ${100 * 4.084}`"
            stroke-dashoffset="0"
            stroke-linecap="round"
            class="transition-all duration-500 cursor-pointer hover:opacity-80"
            :class="{ 'stroke-[22]': selectedCategory === 'onSite' }"
            @click="selectCategory('onSite')"
          />
          <!-- 2. Remote -->
          <circle
            cx="80"
            cy="80"
            r="65"
            stroke="#10B981"
            stroke-width="18"
            fill="none"
            :stroke-dasharray="`${remotePct * 4.084} ${100 * 4.084}`"
            :stroke-dashoffset="`-${onSitePct * 4.084}`"
            class="transition-all duration-500 cursor-pointer hover:opacity-80"
            :class="{ 'stroke-[22]': selectedCategory === 'remote' }"
            @click="selectCategory('remote')"
          />
          <!-- 3. On Leave -->
          <circle
            cx="80"
            cy="80"
            r="65"
            stroke="#F59E0B"
            stroke-width="18"
            fill="none"
            :stroke-dasharray="`${onLeavePct * 4.084} ${100 * 4.084}`"
            :stroke-dashoffset="`-${(onSitePct + remotePct) * 4.084}`"
            class="transition-all duration-500 cursor-pointer hover:opacity-80"
            :class="{ 'stroke-[22]': selectedCategory === 'onLeave' }"
            @click="selectCategory('onLeave')"
          />
          <!-- 4. Absent -->
          <circle
            cx="80"
            cy="80"
            r="65"
            stroke="#EF4444"
            stroke-width="18"
            fill="none"
            :stroke-dasharray="`${absentPct * 4.084} ${100 * 4.084}`"
            :stroke-dashoffset="`-${(onSitePct + remotePct + onLeavePct) * 4.084}`"
            class="transition-all duration-500 cursor-pointer hover:opacity-80"
            :class="{ 'stroke-[22]': selectedCategory === 'absent' }"
            @click="selectCategory('absent')"
          />
        </svg>

        <!-- Center Label -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span class="text-2xl font-bold tracking-tight text-[#0F172A]">
            {{ activeDisplayCount }}
          </span>
          <span class="text-xs font-semibold text-[#64748B] mt-0.5">
            {{ activeDisplayLabel }}
          </span>
          <span class="text-[10px] text-[#94A3B8] mt-0.5 font-medium">
            {{ activeDisplaySub }}
          </span>
        </div>
      </div>

      <!-- Category List Breakdown -->
      <div class="flex-1 w-full space-y-2.5">
        <div
          v-for="cat in categories"
          :key="cat.key"
          class="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer shadow-2xs"
          :class="selectedCategory === cat.key ? 'bg-[#EFF6FF] border-[#2563EB]' : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'"
          @click="selectCategory(cat.key)"
        >
          <div class="flex items-center gap-3">
            <span
              class="w-3 h-3 rounded-full shadow-2xs"
              :style="{ backgroundColor: cat.color }"
            />
            <div>
              <p class="text-xs font-bold text-[#0F172A] leading-none">{{ cat.label }}</p>
              <p class="text-[11px] text-[#64748B] mt-1">{{ cat.percentage }}% of workforce</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-sm font-bold text-[#0F172A]">{{ (cat.count || 0).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Quick Filter Action -->
    <div class="mt-4 pt-3.5 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
      <span class="text-[#64748B]">
        {{ selectedCategory ? `Filtering employees by ${selectedCategoryLabel}` : 'Click any status to filter employees' }}
      </span>
      <button
        class="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
        @click="viewFilteredEmployees"
      >
        View Directory
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import { usePresence } from '@/composables/workforce/usePresence';

const router = useRouter();
const { categories, selectedCategory, selectCategory, presenceData } = usePresence();

const onSitePct = computed(() => Number(categories.value.find(c => c.key === 'onSite')?.percentage || 0));
const remotePct = computed(() => Number(categories.value.find(c => c.key === 'remote')?.percentage || 0));
const onLeavePct = computed(() => Number(categories.value.find(c => c.key === 'onLeave')?.percentage || 0));
const absentPct = computed(() => Number(categories.value.find(c => c.key === 'absent')?.percentage || 0));

const activeDisplayCount = computed(() => {
  if (!selectedCategory.value) {
    return (presenceData.value?.onSite || 0).toLocaleString();
  }
  const found = categories.value.find(c => c.key === selectedCategory.value);
  return found ? (found.count || 0).toLocaleString() : '0';
});

const activeDisplayLabel = computed(() => {
  if (!selectedCategory.value) return 'On-site';
  const found = categories.value.find(c => c.key === selectedCategory.value);
  return found ? found.label : 'On-site';
});

const activeDisplaySub = computed(() => {
  if (!selectedCategory.value) {
    return `${onSitePct.value}% of workforce`;
  }
  const found = categories.value.find(c => c.key === selectedCategory.value);
  return found ? `${found.percentage}% of workforce` : '0% of workforce';
});

const selectedCategoryLabel = computed(() => {
  const found = categories.value.find(c => c.key === selectedCategory.value);
  return found ? found.label : 'All';
});

const viewFilteredEmployees = () => {
  const statusParam = selectedCategory.value ? selectedCategory.value.toLowerCase() : 'all';
  router.push(`/dashboard/easy-access/employees?status=${statusParam}`);
};
</script>

<style scoped>
.presence-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
</style>

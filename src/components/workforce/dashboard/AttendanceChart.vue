<template>
  <div class="attendance-card">
    <!-- Header with Title & Timeframe Selector -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
      <div>
        <h3 class="text-sm font-bold text-[#0F172A]">Attendance Analytics</h3>
        <p class="text-xs text-[#64748B] mt-0.5">Shift punctuality & absence trends</p>
      </div>

      <!-- Segmented Timeframe Switcher -->
      <div class="flex items-center p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
        <button
          v-for="tf in timeframes"
          :key="tf.id"
          class="px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer"
          :class="selectedTimeframe === tf.id ? 'bg-[#FFFFFF] text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'"
          @click="selectedTimeframe = tf.id"
        >
          {{ tf.label }}
        </button>
      </div>
    </div>

    <!-- Metric Toggles Legend -->
    <div class="flex flex-wrap items-center gap-2 pt-4 pb-2">
      <button
        v-for="m in metricOptions"
        :key="m.name"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
        :class="activeMetrics[m.name] ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1] shadow-2xs' : 'bg-[#F8FAFC] text-[#94A3B8] border-transparent opacity-60'"
        @click="toggleMetric(m.name)"
      >
        <span
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: activeMetrics[m.name] ? m.color : '#CBD5E1' }"
        />
        {{ m.name }}
      </button>
    </div>

    <!-- Chart Canvas -->
    <div class="h-64 w-full mt-2">
      <apexchart
        v-if="chartOptions && series.length"
        type="area"
        height="100%"
        width="100%"
        :options="chartOptions"
        :series="filteredSeries"
      />
      <div v-else class="h-full flex items-center justify-center text-xs text-[#94A3B8]">
        Loading attendance records...
      </div>
    </div>

    <!-- Summary Metrics Band -->
    <div v-if="analyticsData?.summary" class="mt-4 pt-3.5 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
      <div class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
        <p class="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Present</p>
        <p class="text-sm font-bold text-[#2563EB] mt-0.5">{{ analyticsData.summary.presentTotal }}</p>
      </div>
      <div class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
        <p class="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Late</p>
        <p class="text-sm font-bold text-[#D97706] mt-0.5">{{ analyticsData.summary.lateTotal }}</p>
      </div>
      <div class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
        <p class="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Absent</p>
        <p class="text-sm font-bold text-[#DC2626] mt-0.5">{{ analyticsData.summary.absentTotal }}</p>
      </div>
      <div class="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
        <p class="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Leave</p>
        <p class="text-sm font-bold text-[#64748B] mt-0.5">{{ analyticsData.summary.leaveTotal }}</p>
      </div>
      <div class="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
        <p class="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Overtime</p>
        <p class="text-sm font-bold text-[#059669] mt-0.5">{{ analyticsData.summary.overtimeHours }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAttendance } from '@/composables/workforce/useAttendance';

const { selectedTimeframe, analyticsData, activeMetrics, toggleMetric } = useAttendance();

const timeframes = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'custom', label: 'Custom' }
];

const metricOptions = [
  { name: 'Present', color: '#2563EB' },
  { name: 'Late', color: '#F59E0B' },
  { name: 'Absent', color: '#EF4444' },
  { name: 'Leave', color: '#64748B' },
  { name: 'Overtime', color: '#10B981' }
];

const series = computed(() => {
  return analyticsData.value?.series || [];
});

const filteredSeries = computed(() => {
  return series.value.filter(s => activeMetrics.value[s.name]);
});

const chartOptions = computed(() => {
  const categories = analyticsData.value?.categories || [];
  
  const activeColors = filteredSeries.value.map(s => {
    const opt = metricOptions.find(m => m.name === s.name);
    return opt ? opt.color : '#2563EB';
  });

  return {
    chart: {
      type: 'area',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent'
    },
    colors: activeColors,
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.20,
        opacityTo: 0.02,
        stops: [0, 95, 100]
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2.5
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '11px',
          fontWeight: 500
        }
      },
      axisBorder: {
        show: true,
        color: '#E2E8F0'
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '11px'
        }
      }
    },
    grid: {
      borderColor: '#F1F5F9',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    legend: {
      show: false
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
      },
      x: { show: true },
      marker: { show: true }
    }
  };
});
</script>

<style scoped>
.attendance-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
</style>

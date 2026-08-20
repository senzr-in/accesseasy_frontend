import { ref, onMounted, watch } from 'vue';
import { attendanceService } from '@/services/attendanceService';

export function useAttendance() {
  const selectedTimeframe = ref('7d'); // 'today', '7d', '30d', 'custom'
  const analyticsData = ref(null);
  const isLoading = ref(true);
  const activeMetrics = ref({
    Present: true,
    Late: true,
    Absent: true,
    Leave: true,
    Overtime: true
  });

  const loadAnalytics = async () => {
    isLoading.value = true;
    try {
      const data = await attendanceService.getAttendanceAnalytics(selectedTimeframe.value);
      analyticsData.value = data;
    } catch (e) {
      console.error('[useAttendance] Error loading analytics:', e);
    } finally {
      isLoading.value = false;
    }
  };

  watch(selectedTimeframe, () => {
    loadAnalytics();
  });

  onMounted(() => {
    loadAnalytics();
  });

  const toggleMetric = (metricName) => {
    activeMetrics.value[metricName] = !activeMetrics.value[metricName];
  };

  return {
    selectedTimeframe,
    analyticsData,
    isLoading,
    activeMetrics,
    toggleMetric,
    reload: loadAnalytics
  };
}

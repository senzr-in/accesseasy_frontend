import { ref, computed, onMounted } from 'vue';
import { workforceService } from '@/services/workforceService';

export function usePresence() {
  const presenceData = ref({
    total: 2486,
    onSite: 1731,
    remote: 312,
    onLeave: 87,
    absent: 356,
    onSitePercentage: 69.6,
    departments: []
  });
  const isLoading = ref(true);
  const selectedCategory = ref(null); // 'onSite', 'remote', 'onLeave', 'absent' or null

  const loadPresence = async (filter = {}) => {
    isLoading.value = true;
    try {
      const res = await workforceService.getPresenceBreakdown(filter);
      presenceData.value = res;
    } catch (e) {
      console.error('[usePresence] Error loading presence:', e);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    loadPresence();
  });

  const categories = computed(() => [
    { key: 'onSite', label: 'On-site', count: presenceData.value.onSite, percentage: ((presenceData.value.onSite / presenceData.value.total) * 100).toFixed(1), color: '#3478F6' },
    { key: 'remote', label: 'Remote', count: presenceData.value.remote, percentage: ((presenceData.value.remote / presenceData.value.total) * 100).toFixed(1), color: '#34A853' },
    { key: 'onLeave', label: 'On Leave', count: presenceData.value.onLeave, percentage: ((presenceData.value.onLeave / presenceData.value.total) * 100).toFixed(1), color: '#F5A623' },
    { key: 'absent', label: 'Absent', count: presenceData.value.absent, percentage: ((presenceData.value.absent / presenceData.value.total) * 100).toFixed(1), color: '#E5484D' }
  ]);

  const selectCategory = (key) => {
    if (selectedCategory.value === key) {
      selectedCategory.value = null;
    } else {
      selectedCategory.value = key;
    }
  };

  return {
    presenceData,
    categories,
    selectedCategory,
    isLoading,
    selectCategory,
    reload: loadPresence
  };
}

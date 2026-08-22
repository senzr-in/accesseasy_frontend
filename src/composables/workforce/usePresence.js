import { ref, computed, onMounted } from 'vue';
import { workforceService } from '@/services/workforceService';

export function usePresence() {
  const presenceData = ref({
    total: 0,
    onSite: 0,
    remote: 0,
    onLeave: 0,
    absent: 0,
    onSitePercentage: 0,
    departments: []
  });
  const isLoading = ref(true);
  const selectedCategory = ref(null); // 'onSite', 'remote', 'onLeave', 'absent' or null

  const loadPresence = async (filter = {}) => {
    isLoading.value = true;
    try {
      const res = await workforceService.getPresenceBreakdown(filter);
      if (res) {
        presenceData.value = res;
      }
    } catch (e) {
      console.error('[usePresence] Error loading presence:', e);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    loadPresence();
  });

  const categories = computed(() => {
    const total = presenceData.value.total || 0;
    const calcPct = (count) => (total > 0 ? ((count / total) * 100).toFixed(1) : '0.0');

    return [
      { key: 'onSite', label: 'On-site', count: presenceData.value.onSite || 0, percentage: calcPct(presenceData.value.onSite || 0), color: '#3478F6' },
      { key: 'remote', label: 'Remote', count: presenceData.value.remote || 0, percentage: calcPct(presenceData.value.remote || 0), color: '#34A853' },
      { key: 'onLeave', label: 'On Leave', count: presenceData.value.onLeave || 0, percentage: calcPct(presenceData.value.onLeave || 0), color: '#F5A623' },
      { key: 'absent', label: 'Absent', count: presenceData.value.absent || 0, percentage: calcPct(presenceData.value.absent || 0), color: '#E5484D' }
    ];
  });

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

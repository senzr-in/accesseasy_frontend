import { ref, watch, onMounted } from 'vue';
import { zoneService } from '@/services/zoneService';

const selectedZone = ref('all');
const zones = ref([]);
const loading = ref(false);

export function useZoneFilter() {
  const fetchZones = async () => {
    if (zones.value.length > 0) return;
    loading.value = true;
    try {
      zones.value = await zoneService.fetchZones();
    } catch (e) {
      console.error('Failed to fetch zones for global filter', e);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchZones();
  });

  return {
    selectedZone,
    zones,
    loading,
    fetchZones
  };
}

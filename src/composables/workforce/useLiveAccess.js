import { ref, computed, onMounted } from 'vue';
import { accessService } from '@/services/accessService';
import { useWorkforceMQTT } from './useWorkforceMQTT';

export function useLiveAccess() {
  const events = ref([]);
  const isLoading = ref(true);
  const isPaused = ref(false);
  const filterResult = ref('all'); // all, Granted, Denied
  const searchQuery = ref('');

  const { liveAccessStream, mqttStatus } = useWorkforceMQTT();

  const loadInitialEvents = async () => {
    isLoading.value = true;
    try {
      const initial = await accessService.getLiveEvents({ limit: 15 });
      events.value = initial;
    } catch (e) {
      console.error('[useLiveAccess] Error loading events:', e);
    } finally {
      isLoading.value = false;
    }
  };

  // Merge MQTT stream with initial records
  const allEvents = computed(() => {
    const combined = [...(liveAccessStream.value || []), ...(events.value || [])];
    const seen = new Set();
    const deduped = [];
    for (const ev of combined) {
      const key = ev.id || `${ev.time}-${ev.employee}-${ev.location}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(ev);
      }
    }
    return deduped.slice(0, 30);
  });

  const filteredEvents = computed(() => {
    return allEvents.value.filter(ev => {
      if (filterResult.value !== 'all' && (ev.result || '').toLowerCase() !== filterResult.value.toLowerCase()) {
        return false;
      }
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        return (
          (ev.employee || '').toLowerCase().includes(q) ||
          (ev.location || '').toLowerCase().includes(q) ||
          (ev.method || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  });

  onMounted(() => {
    loadInitialEvents();
  });

  return {
    events: filteredEvents,
    rawCount: computed(() => allEvents.value.length),
    isLoading,
    isPaused,
    filterResult,
    searchQuery,
    mqttStatus,
    togglePause: () => { isPaused.value = !isPaused.value; },
    reload: loadInitialEvents
  };
}

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { accessService } from '@/services/accessService';
import { useWorkforceMQTT } from './useWorkforceMQTT';

export function useLiveAccess() {
  const events = ref([]);
  const isLoading = ref(true);
  const isPaused = ref(false);
  const filterResult = ref('all'); // all, Granted, Denied
  const searchQuery = ref('');

  const { liveAccessStream, mqttStatus, pushMockEvent } = useWorkforceMQTT();

  const loadInitialEvents = async () => {
    isLoading.value = true;
    try {
      const initial = await accessService.getLiveEvents({ limit: 10 });
      events.value = initial;
    } catch (e) {
      console.error('[useLiveAccess] Error loading events:', e);
    } finally {
      isLoading.value = false;
    }
  };

  // Merge MQTT stream smoothly
  const allEvents = computed(() => {
    // Combine local stream with MQTT updates
    const combined = [...liveAccessStream.value, ...events.value];
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
      if (filterResult.value !== 'all' && ev.result.toLowerCase() !== filterResult.value.toLowerCase()) {
        return false;
      }
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        return (
          ev.employee.toLowerCase().includes(q) ||
          ev.location.toLowerCase().includes(q) ||
          ev.method.toLowerCase().includes(q)
        );
      }
      return true;
    });
  });

  let mockInterval = null;

  // Gentle live event generator to simulate live access in environments without physical readers connected
  onMounted(async () => {
    await loadInitialEvents();

    mockInterval = setInterval(() => {
      if (isPaused.value) return;
      const names = ['Rajesh Kumar', 'Priya Sundaram', 'Marcus Vance', 'Elena Rostova', 'Arun Kumar', 'Sarah Jenkins', 'David Chen', 'Amara Okonkwo', 'Unknown Guest'];
      const depts = ['Security', 'Finance', 'Engineering', 'Operations', 'Human Resources', 'Sales', 'Visitor'];
      const doors = ['Main Gate B1', 'Floor 2 East Wing', 'Building 3 Level 4', 'HQ Lobby Turnstile 02', 'Server Room Vault', 'Executive Suite'];
      const methods = ['Face', 'RFID', 'Fingerprint', 'Mobile Pass'];
      
      const randIdx = Math.floor(Math.random() * names.length);
      const isDenied = randIdx === 8 || Math.random() < 0.08;

      const randomEvent = {
        id: `LIVE-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        employee: names[randIdx],
        department: depts[randIdx],
        location: doors[Math.floor(Math.random() * doors.length)],
        method: methods[Math.floor(Math.random() * methods.length)],
        result: isDenied ? 'Denied' : 'Granted',
        reason: isDenied ? (randIdx === 8 ? 'Unregistered Biometric' : 'Expired Access Permission') : null,
        avatar: null
      };

      pushMockEvent(randomEvent);
    }, 12000); // Gentle 12s interval
  });

  onUnmounted(() => {
    if (mockInterval) clearInterval(mockInterval);
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

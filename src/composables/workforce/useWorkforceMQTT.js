/**
 * useWorkforceMQTT.js  –  Unified wrapper delegating to singleton useMQTT.
 */
import { computed } from 'vue';
import { useMQTT } from '@/composables/useMQTT';

export function useWorkforceMQTT() {
  const mqtt = useMQTT();

  // Adapter: map swipeEvents to liveAccessStream for workforce dashboard compatibility
  const liveAccessStream = computed(() => {
    return mqtt.swipeEvents.value.map(ev => {
      const isGranted = ev.action === 'Access Granted' || ev.status === 1 || ev.result === 1;
      let reason = null;
      if (!isGranted) {
        if (typeof ev.action === 'string' && ev.action !== 'Access Denied') {
          reason = ev.action;
        } else if (ev.reason) {
          reason = ev.reason;
        } else {
          reason = 'Card / Group Unauthorized';
        }
      }
      return {
        id: ev.id,
        time: new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        employee: ev.cardNo && ev.cardNo !== 'N/A' ? `Card ${ev.cardNo}` : 'Verified User',
        department: 'Operations',
        location: `Door (${(ev.uuid || '01').slice(0, 8)})`,
        method: ev.readerType === '2' ? 'Face' : ev.readerType === '3' ? 'Fingerprint' : 'RFID',
        result: isGranted ? 'Granted' : 'Denied',
        reason: reason,
        avatar: null,
        timestamp: ev.timestamp
      };
    });
  });

  return {
    ...mqtt,
    liveAccessStream,
    deviceTelemetry: mqtt.deviceOnlineMap,
    pushMockEvent: (ev) => {}
  };
}


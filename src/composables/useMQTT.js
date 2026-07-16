/**
 * useMQTT.js  –  Vue 3 composable wrapping mqttService with reactive state.
 *
 * Exported refs (module-level singletons — shared across all instances):
 *   mqttStatus      'connecting' | 'connected' | 'disconnected' | 'error'
 *   personEvents    Array of person detection event objects (max 50)
 *   lpEvents        Array of license-plate event objects   (max 50)
 *   personCounts    { [cameraName]: number }
 *   personSnapshots { [cameraName]: objectURL }
 *   lpSnapshots     { [eventId]: 'data:image/jpeg;base64,…' }
 *
 * Usage:
 *   const { mqttStatus, personEvents, lpEvents, personCounts, personSnapshots, lpSnapshots } = useMQTT();
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { mqttService } from '@/services/mqttService';

const MAX_EVENTS = 50;

// ── Module-level reactive state (shared / singleton) ─────────────────────────
const mqttStatus      = ref('disconnected');
const personEvents    = ref([]);
const lpEvents        = ref([]);
const personCounts    = ref({});
const personSnapshots = ref({});
const lpSnapshots     = ref({});

let _refCount      = 0;
let _statusUnsub   = null;
let _eventUnsub    = null;
let _countUnsub    = null;
let _snapUnsub     = null;
let _lpSnapUnsub   = null;
let _lpBase64Unsub = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract camera name from topic like "frigate/<camera>/…" */
function cameraFrom(topic) {
  return topic.split('/')[1] ?? 'unknown';
}

/** Prepend an item to a ref-array and trim to max length (immutably). */
function prepend(refArr, item) {
  refArr.value = [item, ...refArr.value].slice(0, MAX_EVENTS);
}

// ── MQTT message handlers ─────────────────────────────────────────────────────

function handleFrigateEvent(_topic, payload) {
  let msg;
  try { msg = JSON.parse(payload.toString()); }
  catch { console.warn('[useMQTT] Could not parse frigate/events payload'); return; }

  const { type, after } = msg;
  if (!after) return;

  const label = after.label;
  console.debug(`[useMQTT] ▶ frigate/events  type=${type}  label=${label}  camera=${after.camera}`);

  // ── Person detection ───────────────────────────────────────────────────────
  if (label === 'person') {
    const ev = {
      id:        after.id,
      camera:    after.camera,
      type,                         // 'new' | 'update' | 'end'
      score:     after.score   ?? 0,
      topScore:  after.top_score ?? 0,
      active:    after.active  ?? (type !== 'end'),
      startTime: after.start_time,
      endTime:   after.end_time ?? null,
      snapshot:  after.snapshot ?? null,
      timestamp: Date.now(),
    };

    const idx = personEvents.value.findIndex(e => e.id === ev.id);
    if (idx !== -1) {
      if (type === 'end') {
        // Move to bottom of list (ended)
        const rest = personEvents.value.filter((_, i) => i !== idx);
        personEvents.value = [...rest, ev].slice(0, MAX_EVENTS);
      } else {
        // Replace immutably so Vue 3 detects the change
        const next = [...personEvents.value];
        next[idx] = ev;
        personEvents.value = next;
      }
    } else {
      prepend(personEvents, ev);
    }
  }

  // ── License-plate detection ────────────────────────────────────────────────
  if (label === 'license_plate') {
    const ev = {
      id:          after.id,
      camera:      after.camera,
      score:       after.score ?? 0,
      startTime:   after.start_time,
      hasSnapshot: after.has_snapshot ?? false,
      type,
      timestamp:   Date.now(),
    };

    const idx = lpEvents.value.findIndex(e => e.id === ev.id);
    if (idx !== -1) {
      const next = [...lpEvents.value];
      next[idx] = { ...next[idx], ...ev };
      lpEvents.value = next;
    } else {
      prepend(lpEvents, ev);
    }
  }
}

function handlePersonCount(topic, payload) {
  const camera = cameraFrom(topic);
  const count  = parseInt(payload.toString(), 10);
  console.debug(`[useMQTT] person count  camera=${camera}  count=${count}`);
  personCounts.value = { ...personCounts.value, [camera]: isNaN(count) ? 0 : count };
}

function handlePersonSnapshot(topic, payload) {
  const camera = cameraFrom(topic);
  console.debug(`[useMQTT] person snapshot received  camera=${camera}  bytes=${payload.byteLength}`);
  const blob = new Blob([payload], { type: 'image/jpeg' });
  // Revoke the old URL to avoid memory leaks
  if (personSnapshots.value[camera]) URL.revokeObjectURL(personSnapshots.value[camera]);
  personSnapshots.value = { ...personSnapshots.value, [camera]: URL.createObjectURL(blob) };
}

function handleLPSnapshotFile(topic, payload) {
  const camera   = cameraFrom(topic);
  const filename = payload.toString();
  console.debug(`[useMQTT] LP snapshot file  camera=${camera}  file=${filename}`);
  const idx = lpEvents.value.findIndex(e => e.camera === camera);
  if (idx !== -1) {
    const next = [...lpEvents.value];
    next[idx] = { ...next[idx], snapshotFile: filename };
    lpEvents.value = next;
  }
}

function handleLPBase64(topic, payload) {
  // topic: frigate/<camera>/license_plate/snapshot/bytes/<eventId>
  const parts   = topic.split('/');
  const eventId = parts[parts.length - 1];
  const b64     = payload.toString();
  const dataUrl = `data:image/jpeg;base64,${b64}`;
  console.debug(`[useMQTT] LP base64 snapshot  eventId=${eventId}  len=${b64.length}`);

  lpSnapshots.value = { ...lpSnapshots.value, [eventId]: dataUrl };

  const idx = lpEvents.value.findIndex(e => e.id === eventId);
  if (idx !== -1) {
    const next = [...lpEvents.value];
    next[idx] = { ...next[idx], imageUrl: dataUrl };
    lpEvents.value = next;
  }
}

// ── Lifecycle helpers ─────────────────────────────────────────────────────────

function _subscribe() {
  console.log('[useMQTT] Subscribing handlers + connecting MQTT service');
  _statusUnsub   = mqttService.onStatus(s => { mqttStatus.value = s; });
  _eventUnsub    = mqttService.on('frigate/events',                           handleFrigateEvent);
  _countUnsub    = mqttService.on('frigate/+/person',                         handlePersonCount);
  _snapUnsub     = mqttService.on('frigate/+/person/snapshot',                handlePersonSnapshot);
  _lpSnapUnsub   = mqttService.on('frigate/+/license_plate/snapshot',         handleLPSnapshotFile);
  _lpBase64Unsub = mqttService.on('frigate/+/license_plate/snapshot/bytes/+', handleLPBase64);
  mqttService.connect();
}

function _unsubscribe() {
  console.log('[useMQTT] Unsubscribing handlers + disconnecting MQTT service');
  _statusUnsub?.();
  _eventUnsub?.();
  _countUnsub?.();
  _snapUnsub?.();
  _lpSnapUnsub?.();
  _lpBase64Unsub?.();
  Object.values(personSnapshots.value).forEach(u => URL.revokeObjectURL(u));
  personSnapshots.value = {};
  mqttService.disconnect();
}

// ── Composable export ─────────────────────────────────────────────────────────

export function useMQTT() {
  onMounted(() => {
    if (_refCount === 0) _subscribe();
    _refCount++;
    console.log(`[useMQTT] Component mounted — refCount=${_refCount}`);
  });

  onUnmounted(() => {
    _refCount--;
    console.log(`[useMQTT] Component unmounted — refCount=${_refCount}`);
    if (_refCount <= 0) {
      _refCount = 0;
      _unsubscribe();
    }
  });

  return {
    mqttStatus,
    personEvents,
    lpEvents,
    personCounts,
    personSnapshots,
    lpSnapshots,
  };
}

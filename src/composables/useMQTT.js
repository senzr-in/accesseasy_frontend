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
import { correlationEngine } from '@/services/correlationEngine';

const MAX_EVENTS = 50;

// ── Module-level reactive state (shared / singleton) ─────────────────────────
const mqttStatus      = ref('disconnected');
const personEvents    = ref([]);
const lpEvents        = ref([]);
const swipeEvents     = ref([]);
const alarmEvents     = ref([]);
const activeAlarms    = ref([]);
const personCounts    = ref({});
const personSnapshots = ref({});
const lpSnapshots     = ref({});

let _refCount      = 0;
let _statusUnsub   = null;
let _eventUnsub    = null;
let _swipeUnsub    = null;
let _alarmUnsub    = null;
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

function dismissAlarm(alarmId) {
  activeAlarms.value = activeAlarms.value.filter(a => a.id !== alarmId);
}

// ── MQTT message handlers ─────────────────────────────────────────────────────

function handleAlarmEvent(topic, payload) {
  let msg;
  try { msg = JSON.parse(payload.toString()); }
  catch { return; }

  // Check MD5 signature verification if sign present
  if (msg.sign && !mqttService.verifyMD5Signature(msg)) {
    console.warn('[useMQTT] Signature verification failed for alarm payload from:', msg.uuid);
    return;
  }

  const data = msg.data || {};
  const alarmType = data.type !== undefined ? Number(data.type) : -1;
  const alarmVal = data.value !== undefined ? Number(data.value) : (data.state === 'activated' ? 1 : 0);
  const doorIdx = data.index || data.doorIndex || '01';

  let alarmTitle = '';
  let severity = 'info'; // info | warning | critical

  if (alarmType === 1 || data.fireAlarm || data.type === 'fireAlarm') {
    alarmTitle = '🔥 FIRE ALARM ACTIVATED';
    severity = 'critical';
  } else if (alarmType === 6 || data.tamperAlarm || data.type === 'tamperAlarm') {
    alarmTitle = '🚨 ANTI-TAMPER ALARM TRIGGERED';
    severity = 'critical';
  } else if (alarmType === 2 || data.doorAlarm === 'forceOpen') {
    alarmTitle = '⚠️ UNAUTHORIZED DOOR FORCED OPEN';
    severity = 'warning';
  } else if (alarmType === 3 || data.doorAlarm === 'leftOpenTimeout') {
    alarmTitle = '⌛ DOOR LEFT OPEN TIMEOUT';
    severity = 'warning';
  } else if (alarmType === 0) {
    alarmTitle = `Door ${doorIdx} Sensor: ${alarmVal === 1 ? 'OPEN' : 'CLOSED'}`;
    severity = 'info';
  } else {
    alarmTitle = `Alarm Event (Type ${alarmType})`;
  }

  const timeVal = msg.time;
  const timestampMs = (timeVal && timeVal < 1e11) ? timeVal * 1000 : (timeVal || Date.now());

  const alarmObj = {
    id: msg.serialNo || `alarm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    uuid: msg.uuid || 'UNKNOWN-GATEWAY',
    doorIndex: doorIdx,
    type: alarmType,
    value: alarmVal,
    title: alarmTitle,
    severity: severity,
    timestamp: timestampMs,
    formattedTime: new Date(timestampMs).toLocaleTimeString(),
  };

  prepend(alarmEvents, alarmObj);

  // Push to active critical/warning alarms list for real-time banner display
  if (severity === 'critical' || severity === 'warning') {
    activeAlarms.value = [alarmObj, ...activeAlarms.value.filter(a => a.id !== alarmObj.id)];
  }

  console.warn(`[useMQTT] 🚨 Gateway Alarm Received: ${alarmTitle} [UUID: ${alarmObj.uuid}]`);
}

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

    if (type === 'new' || type === 'update') {
      // Feed to correlation engine
      correlationEngine.addCameraEvent({
        id: ev.id,
        timestamp: ev.timestamp,
        doorId: ev.camera,
        snapshotUrl: personSnapshots.value[ev.camera] || `http://frigate-mqtt.knative-fn.65.109.41.139.sslip.io/api/events/${ev.id}/snapshot.jpg`
      });
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

function handleSwipeEvent(topic, payload) {
  let msg;
  try { msg = JSON.parse(payload.toString()); }
  catch { console.warn('[useMQTT] Could not parse swipe event payload'); return; }

  // If topic is access_device/v1/event/alarm, delegate to alarm handler
  if (topic.includes('/event/alarm')) {
    handleAlarmEvent(topic, payload);
    return;
  }

  // Normalize timestamp: if seconds (10 digits < 1e11), convert to ms for JS Date
  const timeVal = msg.time;
  const timestampMs = (timeVal && timeVal < 1e11) ? timeVal * 1000 : (timeVal || Date.now());

  const data = msg.data || {};
  const ev = {
    id: msg.serialNo || `swipe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    uuid: msg.uuid,
    cardNo: data.cardNo || data.code || 'N/A',
    doorIndex: data.doorIndex || data.index || '01',
    readerType: data.readerType || '1',
    swipeTime: data.swipeTime || new Date(timestampMs).toLocaleString(),
    action: data.action || (data.status === 1 || data.result === 1 ? 'Access Granted' : 'Access Denied'),
    status: data.status !== undefined ? data.status : (data.result ?? 0),
    timestamp: timestampMs,
  };

  prepend(swipeEvents, ev);
  console.debug(`[useMQTT] ▶ access_device swipe event card=${ev.cardNo} door=${ev.doorIndex} action="${ev.action}"`);

  // Feed to correlation engine
  correlationEngine.addSwipeEvent({
    id: ev.id,
    timestamp: ev.timestamp,
    doorId: ev.uuid || 'unknown', // Map gateway UUID or doorIndex to doorId
    employeeName: `Card ${ev.cardNo}`,
    cardId: ev.cardNo,
    profilePic: null
  });
}

// ── Lifecycle helpers ─────────────────────────────────────────────────────────

function _subscribe() {
  console.log('[useMQTT] Subscribing handlers + connecting MQTT service');
  _statusUnsub   = mqttService.onStatus(s => { mqttStatus.value = s; });
  _eventUnsub    = mqttService.on('frigate/events',                           handleFrigateEvent);
  _swipeUnsub    = mqttService.on('access_device/v1/event/#',                 handleSwipeEvent);
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
  _swipeUnsub?.();
  _alarmUnsub?.();
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
    swipeEvents,
    alarmEvents,
    activeAlarms,
    personCounts,
    personSnapshots,
    lpSnapshots,
    dismissAlarm,
    // Access Control Gateway RPC Actions
    sendRemoteDoorOpen:   (uuid, doorIndex, timing) => mqttService.sendRemoteDoorOpen(uuid, doorIndex, timing),
    sendInsertPermission: (uuid, cardNo, doorIndices, accessLevel) => mqttService.sendInsertPermission(uuid, cardNo, doorIndices, accessLevel),
    sendDeletePermission: (uuid, cardNo) => mqttService.sendDeletePermission(uuid, cardNo),
    sendClearCards:       (uuid) => mqttService.sendClearCards(uuid),
    sendReboot:           (uuid) => mqttService.sendReboot(uuid),
    sendGetConfig:        (uuid) => mqttService.sendGetConfig(uuid),
    sendGetChildConfig:   (uuid) => mqttService.sendGetChildConfig(uuid),
    sendSetConfig:        (uuid, configObj) => mqttService.sendSetConfig(uuid, configObj),
    sendSet4DoorConfig:   (uuid, childInfoArray) => mqttService.sendSet4DoorConfig(uuid, childInfoArray),
    batchSyncCards:       (uuid, cardsList, chunkSize, progressCb) => mqttService.batchSyncCards(uuid, cardsList, chunkSize, progressCb),
  };
}

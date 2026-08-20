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
import { deviceRegistry } from '@/services/deviceRegistry';

const MAX_EVENTS = 50;

// ── Module-level reactive state (shared / singleton) ─────────────────────────
const mqttStatus       = ref('disconnected');
const personEvents     = ref([]);
const lpEvents         = ref([]);
const swipeEvents      = ref([]);
const alarmEvents      = ref([]);
const activeAlarms     = ref([]);
const personCounts     = ref({});
const personSnapshots  = ref({});
const lpSnapshots      = ref({});
const deviceOnlineMap  = ref({});    // { [uuid]: { status: 'online'|'offline', lastSeen: timestamp, ip: string, version: string } }
const doorSensorStates = ref({});    // { [`${uuid}_${doorIndex}`]: { state: 'open'|'closed'|'forced'|'timeout', lastUpdated: timestamp } }
const guardMessages    = ref([]);    // Array of real-time guard messages

let _refCount       = 0;
let _statusUnsub    = null;
let _eventUnsub     = null;
let _swipeUnsub     = null;
let _alarmUnsub     = null;
let _countUnsub     = null;
let _snapUnsub      = null;
let _lpSnapUnsub    = null;
let _lpBase64Unsub  = null;
let _heartbeatUnsub = null;
let _guardUnsub     = null;
let _offlineCheckTimer = null;

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

  // Only allow registered devices
  if (!deviceRegistry.isDeviceRegistered(msg.uuid)) {
    return;
  }

  // Mark controller as online
  if (msg.uuid) {
    deviceOnlineMap.value = {
      ...deviceOnlineMap.value,
      [msg.uuid]: { status: 'online', lastSeen: Date.now() }
    };
  }

  // Check MD5 signature verification if sign present
  if (msg.sign && !mqttService.verifyMD5Signature(msg)) {
    console.warn('[useMQTT] Signature verification failed for alarm payload from:', msg.uuid);
    return;
  }

  const data = msg.data || {};
  const alarmType = data.type !== undefined ? Number(data.type) : -1;
  const alarmVal = data.value !== undefined ? Number(data.value) : (data.state === 'activated' ? 1 : 0);
  const doorIdx = data.index || data.doorIndex || '01';

  // Update reactive door sensor state
  const sensorKey = `${msg.uuid}_${doorIdx}`;
  let sensorState = 'closed';
  if (alarmType === 0) {
    sensorState = alarmVal === 1 ? 'open' : 'closed';
  } else if (alarmType === 2 || data.doorAlarm === 'forceOpen') {
    sensorState = 'forced';
  } else if (alarmType === 3 || data.doorAlarm === 'leftOpenTimeout') {
    sensorState = 'timeout';
  } else if (alarmType === 4) {
    sensorState = 'timeout';
  }
  doorSensorStates.value = {
    ...doorSensorStates.value,
    [sensorKey]: { state: sensorState, lastUpdated: Date.now() },
    [doorIdx]: { state: sensorState, lastUpdated: Date.now() }
  };

  let alarmTitle = '';
  let severity = 'info'; // info | warning | critical

  switch (alarmType) {
    case 0: // Door sensor status
      alarmTitle = `Door ${doorIdx} Sensor: ${alarmVal === 1 ? 'OPEN' : 'CLOSED'}`;
      severity = 'info';
      break;
    case 1: // Fire alarm status
      alarmTitle = alarmVal === 1 ? '🔥 FIRE ALARM ACTIVATED' : '🟢 Fire Alarm Normal';
      severity = alarmVal === 1 ? 'critical' : 'info';
      break;
    case 2: // Unauthorized opening of the door
      alarmTitle = `🚨 UNAUTHORIZED OPENING (Door ${doorIdx})`;
      severity = 'critical';
      break;
    case 3: // Door opening timeout
      alarmTitle = `⌛ DOOR OPENING TIMEOUT (Door ${doorIdx})`;
      severity = 'warning';
      break;
    case 4: // Door closing timeout
      alarmTitle = `⌛ DOOR CLOSING TIMEOUT (Door ${doorIdx})`;
      severity = 'warning';
      break;
    case 5: // Upgrade report
      alarmTitle = alarmVal === 1 ? '✅ Firmware Upgrade Completed Successfully' : '❌ Firmware Upgrade Failed';
      severity = alarmVal === 1 ? 'info' : 'warning';
      break;
    case 6: // Anti-tamper alarm
      alarmTitle = alarmVal === 1 ? '🚨 ANTI-TAMPER ALARM TRIGGERED' : '🛡️ Anti-Tamper Alarm Normal';
      severity = alarmVal === 1 ? 'critical' : 'info';
      break;
    case 100: // Configure upload code
      alarmTitle = `⚙️ Configuration Upload Notification (Device ${msg.uuid})`;
      severity = 'info';
      break;
    case 202: // M1 Configuration Card
      alarmTitle = `💳 M1 Configuration Card Read (Door ${doorIdx})`;
      severity = 'info';
      break;
    default:
      alarmTitle = `Equipment Event (Type ${alarmType})`;
      severity = 'info';
      break;
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

  // Only allow registered cameras
  if (!deviceRegistry.isCameraRegistered(after.camera)) {
    return;
  }

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
  if (!deviceRegistry.isCameraRegistered(camera)) {
    return;
  }
  const count  = parseInt(payload.toString(), 10);
  console.debug(`[useMQTT] person count  camera=${camera}  count=${count}`);
  personCounts.value = { ...personCounts.value, [camera]: isNaN(count) ? 0 : count };
}

function handlePersonSnapshot(topic, payload) {
  const camera = cameraFrom(topic);
  if (!deviceRegistry.isCameraRegistered(camera)) {
    return;
  }
  console.debug(`[useMQTT] person snapshot received  camera=${camera}  bytes=${payload.byteLength}`);
  const blob = new Blob([payload], { type: 'image/jpeg' });
  // Revoke the old URL to avoid memory leaks
  if (personSnapshots.value[camera]) URL.revokeObjectURL(personSnapshots.value[camera]);
  personSnapshots.value = { ...personSnapshots.value, [camera]: URL.createObjectURL(blob) };
}

function handleLPSnapshotFile(topic, payload) {
  const camera   = cameraFrom(topic);
  if (!deviceRegistry.isCameraRegistered(camera)) {
    return;
  }
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

  // Only allow registered devices
  if (!deviceRegistry.isDeviceRegistered(msg.uuid)) {
    return;
  }

  // Mark controller as online
  if (msg.uuid) {
    deviceOnlineMap.value = {
      ...deviceOnlineMap.value,
      [msg.uuid]: { status: 'online', lastSeen: Date.now() }
    };
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

function handleHeartbeatEvent(topic, payload) {
  let msg;
  try { msg = JSON.parse(payload.toString()); }
  catch { return; }

  const uuid = msg.uuid || (topic.split('/')[3]);
  if (!uuid) return;

  const data = msg.data || {};
  deviceOnlineMap.value = {
    ...deviceOnlineMap.value,
    [uuid]: {
      status: 'online',
      lastSeen: Date.now(),
      ip: data.ip || msg.ip || null,
      version: data.version || msg.version || null
    }
  };
  console.debug(`[useMQTT] 💓 Device Heartbeat received from ${uuid}`);
}

function handleGuardMessage(topic, payload) {
  let msg;
  try { msg = JSON.parse(payload.toString()); }
  catch { return; }

  const parts = topic.split('/');
  const guardId = parts[parts.indexOf('guards') + 1] || 'unknown';

  const guardMsg = {
    id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    guardId,
    type: msg.type || 'text',
    text: msg.text || msg.message || '',
    fileId: msg.fileId || null,
    timestamp: msg.timestamp || Date.now(),
    sender: msg.sender || 'guard'
  };

  prepend(guardMessages, guardMsg);
  console.debug(`[useMQTT] 📩 Guard message on topic ${topic}:`, guardMsg);
}

// Periodic check: mark controllers offline if no heartbeat/swipe in 90 seconds
function checkDeviceTimeouts() {
  const now = Date.now();
  const threshold = 90000; // 90 seconds
  let changed = false;
  const next = { ...deviceOnlineMap.value };

  for (const [uuid, info] of Object.entries(next)) {
    if (info.status === 'online' && (now - info.lastSeen > threshold)) {
      next[uuid] = { ...info, status: 'offline' };
      changed = true;
    }
  }

  if (changed) {
    deviceOnlineMap.value = next;
  }
}

// ── Lifecycle helpers ─────────────────────────────────────────────────────────

function _subscribe() {
  console.log('[useMQTT] Subscribing handlers + connecting MQTT service');
  deviceRegistry.loadDevices();
  _statusUnsub    = mqttService.onStatus(s => { mqttStatus.value = s; });
  _eventUnsub     = mqttService.on('frigate/events',                           handleFrigateEvent);
  _swipeUnsub     = mqttService.on('access_device/v1/event/#',                 handleSwipeEvent);
  _heartbeatUnsub = mqttService.on('access_device/v1/event/heartbeat',         handleHeartbeatEvent);
  _guardUnsub     = mqttService.on('accesseasy/tenant/+/guards/#',             handleGuardMessage);
  _countUnsub     = mqttService.on('frigate/+/person',                         handlePersonCount);
  _snapUnsub      = mqttService.on('frigate/+/person/snapshot',                handlePersonSnapshot);
  _lpSnapUnsub    = mqttService.on('frigate/+/license_plate/snapshot',         handleLPSnapshotFile);
  _lpBase64Unsub  = mqttService.on('frigate/+/license_plate/snapshot/bytes/+', handleLPBase64);

  if (!_offlineCheckTimer) {
    _offlineCheckTimer = setInterval(checkDeviceTimeouts, 15000);
  }

  mqttService.connect();
}

function _unsubscribe() {
  console.log('[useMQTT] Unsubscribing handlers + disconnecting MQTT service');
  _statusUnsub?.();
  _eventUnsub?.();
  _swipeUnsub?.();
  _alarmUnsub?.();
  _heartbeatUnsub?.();
  _guardUnsub?.();
  _countUnsub?.();
  _snapUnsub?.();
  _lpSnapUnsub?.();
  _lpBase64Unsub?.();

  if (_offlineCheckTimer) {
    clearInterval(_offlineCheckTimer);
    _offlineCheckTimer = null;
  }

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
    deviceOnlineMap,
    doorSensorStates,
    guardMessages,
    dismissAlarm,
    // Access Control Gateway RPC Actions
    sendRemoteDoorOpen:            (uuid, doorIndex, timing) => mqttService.sendRemoteDoorOpen(uuid, doorIndex, timing),
    sendInsertPermission:          (uuid, cardNo, doorIndices, accessLevel, cardType) => mqttService.sendInsertPermission(uuid, cardNo, doorIndices, accessLevel, cardType),
    sendInsertQRAccess:            (uuid, qrCode, doorIndices, qrType, expirationMinutes) => mqttService.sendInsertQRAccess(uuid, qrCode, doorIndices, qrType, expirationMinutes),
    sendInsertFacePermission:      (uuid, personId, faceData, doorIndices, accessLevel) => mqttService.sendInsertFacePermission(uuid, personId, faceData, doorIndices, accessLevel),
    sendInsertPasswordPermission:  (uuid, personId, password, doorIndices, accessLevel) => mqttService.sendInsertPasswordPermission(uuid, personId, password, doorIndices, accessLevel),
    sendInsertFingerprintPermission: (uuid, personId, fingerprintData, doorIndices, accessLevel) => mqttService.sendInsertFingerprintPermission(uuid, personId, fingerprintData, doorIndices, accessLevel),
    sendInsertBluetoothPermission: (uuid, personId, certData, doorIndices, accessLevel) => mqttService.sendInsertBluetoothPermission(uuid, personId, certData, doorIndices, accessLevel),
    sendInsertPlatePermission:     (uuid, plateNumber, doorIndices, accessLevel) => mqttService.sendInsertPlatePermission(uuid, plateNumber, doorIndices, accessLevel),
    sendDeletePermission:          (uuid, permissionId) => mqttService.sendDeletePermission(uuid, permissionId),
    sendClearPermissions:         (uuid) => mqttService.sendClearPermissions(uuid),
    sendClearCards:               (uuid) => mqttService.sendClearCards(uuid),
    sendGetPermissions:           (uuid, page, size) => mqttService.sendGetPermissions(uuid, page, size),
    // Dedicated Facial Terminal Methods
    sendInsertFace:               (uuid, personId, base64Image, doorIndex, name) => mqttService.sendInsertFace(uuid, personId, base64Image, doorIndex, name),
    sendDelFace:                  (uuid, personId) => mqttService.sendDelFace(uuid, personId),
    sendClearFaces:               (uuid) => mqttService.sendClearFaces(uuid),
    // Remote Hardware Control Actions
    sendReboot:                   (uuid) => mqttService.sendReboot(uuid),
    sendDeviceEnable:             (uuid) => mqttService.sendDeviceEnable(uuid),
    sendDeviceDisable:            (uuid) => mqttService.sendDeviceDisable(uuid),
    sendFactoryReset:             (uuid) => mqttService.sendFactoryReset(uuid),
    sendScreenPrompt:             (uuid, message, timeoutSeconds, wavFileName) => mqttService.sendScreenPrompt(uuid, message, timeoutSeconds, wavFileName),
    sendUpgradeFirmware:          (uuid, firmwareUrl, md5Hash, type, subDeviceExtra) => mqttService.sendUpgradeFirmware(uuid, firmwareUrl, md5Hash, type, subDeviceExtra),
    sendGetConfig:                (uuid) => mqttService.sendGetConfig(uuid),
    sendGetChildConfig:           (uuid) => mqttService.sendGetChildConfig(uuid),
    sendSetConfig:                (uuid, configObj) => mqttService.sendSetConfig(uuid, configObj),
    sendSet4DoorConfig:           (uuid, childInfoArray) => mqttService.sendSet4DoorConfig(uuid, childInfoArray),
    batchSyncCards:               (uuid, cardsList, chunkSize, progressCb) => mqttService.batchSyncCards(uuid, cardsList, chunkSize, progressCb),
  };
}

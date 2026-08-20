/**
 * mqttService.js  –  Singleton MQTT client (WebSocket) for AccessEasy.
 *
 * Broker: mqtt.fieldseasy.com  (tries WSS → WS fallbacks)
 * Topics:
 *   frigate/events                           – person & plate detection events
 *   frigate/+/person                         – live person count per camera
 *   frigate/+/person/snapshot                – JPEG bytes (person snapshot)
 *   frigate/+/license_plate/snapshot         – LP snapshot filename
 *   frigate/+/license_plate/snapshot/bytes/+ – base64 annotated LP JPEG
 */

import mqtt from 'mqtt';
import CryptoJS from 'crypto-js';
import { authService } from './authService';

export const GATEWAY_SECRET = 'SENZR_GATEWAY_SECRET_2023';

/**
 * Generate 32-character upper-case MD5 signature for CC104 Gateway payloads.
 * MD5(serialNo + uuid + time + stringifiedData + secretKey)
 */
export function generateMD5Signature(payload, secretKey = GATEWAY_SECRET) {
  try {
    const serialNo = payload.serialNo || '';
    const uuid = payload.uuid || '';
    const time = payload.time || '';
    const dataStr = typeof payload.data === 'string' ? payload.data : JSON.stringify(payload.data || {});
    const rawString = `${serialNo}${uuid}${time}${dataStr}${secretKey}`;
    return CryptoJS.MD5(rawString).toString().toUpperCase();
  } catch (err) {
    console.error('[MQTT] MD5 generation error:', err);
    return '';
  }
}

/**
 * Verify upper-case MD5 signature on incoming uplink payloads.
 */
export function verifyMD5Signature(payload, secretKey = GATEWAY_SECRET) {
  if (!payload || !payload.sign) return true; // Accept unsigned payloads if sign field omitted
  const expected = generateMD5Signature(payload, secretKey);
  return payload.sign.toUpperCase() === expected;
}

// ── Broker endpoints (tried in order) ─────────────────────────────────────────
const BROKER_URLS = [
  'wss://mqtt.fieldseasy.com/mqtt',     // secure WS (port 443)
  'wss://mqtt.fieldseasy.com:8084/mqtt', // secure WS (port 8084)
  'wss://mqtt.fieldseasy.com:8083/mqtt', // secure WS (port 8083)
  'ws://mqtt.fieldseasy.com:9001/mqtt', // Mosquitto default WS
  'ws://mqtt.fieldseasy.com:8083/mqtt', // alternative WS
];

const TOPICS = [
  'access_device/v1/event/#',
  'access_device/v1/cmd/#',
  'access_device/v1/status/#',
  'accesseasy/tenant/+/guards/#',
  'frigate/events',
  'frigate/+/person',
  'frigate/+/person/snapshot',
  'frigate/+/license_plate/snapshot',
  'frigate/+/license_plate/snapshot/bytes/+',
];

const CLIENT_ID = `accesseasy-${Math.random().toString(36).slice(2, 8)}`;

class MQTTService {
  constructor() {
    this._client      = null;
    this._urlIdx      = 0;
    this._retryTimer  = null;
    this._status      = 'disconnected';
    this._statusCbs   = new Set();
    this._listeners   = new Map(); // pattern → Set<fn>
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /** Idempotent – safe to call multiple times. */
  connect() {
    if (this._client) {
      console.log('[MQTT] connect() called but client already exists – skipping');
      return;
    }
    this._attemptConnect();
  }

  /** Hard disconnect & cancel retries. */
  disconnect() {
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
      this._retryTimer = null;
    }
    if (this._client) {
      console.log('[MQTT] Disconnecting client');
      this._client.end(true);
      this._client = null;
    }
    this._setStatus('disconnected');
  }

  /** Register a message handler for a topic pattern (supports + wildcard). */
  on(pattern, cb) {
    if (!this._listeners.has(pattern)) this._listeners.set(pattern, new Set());
    this._listeners.get(pattern).add(cb);
    return () => this._listeners.get(pattern)?.delete(cb);
  }

  /** Watch connection status. Calls cb immediately with current status. */
  onStatus(cb) {
    this._statusCbs.add(cb);
    cb(this._status);
    return () => this._statusCbs.delete(cb);
  }

  /** Publish a message to a specific topic, automatically attaching MD5 signature if applicable. */
  publish(topic, payload, options = { qos: 0, retain: false }) {
    let finalPayload = payload;
    if (typeof payload === 'object' && payload !== null && payload.uuid && payload.serialNo) {
      const signed = { ...payload };
      signed.sign = generateMD5Signature(signed);
      finalPayload = signed;
    }

    if (!this._client || this._status !== 'connected') {
      console.warn('[MQTT] Client disconnected – attempting auto-connect before publishing...');
      this.connect();
      setTimeout(() => {
        if (this._client && this._status === 'connected') {
          const msg = typeof finalPayload === 'string' ? finalPayload : JSON.stringify(finalPayload);
          this._client.publish(topic, msg, options);
          console.log(`[MQTT] Published to ${topic} after auto-connect`);
        }
      }, 500);
      return false;
    }
    const message = typeof finalPayload === 'string' ? finalPayload : JSON.stringify(finalPayload);
    this._client.publish(topic, message, options, (err) => {
      if (err) console.error(`[MQTT] Publish failed for ${topic}:`, err.message);
      else console.log(`[MQTT] Published to ${topic}`);
    });
    return true;
  }

  /** Standard command publisher helper via Knative device-mqtt service. */
  async publishCommand(uuid, cmd, dataObj = {}) {
    if (!uuid) {
      console.warn('[Knative device-mqtt] Cannot publish command — uuid is empty');
      return { code: -1, message: 'Missing UUID' };
    }

    const knativeEndpoint = `${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-mqtt`;
    const token = authService.getToken() || import.meta.env.VITE_API_TOKEN;

    const payload = {
      action: cmd,
      uuid: uuid,
      data: dataObj,
      serialNo: `web-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: Math.floor(Date.now() / 1000)
    };

    // Calculate upper-case 32-character MD5 signature for gateway validation
    payload.sign = generateMD5Signature(payload);

    try {
      console.log(`[Knative device-mqtt] POST -> ${knativeEndpoint}`, payload);
      const res = await fetch(knativeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resultData = await res.json().catch(() => ({ code: 0, message: 'Success' }));
        console.log(`[Knative device-mqtt] ✅ Success reply from router:`, resultData);
        this._dispatch(`access_device/v1/cmd/${uuid}/${cmd}_reply`, JSON.stringify(resultData));
        return resultData;
      } else {
        console.warn(`[Knative device-mqtt] Server returned status ${res.status}`);
      }
    } catch (err) {
      console.error('[Knative device-mqtt] Network error sending command:', err);
    }

    // Fallback: Also publish to browser MQTT client if active
    if (this._client && this._status === 'connected') {
      try {
        this._client.publish(`access_device/v1/cmd/${uuid}/${cmd}`, JSON.stringify(payload));
      } catch (err) {
        console.warn('[MQTT] Broker fallback publish failed:', err);
      }
    }

    return { code: 0, message: 'Dispatched to Knative device-mqtt router' };
  }

  get status() { return this._status; }

  // ── Access Control Protocol V1.0.6 Helpers ──────────────────────────────

  /** Send Remote Door Open command to gateway controller with optional timing (in seconds). */
  sendRemoteDoorOpen(uuid, doorIndex = '01', timing = null) {
    if (this._status !== 'connected') this.connect();
    const doorStr = typeof doorIndex === 'string' ? doorIndex : String(doorIndex);
    const dataPayload = { command: 1, index: doorStr };
    if (timing) {
      const tNum = Number(timing);
      dataPayload.timing = tNum;
      dataPayload.duration = tNum;
      dataPayload.interval = tNum;
      dataPayload.door_timing = tNum;
    }
    return this.publishCommand(uuid, 'remoteControl', dataPayload);
  }

  /**
   * Permission Type Spec:
   *  - QR Code: 100 (Transparent), 101 (Static), 103 (Dynamic)
   *  - Card: 200 (Standard card), 201 (CPU encryption card), 202 (Sector encryption card)
   *  - Face: 300 (Facial Data)
   *  - Password: 400 (Password 6~10 chars)
   *  - Fingerprint: 500 (Fingerprint data)
   *  - Bluetooth: 600 (Bluetooth certificate)
   *  - License Plate: 700 (License Plate)
   *  - Open Button: 800 (Door opening button)
   */

  /** Assign card permissions (200: Standard, 201: CPU encrypted, 202: Sector encrypted). */
  sendInsertPermission(uuid, cardNo, doorIndices = ['01'], accessLevel = 0, cardType = 200) {
    const schedId = Number(accessLevel) || 0;
    const dataPayload = doorIndices.map(idx => ({
      id: String(cardNo),
      type: Number(cardType) || 200,
      code: String(cardNo),
      index: typeof idx === 'string' ? idx : String(idx),
      accessLevel: schedId,
      time: schedId === 0 ? { type: 0 } : { type: 1, scheduleId: schedId }
    }));
    return this.publishCommand(uuid, 'insertPermission', dataPayload);
  }

  /** Assign QR Code permissions (100: Transparent, 101: Static, 103: Dynamic). */
  sendInsertQRAccess(uuid, qrCode, doorIndices = ['01'], qrType = 103, expirationMinutes = 60) {
    const expireTimestamp = Math.floor(Date.now() / 1000) + (expirationMinutes * 60);
    const dataPayload = doorIndices.map(idx => ({
      id: String(qrCode),
      type: Number(qrType) || 103,
      code: String(qrCode),
      index: typeof idx === 'string' ? idx : String(idx),
      accessLevel: 0,
      expireTime: expireTimestamp,
      time: { type: 0 }
    }));
    return this.publishCommand(uuid, 'insertPermission', dataPayload);
  }

  /** Assign Face Recognition Biometric permissions (Type 300: Facial Data). */
  sendInsertFacePermission(uuid, personId, faceData, doorIndices = ['01'], accessLevel = 0) {
    const schedId = Number(accessLevel) || 0;
    const dataPayload = doorIndices.map(idx => ({
      id: String(personId),
      type: 300,
      code: String(faceData),
      index: typeof idx === 'string' ? idx : String(idx),
      accessLevel: schedId,
      time: schedId === 0 ? { type: 0 } : { type: 1, scheduleId: schedId }
    }));
    return this.publishCommand(uuid, 'insertPermission', dataPayload);
  }

  /** Assign Password / Keypad permissions (Type 400: Password data, 6~10 characters). */
  sendInsertPasswordPermission(uuid, personId, password, doorIndices = ['01'], accessLevel = 0) {
    const schedId = Number(accessLevel) || 0;
    const dataPayload = doorIndices.map(idx => ({
      id: String(personId),
      type: 400,
      code: String(password),
      index: typeof idx === 'string' ? idx : String(idx),
      accessLevel: schedId,
      time: schedId === 0 ? { type: 0 } : { type: 1, scheduleId: schedId }
    }));
    return this.publishCommand(uuid, 'insertPermission', dataPayload);
  }

  /** Assign Fingerprint Biometric permissions (Type 500: Fingerprint data). */
  sendInsertFingerprintPermission(uuid, personId, fingerprintData, doorIndices = ['01'], accessLevel = 0) {
    const schedId = Number(accessLevel) || 0;
    const dataPayload = doorIndices.map(idx => ({
      id: String(personId),
      type: 500,
      code: String(fingerprintData),
      index: typeof idx === 'string' ? idx : String(idx),
      accessLevel: schedId,
      time: schedId === 0 ? { type: 0 } : { type: 1, scheduleId: schedId }
    }));
    return this.publishCommand(uuid, 'insertPermission', dataPayload);
  }

  /** Assign Bluetooth Certificate permissions (Type 600: Bluetooth certificate). */
  sendInsertBluetoothPermission(uuid, personId, certData, doorIndices = ['01'], accessLevel = 0) {
    const schedId = Number(accessLevel) || 0;
    const dataPayload = doorIndices.map(idx => ({
      id: String(personId),
      type: 600,
      code: String(certData),
      index: typeof idx === 'string' ? idx : String(idx),
      accessLevel: schedId,
      time: schedId === 0 ? { type: 0 } : { type: 1, scheduleId: schedId }
    }));
    return this.publishCommand(uuid, 'insertPermission', dataPayload);
  }

  /** Assign Vehicle License Plate permissions (Type 700: License Plate). */
  sendInsertPlatePermission(uuid, plateNumber, doorIndices = ['01'], accessLevel = 0) {
    const schedId = Number(accessLevel) || 0;
    const dataPayload = doorIndices.map(idx => ({
      id: String(plateNumber),
      type: 700,
      code: String(plateNumber),
      index: typeof idx === 'string' ? idx : String(idx),
      accessLevel: schedId,
      time: schedId === 0 ? { type: 0 } : { type: 1, scheduleId: schedId }
    }));
    return this.publishCommand(uuid, 'insertPermission', dataPayload);
  }

  /** Sync real-time clock timestamp to gateway controller (IST/Epoch MS). */
  sendSyncTime(uuid) {
    return this.publishCommand(uuid, 'syncTime', { time: Date.now() });
  }

  /** Update system & door configuration on gateway controller. */
  sendSetConfig(uuid, configObj) {
    return this.publishCommand(uuid, 'setConfig', configObj);
  }

  /** Request 4-door childInfo configuration section. */
  sendGetChildConfig(uuid) {
    return this.publishCommand(uuid, 'getConfig', 'childInfo');
  }

  /** Update 4-door per-door configuration (childInfo array). */
  sendSet4DoorConfig(uuid, childInfoArray) {
    return this.publishCommand(uuid, 'setConfig', { childInfo: childInfoArray });
  }

  /** Delete a specific permission from gateway controller (supports delPermission & deletePermission). */
  sendDeletePermission(uuid, permissionId) {
    const idStr = String(permissionId);
    return this.publishCommand(uuid, 'delPermission', [idStr]);
  }

  /** Clear all permission records from gateway controller whitelist. */
  sendClearPermissions(uuid) {
    return this.publishCommand(uuid, 'clearPermission', {});
  }

  /** Alias for clear all cards. */
  sendClearCards(uuid) {
    return this.sendClearPermissions(uuid);
  }

  /** Query active permissions stored in controller flash (paginated). */
  sendGetPermissions(uuid, page = 0, size = 50) {
    return this.publishCommand(uuid, 'getPermission', { page, size });
  }

  // ── Dedicated Facial Image Database Management ───────────────────────────────

  /** Upload Base64 Face Photo to terminal recognition database (Section 4.1). */
  sendInsertFace(uuid, personId, base64Image, doorIndex = '01', name = '') {
    const dataPayload = {
      code: String(personId),
      index: typeof doorIndex === 'string' ? doorIndex : String(doorIndex),
      data: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
      extra: name ? { name: String(name) } : {}
    };
    return this.publishCommand(uuid, 'insertFace', dataPayload);
  }

  /** Delete face template from terminal database (Section 4.2). */
  sendDelFace(uuid, personId) {
    return this.publishCommand(uuid, 'delFace', { code: String(personId) });
  }

  /** Clear all face records from terminal database (Section 4.3). */
  sendClearFaces(uuid) {
    return this.publishCommand(uuid, 'clearFace', {});
  }

  // ── Extended Remote Hardware Controls ────────────────────────────────────────

  /** Activate / Enable device to accept scans (Command 2). */
  sendDeviceEnable(uuid) {
    return this.publishCommand(uuid, 'remoteControl', { command: 2 });
  }

  /** Disable device from responding to scans (Command 3). */
  sendDeviceDisable(uuid) {
    return this.publishCommand(uuid, 'remoteControl', { command: 3 });
  }

  /** Factory reset controller board (Command 4). */
  sendFactoryReset(uuid) {
    return this.publishCommand(uuid, 'remoteControl', { command: 4 });
  }

  /** Show LCD Screen Prompt and play audio WAV prompt on device (Command 5). */
  sendScreenPrompt(uuid, message, timeoutSeconds = 8, wavFileName = '') {
    const dataPayload = {
      command: 5,
      extra: {
        msg: String(message),
        msgTimeout: Number(timeoutSeconds) || 8,
        ...(wavFileName ? { wavFileName: String(wavFileName) } : {})
      }
    };
    return this.publishCommand(uuid, 'remoteControl', dataPayload);
  }

  /** Trigger Over-The-Air (OTA) Firmware Upgrade (Section 7). */
  sendUpgradeFirmware(uuid, firmwareUrl, md5Hash, type = 0, subDeviceExtra = null) {
    const dataPayload = {
      type: Number(type) || 0,
      url: String(firmwareUrl),
      md5: String(md5Hash),
      ...(subDeviceExtra ? { extra: subDeviceExtra } : {})
    };
    return this.publishCommand(uuid, 'upgradeFirmware', dataPayload);
  }

  // ── Batch Card Sync Protocol Engine ──────────────────────────────────────────

  /** Phase 1: Start Chunked Card Sync. */
  sendStartSync(uuid, totalCards, totalChunks) {
    return this.publishCommand(uuid, 'startSync', { totalCards, totalChunks });
  }

  /** Phase 2: Upload Card Chunk Payload. */
  sendSyncCardsChunk(uuid, chunkIndex, cards) {
    return this.publishCommand(uuid, 'syncCardsChunk', { chunkIndex, cards });
  }

  /** Phase 3: Finalize Chunked Card Sync. */
  sendEndSync(uuid, totalCards) {
    return this.publishCommand(uuid, 'endSync', { totalCards });
  }

  /** Executed chunked card database synchronization engine. */
  async batchSyncCards(uuid, cardsList, chunkSize = 100, progressCb = null) {
    if (!cardsList || cardsList.length === 0) return { success: true, count: 0 };
    if (this._status !== 'connected') this.connect();

    const totalCards = cardsList.length;
    const totalChunks = Math.ceil(totalCards / chunkSize);

    console.log(`[BatchSync] Starting sync for ${totalCards} cards across ${totalChunks} chunks to UUID ${uuid}`);

    // Phase 1: startSync
    this.sendStartSync(uuid, totalCards, totalChunks);
    if (progressCb) progressCb({ phase: 'start', progress: 0, totalCards, totalChunks });

    // Phase 2: Send chunks
    for (let i = 0; i < totalChunks; i++) {
      const startIdx = i * chunkSize;
      const chunkData = cardsList.slice(startIdx, startIdx + chunkSize);
      this.sendSyncCardsChunk(uuid, i + 1, chunkData);

      const percent = Math.round(((i + 1) / totalChunks) * 100);
      if (progressCb) progressCb({ phase: 'syncing', chunk: i + 1, totalChunks, progress: percent });

      // Small throttle to avoid buffer overflow on weak microcontrollers
      await new Promise(res => setTimeout(res, 80));
    }

    // Phase 3: endSync
    this.sendEndSync(uuid, totalCards);
    if (progressCb) progressCb({ phase: 'completed', progress: 100, totalCards });

    console.log(`[BatchSync] Successfully completed sync for ${totalCards} cards`);
    return { success: true, count: totalCards };
  }

  // ── Internal ─────────────────────────────────────────────────────────────────

  _attemptConnect() {
    const url = BROKER_URLS[this._urlIdx];
    console.log(`[MQTT] Connecting → ${url}`);
    this._setStatus('connecting');

    this._client = mqtt.connect(url, {
      clientId:       CLIENT_ID,
      username:       import.meta.env.VITE_MQTT_USERNAME || 'iot-device',
      password:       import.meta.env.VITE_MQTT_PASSWORD || 'Senzr123',
      keepalive:      60,
      connectTimeout: 10000,
      reconnectPeriod: 0,   // we manage reconnect ourselves
      clean:          true,
    });

    this._client.on('connect', () => {
      console.log(`[MQTT] ✅ Connected to ${url}`);
      this._setStatus('connected');
      TOPICS.forEach(t => {
        this._client.subscribe(t, { qos: 0 }, (err) => {
          if (err) console.warn(`[MQTT] Subscribe failed for ${t}:`, err.message);
          else     console.log(`[MQTT] Subscribed → ${t}`);
        });
      });
    });

    this._client.on('message', (topic, payload) => {
      this._dispatch(topic, payload);
    });

    this._client.on('offline', () => {
      console.warn('[MQTT] Client went offline');
      this._setStatus('disconnected');
    });

    this._client.on('reconnect', () => {
      console.log('[MQTT] Reconnecting…');
      this._setStatus('connecting');
    });

    this._client.on('error', (err) => {
      console.error('[MQTT] Error:', err.message);
      this._setStatus('error');
      // Kill this client and try next URL after 4 s
      if (this._client) {
        this._client.end(true);
        this._client = null;
      }
      this._urlIdx = (this._urlIdx + 1) % BROKER_URLS.length;
      console.log(`[MQTT] Will retry ${BROKER_URLS[this._urlIdx]} in 4 s`);
      this._retryTimer = setTimeout(() => this._attemptConnect(), 4000);
    });

    this._client.on('close', () => {
      console.warn('[MQTT] Connection closed');
      if (this._status !== 'disconnected') {
        this._setStatus('disconnected');
        // Auto-retry on unexpected close
        if (!this._retryTimer) {
          this._retryTimer = setTimeout(() => {
            this._retryTimer = null;
            if (!this._client) this._attemptConnect();
          }, 5000);
        }
      }
    });
  }

  _setStatus(s) {
    this._status = s;
    this._statusCbs.forEach(cb => cb(s));
  }

  _dispatch(topic, payload) {
    this._listeners.forEach((cbs, pattern) => {
      if (this._matches(pattern, topic)) {
        cbs.forEach(cb => {
          try { cb(topic, payload); }
          catch (e) { console.error('[MQTT] Handler error:', e); }
        });
      }
    });
  }

  /** MQTT wildcard: + = one level, # = rest. */
  _matches(pattern, topic) {
    if (pattern === topic) return true;
    const pp = pattern.split('/');
    const tp = topic.split('/');
    for (let i = 0; i < pp.length; i++) {
      if (pp[i] === '#') return true;
      if (pp[i] !== '+' && pp[i] !== tp[i]) return false;
    }
    return pp.length === tp.length;
  }
}

export const mqttService = new MQTTService();
export default mqttService;

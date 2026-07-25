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

// ── Broker endpoints (tried in order) ─────────────────────────────────────────
const BROKER_URLS = [
  'wss://mqtt.fieldseasy.com/mqtt',     // secure WS (port 443)
  'ws://mqtt.fieldseasy.com:9001/mqtt', // Mosquitto default WS
  'ws://mqtt.fieldseasy.com:8083/mqtt', // alternative WS
];

const TOPICS = [
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

  /** Publish a message to a specific topic. */
  publish(topic, payload, options = { qos: 0, retain: false }) {
    if (!this._client || this._status !== 'connected') {
      console.warn('[MQTT] Cannot publish - client disconnected');
      return false;
    }
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this._client.publish(topic, message, options, (err) => {
      if (err) console.error(`[MQTT] Publish failed for ${topic}:`, err.message);
      else console.log(`[MQTT] Published to ${topic}`);
    });
    return true;
  }

  get status() { return this._status; }

  // ── Internal ─────────────────────────────────────────────────────────────────

  _attemptConnect() {
    const url = BROKER_URLS[this._urlIdx];
    console.log(`[MQTT] Connecting → ${url}`);
    this._setStatus('connecting');

    this._client = mqtt.connect(url, {
      clientId:       CLIENT_ID,
      username:       import.meta.env.VITE_MQTT_USERNAME,
      password:       import.meta.env.VITE_MQTT_PASSWORD,
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

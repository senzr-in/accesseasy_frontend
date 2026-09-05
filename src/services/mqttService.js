/**
 * mqttService.js  -  Singleton MQTT client (WebSocket) for AccessEasy.
 *
 * Broker: mqtt.fieldseasy.com
 * Topics:
 *   frigate/events                           - person & plate detection events
 *   frigate/+/person                         - live person count per camera
 *   frigate/+/person/snapshot                - JPEG bytes (person snapshot)
 *   frigate/+/license_plate/snapshot         - LP snapshot filename
 *   frigate/+/license_plate/snapshot/bytes/+ - base64 annotated LP JPEG
 *   device/fieldeasy_mobile/+/location       - live guard GPS telemetry from mobile app
 *   patrol/+/alert                           - live patrol alerts & incident updates
 *   patrol/+/sos                             - instant SOS panic alerts
 *   patrol/+/log                             - checkpoint scan logs
 */

import mqtt from 'mqtt';
import { appConfigService } from '@/services/appConfigService';

const mqttConfig = appConfigService.getMqttConfig();

const BROKER_URLS = [
  mqttConfig.brokerUrl,
];

const TOPICS = [
  // Canonical Contract Topics
  'accesseasy/+/sites/+/guards/+/location',
  'accesseasy/+/sites/+/alerts/sos',
  'accesseasy/+/sites/+/alerts/+',
  'accesseasy/+/sites/+/alerts/incident',
  'accesseasy/+/patrols/+/checkpoints',
  'accesseasy/+/patrols/+/status',
  'accesseasy/+/devices/+/telemetry',
  // Backward compatibility legacy topics
  'fieldeasy_mobile/+/location',
  'device/fieldeasy_mobile/+/location',
  'patrol/+/alert',
  'patrol/+/sos',
  'patrol/alerts/sos/+',
  'patrol/live/+/+',
  // Frigate Camera Events
  'frigate/events',
  'frigate/+/person',
  'frigate/+/person/snapshot',
  'frigate/+/license_plate/snapshot',
  'frigate/+/license_plate/snapshot/bytes/+'
];

const CLIENT_ID = 'accesseasy-' + Math.random().toString(36).slice(2, 8);

class MQTTService {
  constructor() {
    this._client      = null;
    this._urlIdx      = 0;
    this._retryTimer  = null;
    this._status      = 'disconnected';
    this._statusCbs   = new Set();
    this._listeners   = new Map();
  }

  connect() {
    if (this._client) {
      return;
    }
    this._attemptConnect();
  }

  disconnect() {
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
      this._retryTimer = null;
    }
    if (this._client) {
      this._client.end(true);
      this._client = null;
    }
    this._setStatus('disconnected');
  }

  on(pattern, cb) {
    if (!this._listeners.has(pattern)) this._listeners.set(pattern, new Set());
    this._listeners.get(pattern).add(cb);
    if (this._client && this._status === 'connected') {
      this._client.subscribe(pattern, { qos: 0 });
    }
    return () => this._listeners.get(pattern)?.delete(cb);
  }

  onStatus(cb) {
    this._statusCbs.add(cb);
    cb(this._status);
    return () => this._statusCbs.delete(cb);
  }

  publish(topic, payload, options = { qos: 0, retain: false }) {
    if (!this._client || this._status !== 'connected') {
      return false;
    }
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this._client.publish(topic, message, options, (err) => {
      if (err) console.error('[MQTT] Publish failed for ' + topic + ':', err.message);
    });
    return true;
  }

  get status() { return this._status; }

  _attemptConnect() {
    const url = BROKER_URLS[this._urlIdx];
    this._setStatus('connecting');

    this._client = mqtt.connect(url, {
      clientId:       CLIENT_ID,
      username:       mqttConfig.username,
      password:       mqttConfig.password,
      keepalive:      60,
      connectTimeout: 10000,
      reconnectPeriod: 0,
      clean:          true,
    });

    this._client.on('connect', () => {
      this._setStatus('connected');
      TOPICS.forEach(t => {
        this._client.subscribe(t, { qos: 0 });
      });
      this._listeners.forEach((_, pattern) => {
        if (!TOPICS.includes(pattern)) {
          this._client.subscribe(pattern, { qos: 0 });
        }
      });
    });

    this._client.on('message', (topic, payload) => {
      this._dispatch(topic, payload);
    });

    this._client.on('offline', () => {
      this._setStatus('disconnected');
    });

    this._client.on('reconnect', () => {
      this._setStatus('connecting');
    });

    this._client.on('error', (err) => {
      this._setStatus('error');
      if (this._client) {
        this._client.end(true);
        this._client = null;
      }
      this._urlIdx = (this._urlIdx + 1) % BROKER_URLS.length;
      this._retryTimer = setTimeout(() => this._attemptConnect(), 4000);
    });

    this._client.on('close', () => {
      if (this._status !== 'disconnected') {
        this._setStatus('disconnected');
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

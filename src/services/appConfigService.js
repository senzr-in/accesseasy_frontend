/**
 * Centralized Application & Map Config Service
 * Supplies map configurations, Knative endpoints, and MQTT parameters
 */
class AppConfigService {
  constructor() {
    this._config = {
      // Map & Geolocation Configurations
      maps: {
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        defaultCenter: { lat: 12.9716, lng: 77.5946 }, // Bangalore default
        defaultZoom: 14,
        maxGeofenceRadiusMeters: 500,
        defaultGeofenceRadiusMeters: 50,
        minGpsAccuracyMeters: 35
      },

      // Knative Serverless Endpoints
      knative: {
        baseUrl: import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn',
        endpoints: {
          initialSettings: '/initial-settings',
          deviceMqtt: '/device-mqtt',
          paymentProcedure: '/payment-procedure',
          biometricEmbedding: '/biometric-embedding',
          offlineBatchSync: '/offline-batch-sync',
          patrolTelemetryIngest: '/patrol-telemetry-ingest',
          sosAlertBroadcast: '/sos-alert-broadcast',
          reportPdfGenerator: '/report-pdf-generator',
          visitorPortal: '/visitor-portal-flow',
          googleAuth: '/google-accesseasy'
        }
      },

      // Notifications & Admin Alerts
      notifications: {
        adminNotifyEmail: 'sudheesh@iwinxdital.com'
      },

      // Real-time MQTT Broker
      mqtt: {
        brokerUrl: import.meta.env.VITE_MQTT_BROKER_URL || 'wss://mqtt.fieldseasy.com/mqtt',
        username: import.meta.env.VITE_MQTT_USERNAME || 'iot-device',
        password: import.meta.env.VITE_MQTT_PASSWORD || 'Senzr123',
        reconnectPeriodMs: 5000,
        topicPatterns: {
          livePatrol: (tenantId, guardId) => `patrol/live/${tenantId}/${guardId || '+'}`,
          deviceLocation: (tenantId, deviceId) => `device/location/${tenantId}/${deviceId || '+'}`,
          sosAlerts: (tenantId) => `patrol/alerts/sos/${tenantId || '+'}`
        }
      },

      // Backend Directus API
      api: {
        baseUrl: import.meta.env.VITE_API_URL || 'https://appv1.fieldseasy.com/directus',
        uiUrl: import.meta.env.VITE_UI_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://patrol.fieldseasy.com')
      }
    };
  }

  /**
   * Get entire config object
   */
  getConfig() {
    return this._config;
  }

  /**
   * Get Map configuration
   */
  getMapConfig() {
    return this._config.maps;
  }

  /**
   * Get Knative configuration & URL resolver
   */
  getKnativeConfig() {
    return this._config.knative;
  }

  /**
   * Resolve specific Knative service full URL
   */
  getKnativeEndpointUrl(serviceName) {
    const path = this._config.knative.endpoints[serviceName] || `/${serviceName}`;
    return `${this._config.knative.baseUrl}${path}`;
  }

  /**
   * Get MQTT broker configuration
   */
  getMqttConfig() {
    return this._config.mqtt;
  }

  /**
   * Get Google Maps API Key (Sync)
   */
  getGoogleMapsApiKey() {
    return this._config.maps.googleMapsApiKey || localStorage.getItem('knative_google_maps_api_key') || '';
  }

  /**
   * Set Google Maps API Key dynamically
   */
  setGoogleMapsApiKey(key) {
    if (key) {
      this._config.maps.googleMapsApiKey = key;
      localStorage.setItem('knative_google_maps_api_key', key);
    }
  }

  /**
   * Fetch Google Maps API Key dynamically from Knative Serverless Endpoint
   */
  async getGoogleMapsApiKeyAsync() {
    if (this._config.maps.googleMapsApiKey) {
      return this._config.maps.googleMapsApiKey;
    }
    const cached = localStorage.getItem('knative_google_maps_api_key');
    if (cached) {
      this._config.maps.googleMapsApiKey = cached;
      return cached;
    }
    try {
      const res = await fetch(`${this._config.knative.baseUrl}/initial-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_maps_config', service: 'google-maps' })
      });
      if (res.ok) {
        const data = await res.json();
        const key = data.googleMapsApiKey || data.apiKey || data.mapsKey || data.key;
        if (key) {
          this.setGoogleMapsApiKey(key);
          return key;
        }
      }
    } catch (e) {
      console.warn('[AppConfigService] Could not fetch Google Maps key from Knative:', e.message);
    }
    return this._config.maps.googleMapsApiKey;
  }

  /**
   * Get Admin Notification Email
   */
  getAdminNotifyEmail() {
    return this._config.notifications.adminNotifyEmail;
  }
}

export const appConfigService = new AppConfigService();
export default appConfigService;

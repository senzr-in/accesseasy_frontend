/**
 * fotaService.js
 *
 * Client service for Knative FOTA (Firmware Over-The-Air) Microservice:
 * Referencing Knative function: fota-service
 *
 * Features:
 * - Real-time auto-reconnecting SSE telemetry stream (/api/fota/stream)
 * - Fleet gateway and controller device status (/api/fota/devices)
 * - S3 Latest firmware release metadata (/api/fota/latest)
 * - S3 Available firmware bundle packages list (/api/fota/releases)
 * - Multipart upload for new firmware releases (.zip, .tar.gz, .bin) (/api/fota/upload)
 * - Over-The-Air deployment trigger with dual checksum support (SHA-256 + MD5) (/api/fota/deploy)
 */

import axios from 'axios';
import { authService } from './authService.js';

const KNATIVE_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_KN_API_URL) ||
  'https://appv1.fieldseasy.com/kn';

// Knative FOTA service base URL
const FOTA_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FOTA_API_URL) ||
  `${KNATIVE_BASE_URL}/fota-service`;

const apiClient = axios.create({
  baseURL: FOTA_BASE_URL,
  timeout: 45000,
});

apiClient.interceptors.request.use((config) => {
  const token = authService.getToken() || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper with fallback if routed with or without /fota-service prefix
async function requestWithFallback(method, path, data = null, customConfig = {}) {
  try {
    const config = { ...customConfig, method, url: path };
    if (data) config.data = data;
    const res = await apiClient(config);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404 && FOTA_BASE_URL.includes('/fota-service')) {
      try {
        const fallbackUrl = `${KNATIVE_BASE_URL}${path}`;
        const token = authService.getToken() || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_TOKEN);
        const res = await axios({
          method,
          url: fallbackUrl,
          data,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            ...(customConfig.headers || {}),
          },
          timeout: 45000,
        });
        return res.data;
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw err;
  }
}

class FotaService {
  /**
   * Check FOTA service health
   */
  async checkHealth() {
    try {
      return await requestWithFallback('GET', '/healthz');
    } catch {
      return { status: 'offline' };
    }
  }

  /**
   * 1. Get all registered edge devices and current fleet status
   */
  async getDevices() {
    try {
      return await requestWithFallback('GET', '/api/fota/devices');
    } catch (err) {
      console.warn('[fotaService] getDevices error:', err.message);
      return { count: 0, devices: [] };
    }
  }

  /** Alias for getDevices */
  async getFleetDevices() {
    return this.getDevices();
  }

  /**
   * 2. Get Available Firmware Releases stored on S3
   */
  async getAvailableReleases() {
    try {
      const res = await requestWithFallback('GET', '/api/fota/releases');
      return res?.releases || (Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('[fotaService] getAvailableReleases error:', err.message);
      return [];
    }
  }

  /** Alias for getAvailableReleases */
  async getReleases() {
    try {
      const res = await requestWithFallback('GET', '/api/fota/releases');
      return res?.releases ? res : { releases: res || [] };
    } catch (err) {
      console.warn('[fotaService] getReleases error:', err.message);
      return { releases: [] };
    }
  }

  /**
   * 3. Get Latest Release Metadata from S3
   */
  async getLatestRelease() {
    try {
      return await requestWithFallback('GET', '/api/fota/latest');
    } catch (err) {
      console.warn('[fotaService] getLatestRelease error:', err.message);
      return null;
    }
  }

  /**
   * 4. Upload New Firmware Binary (.zip / .tar.gz / .bin) to S3 with optional auto-deploy
   */
  async uploadRelease(
    { file, version, changelog, autoDeploy = true, deviceId = 'all', reboot = false, onProgress },
    legacyOnProgress
  ) {
    const progressCallback = onProgress || legacyOnProgress;
    const targetId = deviceId || 'all';

    const formData = new FormData();
    formData.append('file', file);
    if (version) formData.append('version', version);
    formData.append('changelog', changelog || 'OTA firmware update');
    formData.append('autoDeploy', String(autoDeploy));
    formData.append('deviceId', targetId);
    formData.append('mac', targetId);
    formData.append('uuid', targetId);
    formData.append('device_id', targetId);
    formData.append('reboot', String(reboot));

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressCallback && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          progressCallback(percent);
        }
      },
    };

    return await requestWithFallback('POST', '/api/fota/upload', formData, config);
  }

  /**
   * 5. Deploy an Existing S3 Release Directly (Without re-uploading)
   * Supports Dual Checksum (SHA-256 for Linux Edge Gateways & MD5 for MCU controllers)
   */
  async deployRelease({ deviceId, version, customUrl, checksum, sha256, md5, reboot = false }) {
    const targetId = deviceId || 'all';
    const shaChecksum = checksum || sha256 || '';

    const payload = {
      deviceId: targetId,
      mac: targetId,
      uuid: targetId,
      device_id: targetId,
      version: version || '',
      customUrl: customUrl || '',
      checksum: shaChecksum,
      sha256: shaChecksum,
      md5: md5 || '',
      reboot: Boolean(reboot),
    };

    return await requestWithFallback('POST', '/api/fota/deploy', payload);
  }

  /** Alias for deployRelease */
  async deployUpdate(params) {
    return this.deployRelease(params);
  }

  /**
   * 6. Real-Time Auto-Reconnecting SSE Stream Subscription
   */
  subscribeTelemetryStream(onMessage, onError) {
    const streamUrl = `${FOTA_BASE_URL}/api/fota/stream`;
    let eventSource = null;
    let isClosed = false;
    let reconnectTimeout = null;

    const connect = () => {
      if (isClosed) return;

      try {
        eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
          } catch (e) {
            console.warn('[fotaService] SSE unparseable message:', event.data);
          }
        };

        eventSource.onerror = (err) => {
          console.warn('[fotaService] SSE stream notice / disconnect:', err);
          if (onError) onError(err);

          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          if (!isClosed && !reconnectTimeout) {
            reconnectTimeout = setTimeout(() => {
              reconnectTimeout = null;
              connect();
            }, 5000);
          }
        };
      } catch (e) {
        console.warn('[fotaService] Could not initialize EventSource:', e);
        if (onError) onError(e);
      }
    };

    connect();

    return () => {
      isClosed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }
}

export const fotaService = new FotaService();
export default fotaService;

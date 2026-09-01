import axios from 'axios';
import { authService } from '@/services/authService';
import { webFaceEmbeddingService } from '@/services/webFaceEmbeddingService';
import { appConfigService } from '@/services/appConfigService';

/**
 * Unified Knative Serverless Client Service
 * Bridges Web App with Knative serverless microservices hosted at VITE_KN_API_URL
 */
class KnativeService {
  constructor() {
    this.baseUrl = appConfigService.getKnativeConfig().baseUrl;
  }

  /**
   * Helper to create authenticated HTTP headers
   */
  getHeaders(customHeaders = {}) {
    const token = authService.getToken();
    const tenantId = authService.getTenantId();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
      ...customHeaders
    };
  }

  /**
   * 1. 📡 Device MQTT Knative Bridge (/device-mqtt)
   * Dispatches downlink control commands to access controllers & IoT boards
   */
  async sendDeviceCommand(payload) {
    try {
      const res = await axios.post(`${this.baseUrl}/device-mqtt`, payload, {
        headers: this.getHeaders(),
        timeout: 10000
      });
      return res.data;
    } catch (error) {
      console.error('[KnativeService] /device-mqtt command failed:', error);
      throw error;
    }
  }

  /**
   * 2. 💳 Payment & Subscription Procedure (/payment-procedure)
   * Executes Razorpay/Cashfree order creation and webhook validation
   */
  async processPayment(payload) {
    try {
      const res = await axios.post(`${this.baseUrl}/payment-procedure`, payload, {
        headers: this.getHeaders(),
        timeout: 15000
      });
      return res.data;
    } catch (error) {
      console.error('[KnativeService] /payment-procedure failed:', error);
      throw error;
    }
  }

  /**
   * 3. 👤 AI Biometric Face Embedding Extraction (/biometric-embedding)
   * Extracts 192-d MobileFaceNet vector server-side with client-side fallback
   */
  async extractFaceEmbedding({ file, base64Image }) {
    try {
      // Attempt serverless Knative inference
      const payload = {
        image: base64Image || null,
        dimension: 192,
        model: 'MobileFaceNet'
      };

      const res = await axios.post(`${this.baseUrl}/biometric-embedding`, payload, {
        headers: this.getHeaders(),
        timeout: 8000
      });

      if (res.data?.success && res.data?.embedding) {
        return res.data;
      }
    } catch (knativeErr) {
      console.warn('[KnativeService] Serverless /biometric-embedding unreachable. Falling back to local WebAssembly TensorFlow inference:', knativeErr?.message);
    }

    // High-speed on-device WebAssembly fallback
    if (file) {
      return await webFaceEmbeddingService.processImageFile(file);
    } else if (base64Image) {
      const img = await webFaceEmbeddingService.loadImage(base64Image);
      const { canvas, croppedDataUrl, box, totalFaces } = await webFaceEmbeddingService.detectAndCropFace(img);
      const embedding = webFaceEmbeddingService.generateEmbedding(canvas);
      return {
        success: true,
        embedding,
        base64Image,
        croppedDataUrl,
        totalFacesDetected: totalFaces,
        faceBox: box
      };
    }

    throw new Error('No valid image file or Base64 string provided for face embedding.');
  }

  /**
   * 4. 📴 Offline Batch Sync Queue Ingestion (/offline-batch-sync)
   * Ingests array of offline attendance punches, checkpoint scans, and odometer readings
   */
  async syncOfflineBatch(syncItems = []) {
    if (!syncItems || syncItems.length === 0) return { success: true, count: 0 };

    try {
      const tenantId = authService.getTenantId();
      const payload = {
        tenantId,
        syncedAt: new Date().toISOString(),
        items: syncItems
      };

      const res = await axios.post(`${this.baseUrl}/offline-batch-sync`, payload, {
        headers: this.getHeaders(),
        timeout: 20000
      });
      return res.data;
    } catch (error) {
      console.error('[KnativeService] /offline-batch-sync failed:', error);
      throw error;
    }
  }

  /**
   * 5. 📍 Patrol Telemetry & Geofence Evaluator (/patrol-telemetry-ingest)
   * High-velocity GPS ingestion and live breadcrumb calculation
   */
  async ingestPatrolTelemetry(telemetryPayload) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        tenantId,
        ...telemetryPayload,
        timestamp: telemetryPayload.timestamp || new Date().toISOString()
      };

      const res = await axios.post(`${this.baseUrl}/patrol-telemetry-ingest`, payload, {
        headers: this.getHeaders(),
        timeout: 5000
      });
      return res.data;
    } catch (error) {
      console.warn('[KnativeService] /patrol-telemetry-ingest notice:', error?.message);
      return { success: false, error: error?.message };
    }
  }

  /**
   * 6. 🚨 SOS Emergency Alert Broadcast (/sos-alert-broadcast)
   * Dispatches emergency takeover banners and push notifications
   */
  async broadcastSosAlert(alertPayload) {
    try {
      const tenantId = authService.getTenantId();
      const payload = {
        tenantId,
        priority: 'CRITICAL_EMERGENCY',
        triggeredAt: new Date().toISOString(),
        ...alertPayload
      };

      const res = await axios.post(`${this.baseUrl}/sos-alert-broadcast`, payload, {
        headers: this.getHeaders(),
        timeout: 8000
      });
      return res.data;
    } catch (error) {
      console.error('[KnativeService] /sos-alert-broadcast failed:', error);
      throw error;
    }
  }

  /**
   * 7. 📄 Async PDF & Report Generator (/report-pdf-generator)
   * Headless rendering container for shift summaries, odometer logs & work orders
   */
  async generateReportPdf(reportParams) {
    try {
      const tenantId = authService.getTenantId();
      const res = await axios.post(`${this.baseUrl}/report-pdf-generator`, {
        tenantId,
        ...reportParams
      }, {
        headers: this.getHeaders(),
        responseType: 'blob',
        timeout: 30000
      });
      return res.data;
    } catch (error) {
      console.error('[KnativeService] /report-pdf-generator failed:', error);
      throw error;
    }
  }
}

export const knativeService = new KnativeService();
export default knativeService;

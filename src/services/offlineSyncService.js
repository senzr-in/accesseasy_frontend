import { authService } from '@/services/authService';
import { knativeService } from '@/services/knativeService';

/**
 * Offline Sync Service
 * Manages local queued events and batch synchronization with Knative serverless backend
 */
class OfflineSyncService {
  constructor() {
    this.QUEUE_KEY = 'accesseasy_offline_sync_queue';
    this.isSyncing = false;
  }

  /**
   * Get all queued items from localStorage
   */
  getQueue() {
    try {
      const tenantId = authService.getTenantId() || 'default';
      const stored = localStorage.getItem(`${this.QUEUE_KEY}_${tenantId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('[OfflineSyncService] Failed to read queue:', e);
      return [];
    }
  }

  /**
   * Save queue to localStorage
   */
  saveQueue(queue) {
    try {
      const tenantId = authService.getTenantId() || 'default';
      localStorage.setItem(`${this.QUEUE_KEY}_${tenantId}`, JSON.stringify(queue));
    } catch (e) {
      console.error('[OfflineSyncService] Failed to persist queue:', e);
    }
  }

  /**
   * Enqueue a new action (Attendance punch, checkpoint scan, odometer reading)
   */
  enqueue(eventType, payload) {
    const queue = this.getQueue();
    const syncItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType, // 'ATTENDANCE_PUNCH', 'CHECKPOINT_SCAN', 'ODOMETER_LOG', 'INCIDENT_REPORT'
      payload,
      createdAtDevice: new Date().toISOString(),
      isSynced: false,
      retryCount: 0
    };

    queue.push(syncItem);
    this.saveQueue(queue);
    console.log(`[OfflineSyncService] Enqueued ${eventType} (ID: ${syncItem.id}). Total in queue: ${queue.length}`);

    // Auto-trigger sync if online
    if (navigator.onLine) {
      this.drainQueue();
    }

    return syncItem;
  }

  /**
   * Drain and synchronize all pending items with Knative serverless endpoint
   */
  async drainQueue() {
    if (this.isSyncing) return;
    const queue = this.getQueue();
    if (queue.length === 0) return { success: true, count: 0 };

    this.isSyncing = true;
    console.log(`[OfflineSyncService] Draining ${queue.length} pending items...`);

    try {
      // 1. Dispatch batch to Knative endpoint /offline-batch-sync
      const response = await knativeService.syncOfflineBatch(queue);

      if (response?.success) {
        // Clear successfully synced items
        this.saveQueue([]);
        console.log(`[OfflineSyncService] ✅ Successfully synced ${queue.length} items to Knative.`);
        return { success: true, count: queue.length };
      }
    } catch (error) {
      console.warn('[OfflineSyncService] Knative batch sync failed, attempting individual Directus fallbacks:', error?.message);

      // Fallback: Attempt individual Directus API ingestion
      const remainingQueue = [];
      for (const item of queue) {
        try {
          await this._syncSingleItem(item);
        } catch (itemErr) {
          item.retryCount = (item.retryCount || 0) + 1;
          remainingQueue.push(item);
        }
      }
      this.saveQueue(remainingQueue);
      return { success: remainingQueue.length === 0, count: queue.length - remainingQueue.length };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Fallback ingestion per item
   */
  async _syncSingleItem(item) {
    const tenantId = authService.getTenantId();
    if (item.eventType === 'ATTENDANCE_PUNCH') {
      await authService.protectedApi.post('/items/attendance', {
        ...item.payload,
        tenant: tenantId,
        created_at_device: item.createdAtDevice
      });
    } else if (item.eventType === 'CHECKPOINT_SCAN') {
      await authService.protectedApi.post('/items/patrol_logs', {
        ...item.payload,
        tenant: tenantId,
        scanned_at_device: item.createdAtDevice
      });
    } else if (item.eventType === 'INCIDENT_REPORT') {
      await authService.protectedApi.post('/items/patrol_alerts', {
        ...item.payload,
        tenant: tenantId,
        reported_at_device: item.createdAtDevice
      });
    }
  }
}

export const offlineSyncService = new OfflineSyncService();
export default offlineSyncService;

/**
 * Correlation Engine Service
 * 
 * This service is responsible for receiving physical access swipe events and camera detections,
 * and correlating them based on time windows to produce unified "smart" events, without relying
 * on paid external AI APIs.
 */

export class CorrelationEngine {
  constructor(timeWindowMs = 5000) {
    this.timeWindowMs = timeWindowMs;
    this.swipeEvents = [];
    this.cameraEvents = [];
    this.unifiedEvents = [];
    this.subscribers = [];
  }

  /**
   * Subscribe to new unified events
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  _notifySubscribers(event) {
    this.subscribers.forEach(cb => cb(event));
  }

  /**
   * Add a new Swipe Event (RFID/Card Access)
   * @param {Object} event { id, timestamp, employeeName, doorId, cardId, profilePic }
   */
  addSwipeEvent(event) {
    const enrichedEvent = { ...event, type: 'swipe', processed: false };
    this.swipeEvents.push(enrichedEvent);
    this._correlate();
  }

  /**
   * Add a new Camera Event (Frigate Detection)
   * @param {Object} event { id, timestamp, doorId, snapshotUrl, clipUrl }
   */
  addCameraEvent(event) {
    const enrichedEvent = { ...event, type: 'camera', processed: false };
    this.cameraEvents.push(enrichedEvent);
    this._correlate();
  }

  /**
   * Core logic to correlate events within the time window.
   */
  _correlate() {
    const now = Date.now();
    
    // Process unprocessed camera events
    for (const cameraEvent of this.cameraEvents) {
      if (cameraEvent.processed) continue;

      // Find matching swipe event (Relaxed doorId matching for demo purposes)
      const matchingSwipe = this.swipeEvents.find(swipe => 
        !swipe.processed &&
        Math.abs(new Date(swipe.timestamp).getTime() - new Date(cameraEvent.timestamp).getTime()) <= this.timeWindowMs
      );

      if (matchingSwipe) {
        // We have a match!
        cameraEvent.processed = true;
        matchingSwipe.processed = true;

        const unifiedEvent = {
          id: `unified_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: matchingSwipe.timestamp,
          doorId: matchingSwipe.doorId,
          swipeDetails: matchingSwipe,
          cameraDetails: cameraEvent,
          status: 'Matched Access',
          alertLevel: 'info',
          summary: `Access granted to ${matchingSwipe.employeeName}. Visual confirmation matched.`
        };

        this.unifiedEvents.push(unifiedEvent);
        this._notifySubscribers(unifiedEvent);
      } else {
        // No match found yet. Check if the camera event is older than the time window.
        // In a real system, we would maintain a mapping between Frigate camera names (e.g. 'front_door') 
        // and access control UUIDs (e.g. 'a1b2c3d4'). For the sake of this demo/MVP, we will relax this constraint
        // and match any camera event with any swipe event that happens concurrently.
        const timeDiff = now - new Date(cameraEvent.timestamp).getTime();
        if (timeDiff > this.timeWindowMs) {
          cameraEvent.processed = true;
          
          const unifiedEvent = {
            id: `unified_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            timestamp: cameraEvent.timestamp,
            doorId: cameraEvent.doorId,
            swipeDetails: null,
            cameraDetails: cameraEvent,
            status: 'Unknown Entry',
            alertLevel: 'error',
            summary: 'Person detected at door but no valid swipe was recorded within the time window.'
          };

          this.unifiedEvents.push(unifiedEvent);
          this._notifySubscribers(unifiedEvent);
        }
      }
    }

    // Clean up old processed events to prevent memory leaks
    this._cleanup();
  }

  _cleanup() {
    // Remove processed events older than 1 minute
    const oneMinuteAgo = Date.now() - 60000;
    this.swipeEvents = this.swipeEvents.filter(e => !e.processed || new Date(e.timestamp).getTime() > oneMinuteAgo);
    this.cameraEvents = this.cameraEvents.filter(e => !e.processed || new Date(e.timestamp).getTime() > oneMinuteAgo);
    
    // Keep only the last 100 unified events in memory
    if (this.unifiedEvents.length > 100) {
      this.unifiedEvents = this.unifiedEvents.slice(-100);
    }
  }
}

// Export a singleton instance
export const correlationEngine = new CorrelationEngine(5000); // 5 seconds window
